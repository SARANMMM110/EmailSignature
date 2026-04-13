/**
 * Gmail (and other clients) fetch <img src> when rendering mail to recipients.
 * If the URL is localhost, only your machine can load it — recipients see a broken image.
 * The clickable <a href> still works because it points at a public site.
 *
 * Set the same public origin on server (PUBLIC_BASE_URL) and optionally here so paste HTML
 * matches when the API returns a local URL during dev.
 */

function readVitePublicBase() {
  try {
    const b = import.meta.env?.VITE_PUBLIC_SIGNATURE_IMAGE_BASE;
    return typeof b === 'string' ? b.replace(/\/$/, '') : '';
  } catch {
    return '';
  }
}

export function isHostUnreachableForEmailRecipients(hostname) {
  const h = String(hostname || '').toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '0.0.0.0';
}

/**
 * URL to embed in pasted email HTML so recipients' clients can load the PNG.
 * Rewrites localhost → VITE_PUBLIC_SIGNATURE_IMAGE_BASE when that env is set.
 */
export function recipientVisibleImageSrc(imageUrl) {
  const raw = String(imageUrl || '').trim();
  if (!raw) return raw;
  const base = readVitePublicBase();
  if (!base) return raw;
  try {
    const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : undefined);
    if (!isHostUnreachableForEmailRecipients(u.hostname)) return raw;
    return `${base}${u.pathname}${u.search}`;
  } catch {
    return raw;
  }
}
