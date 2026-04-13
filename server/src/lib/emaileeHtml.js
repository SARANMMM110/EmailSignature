/**
 * Emailee-style paste fragment: fixed-width table + one or two <img> rows with hosted URLs.
 */

function escapeHtmlAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** Escape URL for use inside double-quoted HTML attribute (e.g. signed URLs with &). */
function escapeAttrUrl(url) {
  return String(url || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * @param {{ src: string, alt: string }[]} rows
 */
const EMAILEE_W = 600;

export function buildEmaileeTableHtml(rows) {
  const w = EMAILEE_W;
  const safe = Array.isArray(rows) ? rows : [];
  const body = safe
    .map(
      ({ src, alt }) =>
        `<tr><td><img alt="${escapeHtmlAttr(alt)}" width="${w}" border="0" style="border-radius:0;display:block;border:none;width:100% !important;max-width:${w}px !important;height:auto;" src="${escapeAttrUrl(src)}" /></td></tr>`
    )
    .join('');
  return `<table width="${w}" border="0" style="width:100% !important;max-width:${w}px !important;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tbody>${body}</tbody></table>`;
}
