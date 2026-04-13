import { supabaseAdmin, getStorageBucket } from './supabase.js';

const ALLOWED = new Set(['image/png', 'image/jpeg']);
const MAX_BYTES = 2 * 1024 * 1024;

export async function uploadSignatureImage(buffer, mimetype, userId, type) {
  if (!supabaseAdmin) {
    const err = new Error('Storage is not configured (missing Supabase admin client).');
    err.statusCode = 503;
    throw err;
  }
  if (!ALLOWED.has(mimetype)) {
    const err = new Error('Only PNG and JPEG images are allowed.');
    err.statusCode = 400;
    throw err;
  }
  if (buffer.length > MAX_BYTES) {
    const err = new Error('File too large (max 2MB).');
    err.statusCode = 400;
    throw err;
  }

  const ext = mimetype === 'image/png' ? 'png' : 'jpg';
  const path = `${userId}/${type}-${Date.now()}.${ext}`;
  const bucket = getStorageBucket();

  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType: mimetype,
    upsert: false,
  });

  if (error) {
    const err = new Error(error.message || 'Upload failed');
    err.statusCode = 500;
    throw err;
  }

  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) {
    const err = new Error('Could not resolve public URL');
    err.statusCode = 500;
    throw err;
  }

  return publicUrl;
}
