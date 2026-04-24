/**
 * Mirrors server `webinarBannerStyleVars` in `server/src/services/htmlGenerator.js`
 * so the Banners tab thumbnail matches generated `banner_1` HTML.
 */

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function pickDarkestReadable(candidates, maxLum = 0.5) {
  let best = '#0f172a';
  let bestL = 1;
  for (const raw of candidates) {
    const c = String(raw || '').trim();
    if (!c) continue;
    const L = relativeLuminance(c);
    if (L <= maxLum && L < bestL) {
      bestL = L;
      best = c;
    }
  }
  if (bestL < 1) return best;
  return '#0f172a';
}

function mixHexWithWhite(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#f1f5f9';
  const r = Math.round(base[0] * (1 - t) + 255 * t);
  const g = Math.round(base[1] * (1 - t) + 255 * t);
  const b = Math.round(base[2] * (1 - t) + 255 * t);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function mixHexWithBlack(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#0f172a';
  const r = Math.round(base[0] * (1 - t));
  const g = Math.round(base[1] * (1 - t));
  const b = Math.round(base[2] * (1 - t));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function mixHexPair(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a && !b) return '#e5e7eb';
  if (!a) return String(hexB || '#e5e7eb').trim();
  if (!b) return String(hexA || '#e5e7eb').trim();
  const u = Math.max(0, Math.min(1, Number(t) || 0));
  const r = Math.round(a[0] * (1 - u) + b[0] * u);
  const g = Math.round(a[1] * (1 - u) + b[1] * u);
  const bl = Math.round(a[2] * (1 - u) + b[2] * u);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function companyMutedColor(textHex, secondaryHex) {
  const t = String(textHex || '').trim();
  if (t && relativeLuminance(t) >= 0.18 && relativeLuminance(t) <= 0.55) return t;
  const s = String(secondaryHex || '').trim();
  if (s && relativeLuminance(s) >= 0.25 && relativeLuminance(s) <= 0.6) return mixHexWithWhite(s, 0.35);
  return '#6b7280';
}

/** WCAG 2.1 contrast ratio (1–21) for two sRGB hex colours. */
function wcagContrastRatio(fgHex, bgHex) {
  const L1 = relativeLuminance(fgHex);
  const L2 = relativeLuminance(bgHex);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Adjust `textHex` toward black or white until contrast vs `surfaceHex` is at least `minRatio`.
 * Mirrors server `enforceContrastOnSurface` in `htmlGenerator.js`.
 */
function enforceContrastOnSurface(textHex, surfaceHex, minRatio = 4.5) {
  const surface = String(surfaceHex || '#ffffff').trim();
  const start = String(textHex || '#0f172a').trim();
  if (!hexToRgb(surface)) return start;
  if (!hexToRgb(start)) return relativeLuminance(surface) > 0.45 ? '#0f172a' : '#ffffff';
  if (wcagContrastRatio(start, surface) >= minRatio) return start;

  const surfaceL = relativeLuminance(surface);
  const toDark = surfaceL > 0.45;
  let c = start;
  for (let i = 0; i < 36; i++) {
    c = toDark ? mixHexWithBlack(c, 0.1) : mixHexWithWhite(c, 0.1);
    if (wcagContrastRatio(c, surface) >= minRatio) return c;
  }
  const fallbacks = toDark ? ['#0f172a', '#000000'] : ['#ffffff', '#f8fafc'];
  for (const f of fallbacks) {
    if (wcagContrastRatio(f, surface) >= minRatio) return f;
  }
  return toDark ? '#000000' : '#ffffff';
}

/**
 * @param {string} [railPx]
 */
export function webinarBannerStyleVars(color1, color2, color3, color4, railPx = 470) {
  const c1 = String(color1 || '#e8630a').trim();
  const c2 = String(color2 || c1).trim();
  const c3 = String(color3 || '#94a3b8').trim();
  const c4 = String(color4 || '#0f172a').trim();
  const rail = Math.max(320, Math.min(720, Number(railPx) || 470));
  const surface = mixHexPair(mixHexWithWhite(c4, 0.97), mixHexWithWhite(c3, 0.82), 0.58);
  const blobPeach = mixHexPair(mixHexWithWhite(c1, 0.38), mixHexWithWhite(c3, 0.5), 0.55);
  const blobOrange = c1;
  const headlineRaw = pickDarkestReadable([c4, mixHexWithBlack(c1, 0.04)], 0.48);
  const sublineRaw = companyMutedColor(c4, c2);
  const minCopy = 4.5;
  const headline = enforceContrastOnSurface(headlineRaw, surface, minCopy);
  const subline = enforceContrastOnSurface(sublineRaw, surface, minCopy);
  const brand = enforceContrastOnSurface(c1, surface, minCopy);
  const blobsH = Math.max(84, Math.round((rail * 140) / 560));
  return {
    banner_surface_bg: surface,
    banner_brand_color: brand,
    banner_headline_color: headline,
    banner_subline_color: subline,
    banner_cta_border: headline,
    banner_cta_text: headline,
    banner_blob_peach: blobPeach,
    banner_blob_orange: blobOrange,
    banner_b1_blobs_h: String(blobsH),
  };
}
