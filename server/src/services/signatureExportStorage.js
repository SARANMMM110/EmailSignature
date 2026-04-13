/**
 * Upload Puppeteer-generated signature PNGs to Supabase Storage so pasted mail uses a public HTTPS URL.
 */
import { supabaseAdmin, getStorageBucket } from './supabase.js';

const PREFIX = 'generated-signatures';

/**
 * @param {Buffer} buf — PNG bytes
 * @param {string} fileName — e.g. signature-uuid.png
 * @returns {Promise<{ ok: true, publicUrl: string, path: string } | { ok: false, reason: string }>}
 */
export async function uploadGeneratedSignaturePng(buf, fileName) {
  if (!supabaseAdmin) {
    return { ok: false, reason: 'Supabase admin client not configured' };
  }
  const bucket = getStorageBucket();
  const objectPath = `${PREFIX}/${fileName}`;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(objectPath, buf, {
    contentType: 'image/png',
    cacheControl: '86400',
    upsert: false,
  });
  if (error) {
    console.warn('[signature-export-storage]', error.message);
    return { ok: false, reason: error.message };
  }
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl || '';
  if (!publicUrl) {
    return { ok: false, reason: 'No public URL returned' };
  }
  return { ok: true, publicUrl, path: objectPath };
}
