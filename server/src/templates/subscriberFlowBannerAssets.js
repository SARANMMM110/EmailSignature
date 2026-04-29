/**
 * `banner_4` left rail — matches reference card:
 * very light cool gray panel, **4×4** dot grid, purple wave **bottom-right**, faint paper plane,
 * **convex** wave seam into navy, curved dashed journey, **open envelope (no circle)** + three white
 * floating bubbles (blue icons), blue target + **white** bullseye arrow, white growth swoosh.
 * ViewBox 696×180 (graphic artboard; HTML rail is **52%** / navy **48%** @ full width). Rendered height uses ~148px @ 1200 equivalent for a compact strip.
 */

export const SUBSCRIBER_FLOW_BANNER_VIEW_W = 696;
export const SUBSCRIBER_FLOW_BANNER_VIEW_H = 180;

/** @param {number} [railPx] Signature rail width; maps to a shorter row than legacy 180/1200. */
export function subscriberFlowBannerSceneHeightPx(railPx = 470) {
  const rail = Math.max(280, Math.min(720, Number(railPx) || 470));
  return Math.max(46, Math.min(92, Math.round((rail * 148) / 1200)));
}

const ICON = '#3b82f6';
const DASH = '#2563eb';
const DOC = '#60a5fa';

/** Smooth seam — mid bulge shifts **right** into the navy panel (reference card). */
const CLIP_EDGE =
  'M0,0 L626,0 C632,42 646,78 648,108 C644,138 632,162 618,180 L0,180 Z';

const SEAM_EDGE = 'M626,0 C632,42 646,78 648,108 C644,138 632,162 618,180';

/** Dashed arc: rises from envelope, sweeps through bubbles, eases into target. */
const JOURNEY_PATH =
  'M40 112 C88 72 138 78 212 82 C275 85 315 88 338 84 C392 76 430 72 458 76 C502 80 528 78 548 76';

export function buildSubscriberFlowSceneSvg(heightPx) {
  const h = Math.max(52, Math.min(110, Number(heightPx) || 71));
  const W = SUBSCRIBER_FLOW_BANNER_VIEW_W;
  const H = SUBSCRIBER_FLOW_BANNER_VIEW_H;

  const dots = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 32 + col * 14;
      const cy = 20 + row * 14;
      dots.push(`<circle cx="${cx}" cy="${cy}" r="2.5" fill="#d1d5db" opacity="0.9"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="${h}" style="display:block;width:100%;height:${h}px;border:0;">
<defs>
<linearGradient id="sfbBg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#f8f9fc"/><stop offset="50%" stop-color="#f4f6fb"/><stop offset="100%" stop-color="#eef1f8"/>
</linearGradient>
<linearGradient id="sfbWaveBr" x1="100%" y1="100%" x2="0%" y2="0%">
<stop offset="0%" stop-color="#c7d2fe" stop-opacity="0.45"/><stop offset="55%" stop-color="#e0e7ff" stop-opacity="0.22"/><stop offset="100%" stop-color="#f8fafc" stop-opacity="0"/>
</linearGradient>
<radialGradient id="sfbTgtGlow" cx="50%" cy="50%" r="65%">
<stop offset="0%" stop-color="#2563eb" stop-opacity="0.5"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
</radialGradient>
<clipPath id="sfbClip"><path d="${CLIP_EDGE}"/></clipPath>
<filter id="sfbFloat" x="-55%" y="-55%" width="210%" height="210%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0f172a" flood-opacity="0.09"/></filter>
<filter id="sfbEnv" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#64748b" flood-opacity="0.15"/></filter>
<filter id="sfbTgt" x="-70%" y="-70%" width="240%" height="240%"><feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#2563eb" flood-opacity="0.35"/></filter>
</defs>
<g clip-path="url(#sfbClip)">
<rect width="${W}" height="${H}" fill="url(#sfbBg)"/>
<ellipse cx="520" cy="198" rx="210" ry="58" fill="url(#sfbWaveBr)" transform="rotate(-14 520 198)"/>
<ellipse cx="580" cy="205" rx="160" ry="48" fill="#c4d0ff" opacity="0.18" transform="rotate(-8 580 205)"/>
<g>${dots.join('')}</g>
<path d="M328 38 L352 32 L338 50 Z" fill="#94a3b8" opacity="0.22" transform="rotate(16 340 40)"/>
<path d="${JOURNEY_PATH}" fill="none" stroke="${DASH}" stroke-width="2" stroke-dasharray="8 6" stroke-linecap="round" opacity="0.9"/>
<path d="M420 168 Q 500 120 538 92" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="4" stroke-linecap="round"/>
<polygon points="538,92 526,88 532,102" fill="rgba(255,255,255,0.92)"/>
<g filter="url(#sfbEnv)" transform="translate(56,100) rotate(-9)">
<rect x="-14" y="-9" width="28" height="17" rx="2.5" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
<polygon points="-14,-9 0,5 14,-9" fill="#fafafa" stroke="#e5e7eb" stroke-width="1" stroke-linejoin="round"/>
<rect x="-9" y="-4" width="18" height="9" rx="1" fill="${DOC}" stroke="none"/>
<line x1="-9" y1="-1" x2="9" y2="-1" stroke="#ffffff" stroke-width="1.2" opacity="0.5"/>
</g>
<g filter="url(#sfbFloat)"><circle cx="212" cy="85" r="22" fill="#ffffff"/></g>
<g transform="translate(212,85)" fill="none" stroke="${ICON}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
<circle cx="-5" cy="-1" r="2.8" fill="${ICON}" stroke="none"/><circle cx="0" cy="-3.2" r="2.8" fill="${ICON}" stroke="none"/><circle cx="5" cy="-1" r="2.8" fill="${ICON}" stroke="none"/>
<path d="M-8.5 6.5c0 2.8 3.8 5.3 8.5 5.3s8.5-2.5 8.5-5.3"/>
</g>
<g filter="url(#sfbFloat)"><circle cx="338" cy="83" r="22" fill="#ffffff"/></g>
<g transform="translate(338,83)" fill="none" stroke="${ICON}" stroke-width="1.75" stroke-linejoin="round">
<rect x="-8.5" y="-5.5" width="17" height="11" rx="1.2"/>
<polyline points="-8.5,-5.5 0,2.8 8.5,-5.5"/>
</g>
<g filter="url(#sfbFloat)"><circle cx="458" cy="80" r="22" fill="#ffffff"/></g>
<g transform="translate(458,80)" fill="${ICON}">
<rect x="-7.5" y="-1.5" width="3.2" height="10.5" rx="0.65"/>
<rect x="-2.6" y="-5.2" width="3.2" height="14" rx="0.65"/>
<rect x="2.3" y="-8.8" width="3.2" height="17.5" rx="0.65"/>
<rect x="7.2" y="-12.4" width="3.2" height="21" rx="0.65"/>
</g>
<circle cx="548" cy="76" r="48" fill="url(#sfbTgtGlow)" opacity="0.85"/>
<g filter="url(#sfbTgt)"><circle cx="548" cy="76" r="31" fill="${ICON}"/></g>
<circle cx="548" cy="76" r="24" fill="#ffffff"/>
<circle cx="548" cy="76" r="17" fill="${ICON}"/>
<circle cx="548" cy="76" r="10" fill="#ffffff"/>
<circle cx="548" cy="76" r="5.5" fill="${ICON}"/>
<path d="M578 44 L548 76" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
<polygon points="548,76 558,66 552,82" fill="#ffffff"/>
</g>
<path d="${SEAM_EDGE}" fill="none" stroke="rgba(37,99,235,0.25)" stroke-width="12" stroke-linecap="round"/>
<path d="${SEAM_EDGE}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.92"/>
</svg>`;
}
