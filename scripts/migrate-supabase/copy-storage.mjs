#!/usr/bin/env node
/**
 * Copy all files from OLD Supabase Storage bucket → NEW bucket (same paths).
 *
 * Usage (from server/ so @supabase/supabase-js resolves):
 *   cd server
 *   OLD_SUPABASE_URL=https://sjcjzvtjrvmzhtkfhtag.supabase.co \
 *   OLD_SERVICE_ROLE_KEY=eyJ... \
 *   NEW_SUPABASE_URL=https://xcydigxeazgxndgxmohk.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=eyJ... \
 *   node ../scripts/migrate-supabase/copy-storage.mjs
 *
 * Optional: BUCKET=signature-images  DRY_RUN=1
 */
import { createClient } from '@supabase/supabase-js';

const bucket = process.env.BUCKET?.trim() || 'signature-images';
const dryRun = process.env.DRY_RUN === '1';

const oldUrl = process.env.OLD_SUPABASE_URL?.trim();
const oldKey = process.env.OLD_SERVICE_ROLE_KEY?.trim();
const newUrl = process.env.NEW_SUPABASE_URL?.trim();
const newKey = process.env.NEW_SERVICE_ROLE_KEY?.trim();

if (!oldUrl || !oldKey || !newUrl || !newKey) {
  console.error('Set OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY, NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY');
  process.exit(1);
}

const oldSb = createClient(oldUrl, oldKey, { auth: { persistSession: false } });
const newSb = createClient(newUrl, newKey, { auth: { persistSession: false } });

async function listAll(prefix = '') {
  const out = [];
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const { data, error } = await oldSb.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    if (!data?.length) break;
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        out.push(...(await listAll(path)));
      } else {
        out.push(path);
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return out;
}

async function ensureBucket() {
  const { data: buckets } = await newSb.storage.listBuckets();
  if (buckets?.some((b) => b.name === bucket)) return;
  const { error } = await newSb.storage.createBucket(bucket, { public: true });
  if (error && !/already exists/i.test(error.message)) throw error;
}

async function main() {
  console.log(`Listing objects in ${bucket} (old project)...`);
  const paths = await listAll();
  console.log(`Found ${paths.length} files.`);

  if (dryRun) {
    paths.slice(0, 20).forEach((p) => console.log('  ', p));
    if (paths.length > 20) console.log(`  ... and ${paths.length - 20} more`);
    return;
  }

  await ensureBucket();

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    try {
      const { data: blob, error: dlErr } = await oldSb.storage.from(bucket).download(path);
      if (dlErr) throw dlErr;
      const buf = Buffer.from(await blob.arrayBuffer());
      const contentType = blob.type || 'application/octet-stream';
      const { error: upErr } = await newSb.storage.from(bucket).upload(path, buf, {
        contentType,
        upsert: true,
      });
      if (upErr) throw upErr;
      ok++;
      if ((i + 1) % 50 === 0 || i === paths.length - 1) {
        console.log(`  ${i + 1}/${paths.length} copied (${ok} ok, ${fail} failed)`);
      }
    } catch (e) {
      fail++;
      console.error(`FAIL ${path}:`, e.message || e);
    }
  }
  console.log(`Done. ${ok} copied, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
