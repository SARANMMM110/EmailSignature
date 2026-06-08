#!/usr/bin/env node
/**
 * Copy storage when OLD project Storage API is restricted (402 quota).
 * Uses paths from NEW DB (storage.objects) + public HTTP GET from OLD bucket URLs.
 *
 *   cd server
 *   export NEW_DB_URL='postgresql://postgres:...@db.xcydigxeazgxndgxmohk.supabase.co:5432/postgres'
 *   export OLD_PUBLIC_STORAGE_BASE='https://sjcjzvtjrvmzhtkfhtag.supabase.co/storage/v1/object/public/signature-images'
 *   export NEW_SUPABASE_URL='https://xcydigxeazgxndgxmohk.supabase.co'
 *   export NEW_SERVICE_ROLE_KEY='eyJ...'
 *   DRY_RUN=1 node src/scripts/migrateSupabaseStoragePublic.mjs
 *   node src/scripts/migrateSupabaseStoragePublic.mjs
 */
import { spawnSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const bucket = process.env.BUCKET?.trim() || 'signature-images';
const dryRun = process.env.DRY_RUN === '1';
const dbUrl = process.env.NEW_DB_URL?.trim();
const oldPublicBase = process.env.OLD_PUBLIC_STORAGE_BASE?.trim();
const newUrl = process.env.NEW_SUPABASE_URL?.trim();
const newKey = process.env.NEW_SERVICE_ROLE_KEY?.trim();
const pathsFile = process.env.PATHS_FILE?.trim();

if (!dbUrl || !oldPublicBase || !newUrl || !newKey) {
  console.error('Set NEW_DB_URL, OLD_PUBLIC_STORAGE_BASE, NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY');
  process.exit(1);
}

function loadPathsFromDb() {
  const sql = `SELECT name FROM storage.objects WHERE bucket_id = '${bucket}' ORDER BY name`;
  const r = spawnSync('psql', [dbUrl, '-t', '-A', '-c', sql], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error('psql failed — check NEW_DB_URL');
  }
  return r.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

async function loadPaths() {
  if (pathsFile) {
    const { readFileSync } = await import('node:fs');
    return readFileSync(pathsFile, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return loadPathsFromDb();
}

function publicOldUrl(objectPath) {
  const segments = objectPath.split('/').map(encodeURIComponent).join('/');
  return `${oldPublicBase.replace(/\/$/, '')}/${segments}`;
}

async function ensureBucket(newSb) {
  const { data: buckets } = await newSb.storage.listBuckets();
  if (buckets?.some((b) => b.name === bucket)) return;
  const { error } = await newSb.storage.createBucket(bucket, { public: true });
  if (error && !/already exists/i.test(error.message)) throw error;
}

async function main() {
  const paths = await loadPaths();
  console.log(`Paths from DB: ${paths.length}`);

  if (dryRun) {
    if (paths.length > 0) {
      const sample = paths[0];
      const url = publicOldUrl(sample);
      console.log('Sample path:', sample);
      console.log('Sample URL:', url);
      const head = await fetch(url, { method: 'HEAD' });
      console.log('Sample HEAD status:', head.status, head.ok ? 'OK' : 'FAIL');
    }
    paths.slice(0, 15).forEach((p) => console.log(' ', p));
    if (paths.length > 15) console.log(`  ... and ${paths.length - 15} more`);
    return;
  }

  const newSb = createClient(newUrl, newKey, { auth: { persistSession: false } });
  await ensureBucket(newSb);

  let ok = 0;
  let fail = 0;
  let skip = 0;

  for (let i = 0; i < paths.length; i++) {
    const objectPath = paths[i];
    const url = publicOldUrl(objectPath);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          skip++;
          continue;
        }
        throw new Error(`GET ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      const { error: upErr } = await newSb.storage.from(bucket).upload(objectPath, buf, {
        contentType,
        upsert: true,
      });
      if (upErr) throw upErr;
      ok++;
      if ((i + 1) % 100 === 0 || i === paths.length - 1) {
        console.log(`  ${i + 1}/${paths.length} — ok ${ok}, fail ${fail}, skip ${skip}`);
      }
    } catch (e) {
      fail++;
      if (fail <= 20) console.error(`FAIL ${objectPath}:`, e.message || e);
    }
  }

  console.log(`Done. ${ok} copied, ${fail} failed, ${skip} skipped (404).`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
