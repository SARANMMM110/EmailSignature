/**
 * Rejects URLs that point at the static `/signatures` mount with **no file name** (e.g. bad DB value
 * `https://host/signatures/`). Browsers GET that path → nginx/Express 404 and clutter the console.
 */
export function isBareSignaturesCollectionUrl(url) {
  const s = String(url ?? '').trim();
  if (!s) return false;
  try {
    const pathOnly = /^https?:\/\//i.test(s) ? new URL(s).pathname : s.split('?')[0];
    const p = pathOnly.replace(/\/+$/, '') || '/';
    return p === '/signatures';
  } catch {
    return false;
  }
}

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
