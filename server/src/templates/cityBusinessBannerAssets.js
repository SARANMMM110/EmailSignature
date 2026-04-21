/**
 * Static SVG art for engine `banner_10` (business / city skyline strip).
 * Gradient ids prefixed `b10-` to avoid clashes when multiple strips render.
 */

export const CITY_BUSINESS_CURVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 90" width="40" height="90" role="img" aria-hidden="true" style="display:block;">
<path d="M20 0 Q40 45 20 90 L0 90 L0 0 Z" fill="#ffffff" opacity="0.05"/>
<path d="M22 0 Q44 45 22 90" stroke="#00aacc" stroke-width="3" fill="none" opacity="0.9"/>
</svg>`;

export const CITY_BUSINESS_LOGO_HEX_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22" role="img" aria-hidden="true" style="display:block;">
<polygon points="11,2 20,7 20,15 11,20 2,15 2,7" fill="none" stroke="#f0b400" stroke-width="1.5"/>
<polygon points="11,6 16,9 16,14 11,17 6,14 6,9" fill="#f0b400" opacity="0.3"/>
<circle cx="11" cy="11" r="3" fill="#f0b400"/>
</svg>`;

/** City skyline + sky (reference `city-svg`, ids prefixed). */
export const CITY_BUSINESS_SKYLINE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 90" width="480" height="90" preserveAspectRatio="xMaxYMax meet" role="img" aria-hidden="true" style="display:block;width:100%;max-width:480px;height:90px;margin:0 0 0 auto;">
<defs>
<linearGradient id="b10-skyGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#7a8e9e" stop-opacity="0.6"/>
<stop offset="100%" stop-color="#4a5a68" stop-opacity="0.9"/>
</linearGradient>
<linearGradient id="b10-buildingDark" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#2a3540"/>
<stop offset="100%" stop-color="#1a2530"/>
</linearGradient>
<linearGradient id="b10-buildingMid" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#3a4a58"/>
<stop offset="100%" stop-color="#2a3848"/>
</linearGradient>
<linearGradient id="b10-leftFade" x1="0" y1="0" x2="1" y2="0">
<stop offset="0%" stop-color="#1a1a2e" stop-opacity="1"/>
<stop offset="40%" stop-color="#1a1a2e" stop-opacity="0"/>
</linearGradient>
</defs>
<rect x="0" y="0" width="480" height="90" fill="url(#b10-skyGrad)"/>
<ellipse cx="80" cy="18" rx="40" ry="12" fill="#b0bec5" opacity="0.5"/>
<ellipse cx="110" cy="14" rx="30" ry="10" fill="#cfd8dc" opacity="0.4"/>
<ellipse cx="200" cy="22" rx="50" ry="14" fill="#b0bec5" opacity="0.4"/>
<ellipse cx="240" cy="16" rx="35" ry="11" fill="#cfd8dc" opacity="0.35"/>
<ellipse cx="350" cy="20" rx="45" ry="13" fill="#b0bec5" opacity="0.3"/>
<rect x="30" y="45" width="18" height="45" fill="#9ab0be" opacity="0.5"/>
<rect x="50" y="50" width="14" height="40" fill="#8a9fae" opacity="0.5"/>
<rect x="66" y="42" width="20" height="48" fill="#9aafbe" opacity="0.4"/>
<rect x="90" y="38" width="22" height="52" fill="#8a9fae" opacity="0.5"/>
<rect x="114" y="48" width="16" height="42" fill="#9ab0be" opacity="0.4"/>
<rect x="150" y="5" width="34" height="85" fill="url(#b10-buildingDark)"/>
<rect x="154" y="10" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="161" y="10" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="168" y="10" width="5" height="6" fill="#5a7080" opacity="0.7"/>
<rect x="175" y="10" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="154" y="20" width="5" height="6" fill="#3a5060" opacity="0.9"/>
<rect x="161" y="20" width="5" height="6" fill="#5a7080" opacity="0.7"/>
<rect x="168" y="20" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="175" y="20" width="5" height="6" fill="#3a5060" opacity="0.9"/>
<rect x="154" y="30" width="5" height="6" fill="#5a7080" opacity="0.7"/>
<rect x="161" y="30" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="168" y="30" width="5" height="6" fill="#3a5060" opacity="0.9"/>
<rect x="175" y="30" width="5" height="6" fill="#5a7080" opacity="0.7"/>
<rect x="154" y="40" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="161" y="40" width="5" height="6" fill="#3a5060" opacity="0.9"/>
<rect x="168" y="40" width="5" height="6" fill="#5a7080" opacity="0.7"/>
<rect x="175" y="40" width="5" height="6" fill="#4a6070" opacity="0.8"/>
<rect x="188" y="22" width="28" height="68" fill="url(#b10-buildingMid)"/>
<rect x="192" y="27" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="198" y="27" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="204" y="27" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="210" y="27" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="192" y="36" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="198" y="36" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="204" y="36" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="210" y="36" width="4" height="5" fill="#3a5060" opacity="0.9"/>
<rect x="192" y="45" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="198" y="45" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="204" y="45" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="210" y="45" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="220" y="35" width="22" height="55" fill="url(#b10-buildingDark)"/>
<rect x="224" y="40" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="230" y="40" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="236" y="40" width="4" height="5" fill="#4a6070" opacity="0.8"/>
<rect x="224" y="49" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="230" y="49" width="4" height="5" fill="#3a5060" opacity="0.9"/>
<rect x="236" y="49" width="4" height="5" fill="#5a7080" opacity="0.7"/>
<rect x="246" y="30" width="30" height="60" fill="url(#b10-buildingMid)"/>
<rect x="278" y="40" width="20" height="50" fill="url(#b10-buildingDark)"/>
<rect x="300" y="45" width="25" height="45" fill="url(#b10-buildingMid)"/>
<rect x="328" y="38" width="18" height="52" fill="url(#b10-buildingDark)"/>
<rect x="348" y="50" width="22" height="40" fill="url(#b10-buildingMid)"/>
<rect x="372" y="44" width="16" height="46" fill="url(#b10-buildingDark)"/>
<rect x="390" y="52" width="20" height="38" fill="url(#b10-buildingMid)"/>
<rect x="412" y="46" width="25" height="44" fill="url(#b10-buildingDark)"/>
<rect x="440" y="55" width="18" height="35" fill="url(#b10-buildingMid)"/>
<rect x="460" y="48" width="22" height="42" fill="url(#b10-buildingDark)"/>
<rect x="0" y="0" width="480" height="90" fill="url(#b10-leftFade)"/>
</svg>`;
