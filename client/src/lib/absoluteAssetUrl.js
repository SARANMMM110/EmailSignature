/**
 * Turn root-relative static paths into absolute URLs so they work inside iframe srcDoc
 * and in saved HTML when the app is served from the same origin.
 */
export function absoluteAssetUrl(url) {
  const s = String(url ?? '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
  if (s.startsWith('/') && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${s}`;
  }
  return s;
}
