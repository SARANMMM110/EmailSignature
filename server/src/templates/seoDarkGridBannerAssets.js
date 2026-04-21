/**
 * Right-side grid + fade overlay for engine `banner_12` (dark SEO / resource strip).
 * SVG gradient id prefixed `b12-` to avoid clashes. Width injected via Handlebars `{{banner_b12_grid_w}}`.
 */

export const SEO_DARK_GRID_SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 72" width="';

export const SEO_DARK_GRID_SVG_AFTER_WIDTH =
  '" height="72" preserveAspectRatio="xMidYMid meet" style="display:block;max-width:100%;height:auto;" role="presentation" aria-hidden="true">';

export const SEO_DARK_GRID_SVG_BODY =
  '<defs>' +
  '<linearGradient id="b12-fadeLeft" x1="0" y1="0" x2="1" y2="0">' +
  '<stop offset="0%" stop-color="#1a2530" stop-opacity="1"/>' +
  '<stop offset="25%" stop-color="#1a2530" stop-opacity="0"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<line x1="60" y1="0" x2="60" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="120" y1="0" x2="120" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="180" y1="0" x2="180" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="240" y1="0" x2="240" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="300" y1="0" x2="300" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="360" y1="0" x2="360" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="420" y1="0" x2="420" y2="72" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="0" y1="24" x2="440" y2="24" stroke="#2e4050" stroke-width="1"/>' +
  '<line x1="0" y1="48" x2="440" y2="48" stroke="#2e4050" stroke-width="1"/>' +
  '<rect x="4" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="64" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="124" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="184" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="244" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="304" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="364" y="4" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="4" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="64" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="124" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="184" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="244" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="304" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="364" y="28" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="4" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="64" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="124" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="184" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="244" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="304" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="364" y="52" width="52" height="16" rx="5" fill="none" stroke="#344d60" stroke-width="1"/>' +
  '<rect x="0" y="0" width="440" height="72" fill="url(#b12-fadeLeft)"/>' +
  '</svg>';

/** Square arrow control (decorative; strip link wraps row). */
export const SEO_DARK_GRID_ARROW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" style="display:block;margin:0 auto;" role="presentation" aria-hidden="true">' +
  '<rect x="0" y="0" width="36" height="36" rx="8" fill="#253545" stroke="#3a4e60" stroke-width="1"/>' +
  '<g transform="translate(10,10)">' +
  '<path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</g>' +
  '</svg>';
