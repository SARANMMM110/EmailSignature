/** Default when layout is unknown — Layout 2 uses 470 via {@link bundleRailPxForSignature}. */
export const EXPORT_WRAPPER_DEFAULT_W = 470;

/**
 * Wrap inner HTML (from split signature/banner cells) for POST /api/generate-signature.
 * @param {string} inner
 * @param {number} [railPx] — use {@link bundleRailPxForSignature} so wide layouts are not clipped.
 */
export function wrapHtmlFragmentForPuppeteerExport(inner, railPx = EXPORT_WRAPPER_DEFAULT_W) {
  const s = String(inner || '').trim();
  if (!s) return '';
  const n = Number(railPx);
  const w = Number.isFinite(n) && n > 0 ? Math.round(n) : EXPORT_WRAPPER_DEFAULT_W;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${w}" style="width:${w}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td width="${w}" style="padding:0;margin:0;border:0;width:${w}px;max-width:100%;vertical-align:top;">${s}</td></tr></table>`;
}
