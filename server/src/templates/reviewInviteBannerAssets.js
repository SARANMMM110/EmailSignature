/**
 * Static SVG art for engine `banner_11` — white card, review headline, wave hand, star illustration, round arrow CTA.
 * Gradient / clip ids prefixed `b11-` to avoid clashes when multiple banners render.
 */

/** Bottom-left wave hand (~22×22), stroke #aaa */
export const REVIEW_WAVE_HAND_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" style="display:block;" role="presentation" aria-hidden="true">' +
  '<path d="M7 11V5.5a1.5 1.5 0 013 0V11" stroke="#aaaaaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M10 10.5V4a1.5 1.5 0 013 0v6.5" stroke="#aaaaaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M13 10V6a1.5 1.5 0 013 0v5" stroke="#aaaaaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M16 11V9a1.5 1.5 0 013 0v4c0 3.314-2.686 6-6 6H9a6 6 0 01-6-6v-1a2 2 0 012-2h1" stroke="#aaaaaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

/** Opening tag only — insert `width="{{banner_b11_art_w}}"` between open and {@link REVIEW_STAR_SCENE_SVG_BODY}. */
export const REVIEW_STAR_SCENE_SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 130" width="';

export const REVIEW_STAR_SCENE_SVG_AFTER_WIDTH =
  '" height="130" preserveAspectRatio="xMidYMax meet" style="display:block;max-width:100%;height:auto;" role="presentation" aria-hidden="true">';

/** Blob + character paths (reference layout ~340×130). */
export const REVIEW_STAR_SCENE_SVG_BODY =
  '<path d="M30 90 Q0 60 20 30 Q40 5 100 8 Q160 10 200 20 Q250 30 270 60 Q290 90 250 100 Q200 115 130 108 Q60 102 30 90Z" fill="#efefef" transform="translate(8,10)"/>' +
  '<g transform="translate(95, 8)">' +
  '<circle cx="12" cy="12" r="11" fill="none" stroke="#bbbbbb" stroke-width="1.5"/>' +
  '<path d="M12 1 L12 5 M12 19 L12 23 M1 12 L5 12 M19 12 L23 12" stroke="#bbbbbb" stroke-width="1.2" stroke-linecap="round"/>' +
  '<circle cx="12" cy="12" r="4" fill="none" stroke="#bbbbbb" stroke-width="1.2"/>' +
  '<path d="M8.5 8.5 L12 12 L15.5 8.5 M8.5 15.5 L12 12 L15.5 15.5" stroke="#bbbbbb" stroke-width="1" stroke-linecap="round"/>' +
  '</g>' +
  '<g transform="translate(220, 5)">' +
  '<line x1="8" y1="0" x2="8" y2="6" stroke="#555555" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="0" y1="8" x2="6" y2="8" stroke="#555555" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="2" y1="2" x2="5" y2="5" stroke="#555555" stroke-width="1.5" stroke-linecap="round"/>' +
  '<line x1="14" y1="2" x2="11" y2="5" stroke="#555555" stroke-width="1.5" stroke-linecap="round"/>' +
  '</g>' +
  '<g transform="translate(175, 8)">' +
  '<path d="M30 2 L36 20 L56 20 L40 32 L46 50 L30 38 L14 50 L20 32 L4 20 L24 20 Z" fill="none" stroke="#222222" stroke-width="2.2" stroke-linejoin="round"/>' +
  '</g>' +
  '<ellipse cx="215" cy="58" rx="11" ry="12" fill="#f5c9a0"/>' +
  '<path d="M204 54 Q215 44 226 54 Q226 48 215 45 Q204 48 204 54Z" fill="#222222"/>' +
  '<rect x="211" y="68" width="8" height="5" fill="#f5c9a0"/>' +
  '<path d="M200 74 Q215 68 230 74 L232 115 L198 115 Z" fill="#3db87a"/>' +
  '<path d="M201 76 Q188 60 190 42" stroke="#3db87a" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M229 76 Q242 60 240 42" stroke="#3db87a" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="190" cy="40" rx="6" ry="5" fill="#f5c9a0"/>' +
  '<ellipse cx="240" cy="40" rx="6" ry="5" fill="#f5c9a0"/>' +
  '<path d="M210 63 Q215 67 220 63" stroke="#c08060" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="211" cy="57" rx="1.8" ry="2" fill="#222222"/>' +
  '<ellipse cx="219" cy="57" rx="1.8" ry="2" fill="#222222"/>' +
  '<path d="M208 54 Q211 52 214 54" stroke="#222222" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
  '<path d="M216 54 Q219 52 222 54" stroke="#222222" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
  '<rect x="203" y="113" width="10" height="16" rx="3" fill="#333333"/>' +
  '<rect x="217" y="113" width="10" height="16" rx="3" fill="#333333"/>' +
  '<rect x="175" y="112" width="80" height="5" rx="2" fill="#cccccc"/>' +
  '<rect x="182" y="117" width="5" height="13" rx="2" fill="#bbbbbb"/>' +
  '<rect x="245" y="117" width="5" height="13" rx="2" fill="#bbbbbb"/>' +
  '<rect x="195" y="102" width="40" height="12" rx="2" fill="#dddddd"/>' +
  '<rect x="197" y="104" width="36" height="9" rx="1" fill="#555555"/>' +
  '<rect x="192" y="114" width="46" height="3" rx="1" fill="#cccccc"/>' +
  '</svg>';

/** White arrow inside black circle (18×18 glyph, padded to 44×44 cell). */
export const REVIEW_ARROW_CIRCLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" style="display:block;margin:0 auto;" role="presentation" aria-hidden="true">' +
  '<circle cx="22" cy="22" r="22" fill="#111111"/>' +
  '<g transform="translate(13,13)">' +
  '<path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</g>' +
  '</svg>';
