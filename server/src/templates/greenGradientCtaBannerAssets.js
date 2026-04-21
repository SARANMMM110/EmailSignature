/**
 * Logo + decorative art for engine `banner_13` (green gradient “better future” strip).
 * Decor gradient ids use prefix `b13-`.
 */

/** Two overlapping white squares + green overlap “cutout” (44×44 viewBox). */
export const GREEN_GRADIENT_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" style="display:block;" role="presentation" aria-hidden="true">' +
  '<rect x="2" y="2" width="20" height="20" rx="2" fill="#ffffff"/>' +
  '<rect x="14" y="14" width="20" height="20" rx="2" fill="#ffffff"/>' +
  '<rect x="14" y="14" width="8" height="8" fill="#3ab878"/>' +
  '</svg>';

export const GREEN_GRADIENT_DECOR_SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="';

export const GREEN_GRADIENT_DECOR_SVG_AFTER_WIDTH =
  '" height="68" preserveAspectRatio="xMidYMid meet" style="display:block;opacity:0.95;" role="presentation" aria-hidden="true">';

/** Soft circles + arcs on the right rail (sits beside CTA). */
export const GREEN_GRADIENT_DECOR_SVG_BODY =
  '<defs>' +
  '<linearGradient id="b13-shine" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>' +
  '<stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<circle cx="98" cy="22" r="28" fill="#ffffff" opacity="0.1"/>' +
  '<circle cx="72" cy="68" r="22" fill="#ffffff" opacity="0.08"/>' +
  '<circle cx="28" cy="48" r="14" fill="#ffffff" opacity="0.06"/>' +
  '<path d="M0 78 Q40 52 88 62 T120 48" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.14" stroke-linecap="round"/>' +
  '<path d="M8 12 Q52 0 112 24" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.12" stroke-linecap="round"/>' +
  '<ellipse cx="55" cy="28" rx="36" ry="20" fill="url(#b13-shine)" opacity="0.35"/>' +
  '</svg>';
