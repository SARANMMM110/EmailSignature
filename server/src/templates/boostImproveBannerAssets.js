/**
 * Static SVG art for engine `banner_8` — corporate navy + gold strip (mark + rocket ring).
 * Gradient / filter ids prefixed `b8-` for safe stacking.
 */

/**
 * @param {number} [w] — rendered width px
 * @param {number} [h] — rendered height px
 */
export function boostLogoMarkSvg(w = 32, h = 35) {
  const wi = Math.max(20, Math.round(Number(w) || 32));
  const he = Math.max(22, Math.round(Number(h) || Math.round(wi * 1.09)));
  const mb = Math.max(2, Math.min(6, Math.round(he * 0.09)));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 52" width="${wi}" height="${he}" style="display:block;width:${wi}px;height:${he}px;margin:0 auto ${mb}px;border:0;" aria-hidden="true">
<defs><linearGradient id="b8-markG" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#E8A820"/><stop offset="100%" stop-color="#F4D060"/></linearGradient></defs>
<path d="M24 4 L44 44 H4 Z" fill="url(#b8-markG)" stroke="#F4B93A" stroke-width="1.2" stroke-linejoin="round"/>
</svg>`;
}

/** @deprecated Prefer {@link boostLogoMarkSvg} with rail-scaled dimensions. */
export const BOOST_LOGO_MARK_SVG = boostLogoMarkSvg(32, 35);
