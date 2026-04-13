/**
 * Upload static layout preview PNGs → Supabase Storage, then write
 * server/src/data/templatePreviewUrls.json so the gallery can use image thumbnails (Emailee-style).
 *
 * Looks for images in the first folder that exists (Windows-friendly):
 *   - `image templates/`  (space — common on Windows)
 *   - `image-templates/`
 *
 * Files: template_1.png … template_N.png (JPEG also accepted). Set TEMPLATE_IMAGE_UPLOAD_MAX (default 150).
 * Merges into existing JSON so
 * partial uploads don’t wipe other slugs.
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET in .env
 * Run: cd server && npm run upload:template-images
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'signature-images';

const REPO_ROOT = path.resolve(__dirname, '../../..');
const OUT_JSON = path.join(__dirname, '../data/templatePreviewUrls.json');

const IMAGE_DIR_CANDIDATES = [
  path.join(REPO_ROOT, 'image templates'),
  path.join(REPO_ROOT, 'image-templates'),
];

function resolveImageDir() {
  for (const dir of IMAGE_DIR_CANDIDATES) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  return null;
}

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEMPLATE_COUNT = Math.min(
  500,
  Math.max(1, parseInt(process.env.TEMPLATE_IMAGE_UPLOAD_MAX ?? '150', 10) || 150)
);

async function main() {
  const IMAGE_DIR = resolveImageDir();
  if (!IMAGE_DIR) {
    console.error('Missing folder. Create one of:');
    for (const d of IMAGE_DIR_CANDIDATES) console.error(' ', d);
    console.error(`Add template_1.png … template_${TEMPLATE_COUNT}.png (or .jpg)`);
    process.exit(1);
  }
  console.log('Using image folder:', IMAGE_DIR);

  let mapping = {};
  if (fs.existsSync(OUT_JSON)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'));
      if (prev && typeof prev === 'object') mapping = { ...prev };
    } catch {
      /* ignore */
    }
  }

  let uploadedCount = 0;
  for (let i = 1; i <= TEMPLATE_COUNT; i++) {
    const slug = `template_${i}`;
    const png = path.join(IMAGE_DIR, `${slug}.png`);
    const jpg = path.join(IMAGE_DIR, `${slug}.jpg`);
    const jpeg = path.join(IMAGE_DIR, `${slug}.jpeg`);
    let filePath = null;
    let contentType = 'image/png';
    if (fs.existsSync(png)) filePath = png;
    else if (fs.existsSync(jpg)) {
      filePath = jpg;
      contentType = 'image/jpeg';
    } else if (fs.existsSync(jpeg)) {
      filePath = jpeg;
      contentType = 'image/jpeg';
    }
    if (!filePath) {
      console.warn('Skip (no file):', slug);
      continue;
    }

    const storagePath = `template-designs/${slug}${contentType === 'image/png' ? '.png' : '.jpg'}`;
    const body = fs.readFileSync(filePath);
    const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType,
      upsert: true,
    });
    if (error) {
      console.error(slug, error.message);
      process.exit(1);
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    if (!pub?.publicUrl) {
      console.error('No public URL for', slug);
      process.exit(1);
    }
    mapping[slug] = pub.publicUrl;
    uploadedCount += 1;
    console.log(slug, '→', pub.publicUrl);
  }

  if (uploadedCount === 0) {
    console.error('No matching PNG/JPEG files found in:', IMAGE_DIR);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(mapping, null, 2), 'utf8');
  console.log('\nWrote', OUT_JSON);
  console.log('Restart the API server so template list picks up new URLs.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
