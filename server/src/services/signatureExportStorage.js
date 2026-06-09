/**
 * Upload Puppeteer-generated signature PNGs to Supabase Storage so pasted mail uses a public HTTPS URL.
 */
import { supabaseAdmin, getStorageBucket } from './supabase.js';

/**
 * @param {Buffer} buf — PNG bytes
 * @param {string} objectPath — full path inside bucket
 * @param {{ upsert?: boolean }} [options]
 * @returns {Promise<{ ok: true, publicUrl: string, path: string } | { ok: false, reason: string }>}
 */
export async function uploadGeneratedSignaturePng(buf, objectPath, options = {}) {
  if (!supabaseAdmin) {
    return { ok: false, reason: 'Supabase admin client not configured' };
  }
  const path = String(objectPath || '').trim();
  if (!path) {
    return { ok: false, reason: 'Missing object path' };
  }
  const bucket = getStorageBucket();
  const upsert = options.upsert !== false;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buf, {
    contentType: 'image/png',
    cacheControl: '86400',
    upsert,
  });
  if (error) {
    console.warn('[signature-export-storage]', error.message);
    return { ok: false, reason: error.message };
  }
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl || '';
  if (!publicUrl) {
    return { ok: false, reason: 'No public URL returned' };
  }
  return { ok: true, publicUrl, path };
}
