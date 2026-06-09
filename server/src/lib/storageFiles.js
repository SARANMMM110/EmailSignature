/**
 * Supabase Storage helpers — path parsing, scoped delete, export paths.
 */
import { supabaseAdmin, getStorageBucket } from '../services/supabase.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @param {string} slot */
export function normalizeExportSlot(slot) {
  const s = String(slot || '').trim().toLowerCase();
  if (!s) return 'composite';
  if (s === 'signature' || s === 'composite' || /^banner-\d+$/.test(s)) return s;
  return null;
}

/**
 * Stable export object path when signature id is known (upsert on re-export).
 * @param {string} userId
 * @param {string} signatureId
 * @param {string} slot
 */
export function exportObjectPathForSignature(userId, signatureId, slot) {
  const uid = String(userId || '').trim();
  const sid = String(signatureId || '').trim();
  const sl = normalizeExportSlot(slot);
  if (!UUID_RE.test(uid) || !UUID_RE.test(sid) || !sl) return null;
  return `generated-signatures/${uid}/${sid}/${sl}.png`;
}

/**
 * @param {string} publicUrl
 * @param {string} [bucket]
 * @returns {string | null}
 */
export function storagePathFromPublicUrl(publicUrl, bucket = getStorageBucket()) {
  const url = String(publicUrl || '').trim();
  if (!url) return null;
  const b = String(bucket || '').trim();
  const marker = `/object/public/${b}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(url.slice(idx + marker.length).split('?')[0].split('#')[0]);
  } catch {
    return url.slice(idx + marker.length).split('?')[0].split('#')[0];
  }
}

/** User-owned upload prefixes (not generated-signatures — handled separately). */
export function isUserMediaStoragePath(objectPath, userId) {
  const p = String(objectPath || '').trim();
  const uid = String(userId || '').trim();
  if (!p || !UUID_RE.test(uid)) return false;
  return (
    p.startsWith(`photos/${uid}/`) ||
    p.startsWith(`logos/${uid}/`) ||
    p.startsWith(`banners/${uid}/`) ||
    p.startsWith(`exports/${uid}/`)
  );
}

/**
 * @param {string[]} objectPaths
 */
export async function removeStorageObjects(objectPaths) {
  if (!supabaseAdmin || !objectPaths?.length) return;
  const bucket = getStorageBucket();
  const unique = [...new Set(objectPaths.map((p) => String(p || '').trim()).filter(Boolean))];
  if (!unique.length) return;
  const { error } = await supabaseAdmin.storage.from(bucket).remove(unique);
  if (error) {
    console.warn('[storage] remove failed:', error.message, unique.slice(0, 3));
  }
}

/**
 * Delete prior upload when user replaces an image (same user folder only).
 * @param {string} userId
 * @param {string} replacePublicUrl
 * @param {string} [newPublicUrl]
 */
export async function removeReplacedUserMediaUrl(userId, replacePublicUrl, newPublicUrl = '') {
  const oldPath = storagePathFromPublicUrl(replacePublicUrl);
  const newPath = storagePathFromPublicUrl(newPublicUrl);
  if (!oldPath || oldPath === newPath) return;
  if (!isUserMediaStoragePath(oldPath, userId)) return;
  await removeStorageObjects([oldPath]);
}

/** List all object paths under a storage prefix (recursive). */
export async function listStoragePathsUnderPrefix(prefix) {
  if (!supabaseAdmin) return [];
  const bucket = getStorageBucket();
  const root = String(prefix || '').trim().replace(/\/+$/, '');
  const out = [];

  async function walk(folder) {
    let offset = 0;
    const limit = 1000;
    for (;;) {
      const { data, error } = await supabaseAdmin.storage.from(bucket).list(folder, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (error) {
        console.warn('[storage] list failed:', folder, error.message);
        return;
      }
      if (!data?.length) break;
      for (const item of data) {
        const path = folder ? `${folder}/${item.name}` : item.name;
        if (item.id == null) {
          await walk(path);
        } else {
          out.push(path);
        }
      }
      if (data.length < limit) break;
      offset += limit;
    }
  }

  await walk(root);
  return out;
}

/** Remove export PNGs for one signature (`generated-signatures/{userId}/{signatureId}/`). */
export async function removeSignatureExportFiles(userId, signatureId) {
  const uid = String(userId || '').trim();
  const sid = String(signatureId || '').trim();
  if (!UUID_RE.test(uid) || !UUID_RE.test(sid)) return;
  const prefix = `generated-signatures/${uid}/${sid}`;
  const paths = await listStoragePathsUnderPrefix(prefix);
  if (paths.length) await removeStorageObjects(paths);
}

const STORAGE_URL_IN_TEXT =
  /https?:\/\/[^/]+\/storage\/v1\/object\/public\/signature-images\/[^\s"'<>]+/gi;

/** Collect storage public URLs from a signature row (fields, banner_config, HTML). */
export function collectSignatureMediaUrls(row) {
  const urls = new Set();
  const push = (v) => {
    const s = String(v || '').trim();
    if (s && storagePathFromPublicUrl(s)) urls.add(s);
  };

  const fields = row?.fields || {};
  push(fields.photo_url);
  push(fields.logo_url);
  push(fields.signature_image_url);

  const design = row?.design || {};
  push(design.signatureImageUrl);

  const bc = row?.banner_config || {};
  for (const [k, v] of Object.entries(bc)) {
    if (typeof v === 'string' && (k.includes('url') || k.endsWith('_url'))) push(v);
  }

  const html = String(row?.generated_html || '');
  if (html) {
    const matches = html.match(STORAGE_URL_IN_TEXT) || [];
    for (const m of matches) push(m);
  }

  return [...urls];
}

/**
 * Delete user media files referenced by a signature row + export folder.
 * @param {object} row — signatures table row
 */
export async function deleteSignatureStorageAssets(row) {
  if (!row?.user_id || !row?.id) return;
  const userId = String(row.user_id);
  const paths = collectSignatureMediaUrls(row)
    .map((u) => storagePathFromPublicUrl(u))
    .filter((p) => p && isUserMediaStoragePath(p, userId));
  if (paths.length) await removeStorageObjects(paths);
  await removeSignatureExportFiles(userId, row.id);
}
