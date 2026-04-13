/**
 * True when the API row has a usable preview image URL (hide tiles without one).
 */
export function hasTemplatePreviewImage(t) {
  const u = t?.preview_img_url || t?.thumbnail;
  if (typeof u !== 'string') return false;
  const s = u.trim();
  if (!s) return false;
  if (/^https?:\/\//i.test(s)) return true;
  if (s.startsWith('/')) return true;
  if (s.startsWith('data:image')) return true;
  return false;
}
