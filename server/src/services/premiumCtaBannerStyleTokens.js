import { ENGINE_PALETTE_DEFAULTS } from '../lib/enginePaletteDefaults.js';
import {
  brandFieldMidFromStops,
  brandLightWashFromStops,
  brandStripGradientFromStops,
} from '../lib/engineBrandSurfaces.js';

/**
 * Palette-driven inline colors for premium CTA strips (banner_8–banner_13, plus `banner_4`).
 * HTML generation always passes `applyBrand: true` so tokens track the signature’s four palette stops.
 * When `applyBrand` is false, tokens fall back to each banner’s original static palette (e.g. tests).
 */

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mixHexWithWhite(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#f1f5f9';
  const u = Math.max(0, Math.min(1, Number(t) || 0));
  const r = Math.round(base[0] * (1 - u) + 255 * u);
  const g = Math.round(base[1] * (1 - u) + 255 * u);
  const b = Math.round(base[2] * (1 - u) + 255 * u);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function mixHexWithBlack(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#0f172a';
  const u = Math.max(0, Math.min(1, Number(t) || 0));
  const r = Math.round(base[0] * (1 - u));
  const g = Math.round(base[1] * (1 - u));
  const b = Math.round(base[2] * (1 - u));
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

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function wcagContrastRatio(fgHex, bgHex) {
  const L1 = relativeLuminance(fgHex);
  const L2 = relativeLuminance(bgHex);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

/** Nudge `fgHex` toward black or white until contrast vs `bgHex` is at least `minRatio`. */
function enforceContrastOnBg(fgHex, bgHex, minRatio = 4.5) {
  const bg = String(bgHex || '#1c1c1c').trim();
  const start = String(fgHex || '#ffffff').trim();
  if (!hexToRgb(bg)) return start;
  if (!hexToRgb(start)) return relativeLuminance(bg) > 0.45 ? '#0f172a' : '#ffffff';
  if (wcagContrastRatio(start, bg) >= minRatio) return start;

  const bgL = relativeLuminance(bg);
  const toDark = bgL > 0.45;
  let c = start;
  for (let i = 0; i < 36; i++) {
    c = toDark ? mixHexWithBlack(c, 0.1) : mixHexWithWhite(c, 0.1);
    if (wcagContrastRatio(c, bg) >= minRatio) return c;
  }
  const fallbacks = toDark ? ['#0f172a', '#000000'] : ['#ffffff', '#f8fafc'];
  for (const f of fallbacks) {
    if (wcagContrastRatio(f, bg) >= minRatio) return f;
  }
  return toDark ? '#000000' : '#ffffff';
}

/** Prefer user text/accent colour when contrast vs background is already OK (same idea as `paletteTextOnSurface` in htmlGenerator). */
function paletteTextOnBg(textHex, bgHex, minRatio = 4.5) {
  const t = String(textHex ?? '').trim();
  const b = String(bgHex ?? '').trim();
  if (hexToRgb(t) && hexToRgb(b) && wcagContrastRatio(t, b) >= minRatio) return t;
  const fallback = relativeLuminance(b) > 0.45 ? '#0f172a' : '#ffffff';
  return enforceContrastOnBg(t || fallback, b, minRatio);
}

function norm(c, fallback) {
  const s = String(c || '').trim();
  return s && hexToRgb(s) ? s : fallback;
}

/** @param {boolean} applyBrand */
export function premiumCtaTokensForBanner(bannerKey, applyBrand, c1, c2, c3, c4) {
  const D = ENGINE_PALETTE_DEFAULTS;
  const a = norm(c1, D.primary);
  const b = norm(c2, D.secondary);
  const ac = norm(c3, D.accent);
  const tx = norm(c4, D.text);

  const out = {};

  if (bannerKey === 'banner_4') {
    const ctaMidDef = mixHexPair('#2563eb', '#9333ea', 0.5);
    Object.assign(out, {
      banner_b4_left_fallback_bg: '#f4f6fb',
      banner_b4_right_bg_solid: '#0a1120',
      banner_b4_right_bg_image: 'linear-gradient(160deg,#0f172a 0%,#0a1120 45%,#070d18 100%)',
      banner_b4_title_color: '#ffffff',
      banner_b4_accent: '#3b82f6',
      banner_b4_sub_color: '#cbd5e1',
      banner_b4_cta_g1: '#2563eb',
      banner_b4_cta_g2: '#9333ea',
      banner_b4_cta_bg_mid: '#6d4ee6',
      banner_b4_cta_ink: paletteTextOnBg('#ffffff', ctaMidDef, 4.5),
      banner_b4_cta_rocket_fill: paletteTextOnBg('#ffffff', ctaMidDef, 3),
    });
    if (applyBrand) {
      const leftPanel = brandLightWashFromStops(a, b, tx);
      const { gradStart, gradEnd, mid } = brandStripGradientFromStops(a, b, tx);
      const rightDeep = mid;
      const titleOnDark = paletteTextOnBg(tx, rightDeep, 4.5);
      const accentRaw = relativeLuminance(ac) > 0.78 ? mixHexPair(ac, a, 0.45) : ac;
      const accentOnDark = paletteTextOnBg(accentRaw, rightDeep, 3.0);
      const subOnDark = paletteTextOnBg(mixHexPair(tx, b, 0.35), rightDeep, 3.2);
      const ctaG1 = mixHexPair(a, ac, 0.38);
      const ctaG2 = mixHexPair(b, ac, 0.38);
      const ctaMid = mixHexPair(ctaG1, ctaG2, 0.5);
      const ctaInk = paletteTextOnBg(tx, ctaMid, 4.5);
      const rocketFill = paletteTextOnBg(tx, ctaMid, 3);
      Object.assign(out, {
        banner_b4_left_fallback_bg: leftPanel,
        banner_b4_right_bg_solid: rightDeep,
        banner_b4_right_bg_image: `linear-gradient(135deg,${gradStart} 0%,${gradEnd} 100%)`,
        banner_b4_title_color: titleOnDark,
        banner_b4_accent: accentOnDark,
        banner_b4_sub_color: subOnDark,
        banner_b4_cta_g1: ctaG1,
        banner_b4_cta_g2: ctaG2,
        banner_b4_cta_bg_mid: ctaMid,
        banner_b4_cta_ink: ctaInk,
        banner_b4_cta_rocket_fill: rocketFill,
      });
    }
  }

  if (bannerKey === 'banner_8') {
    const navy = '#0B1D36';
    const gold = '#F4B93A';
    const geoPat =
      'repeating-linear-gradient(152deg,rgba(255,255,255,0.055) 0px,rgba(255,255,255,0.055) 1px,transparent 1px,transparent 8px)';
    const midImg =
      'radial-gradient(circle at 1px 1px,rgba(11,29,54,0.08) 1px,transparent 0),linear-gradient(118deg,#ffffff 0%,#eef2f7 52%,#ffffff 100%)';
    Object.assign(out, {
      banner_b8_shell_border: 'rgba(11,29,54,0.22)',
      banner_b8_left_bg: navy,
      banner_b8_left_bg_image: geoPat,
      banner_b8_mid_bg: '#ffffff',
      banner_b8_mid_bg_image: midImg,
      banner_b8_mid_bg_size: '14px 14px,auto',
      banner_b8_right_bg: navy,
      banner_b8_right_bg_image: geoPat,
      banner_b8_gold: gold,
      banner_b8_headline_navy: navy,
      banner_b8_headline_gold: gold,
      banner_b8_mid_sub_color: '#555555',
      banner_b8_cta_bg: gold,
      banner_b8_cta_text: navy,
      banner_b8_right_blurb_color: '#ffffff',
      banner_b8_dot_hi: '#ffffff',
      banner_b8_dot_lo: '#b8c2ce',
    });
    if (applyBrand) {
      const { gradStart, gradEnd, mid } = brandStripGradientFromStops(a, b, tx);
      const midPanel = brandLightWashFromStops(a, b, tx);
      const stripeHi = mixHexWithWhite(mid, 0.14);
      const geoPatB = `repeating-linear-gradient(152deg,${stripeHi} 0px,${stripeHi} 1px,transparent 1px,transparent 8px)`;
      const dotRgb = mixHexPair(mid, mixHexPair(a, ac, 0.22), 0.42);
      const midImgB = `radial-gradient(circle at 1px 1px,${dotRgb} 1px,transparent 0),linear-gradient(118deg,${midPanel} 0%,${mixHexPair(midPanel, ac, 0.1)} 52%,${midPanel} 100%)`;
      const headlineN = enforceContrastOnBg(mixHexPair(tx, a, 0.08), midPanel, 4.5);
      const headlineG = enforceContrastOnBg(ac, midPanel, 3.1);
      const accentBar = mixHexPair(ac, mixHexWithWhite(mid, 0.22), 0.48);
      const blurbFg = enforceContrastOnBg(mixHexPair(tx, '#f8fafc', 0.35), gradEnd, 4.25);
      let ctaBg = mixHexPair(ac, mixHexWithWhite(a, 0.12), 0.52);
      if (relativeLuminance(ctaBg) < 0.34) ctaBg = mixHexWithWhite(ctaBg, 0.22);
      for (let i = 0; i < 12 && wcagContrastRatio(ctaBg, gradEnd) < 3; i++) {
        ctaBg = mixHexWithWhite(ctaBg, 0.12);
      }
      const ctaTx = enforceContrastOnBg(tx, ctaBg, 4.5);
      const dotHi = paletteTextOnBg('#f8fafc', gradEnd, 3.1);
      const dotLo = mixHexPair(gradEnd, mixHexWithWhite(tx, 0.2), 0.55);
      Object.assign(out, {
        banner_b8_shell_border: mixHexPair(a, '#94a3b8', 0.28),
        banner_b8_left_bg: gradStart,
        banner_b8_left_bg_image: geoPatB,
        banner_b8_mid_bg: midPanel,
        banner_b8_mid_bg_image: midImgB,
        banner_b8_mid_bg_size: '14px 14px,auto',
        banner_b8_right_bg: gradEnd,
        banner_b8_right_bg_image: geoPatB,
        banner_b8_gold: accentBar,
        banner_b8_headline_navy: headlineN,
        banner_b8_headline_gold: headlineG,
        banner_b8_mid_sub_color: enforceContrastOnBg(mixHexPair(tx, '#555555', 0.45), midPanel, 4),
        banner_b8_cta_bg: ctaBg,
        banner_b8_cta_text: ctaTx,
        banner_b8_right_blurb_color: blurbFg,
        banner_b8_dot_hi: dotHi,
        banner_b8_dot_lo: dotLo,
      });
    }
  }

  if (bannerKey === 'banner_9') {
    const surfDef = '#f5f0e8';
    const ctaDef = '#1e3d2f';
    Object.assign(out, {
      banner_b9_surface: surfDef,
      banner_b9_cta_bg: ctaDef,
      banner_b9_headline_color: paletteTextOnBg('#1a1a1a', surfDef, 4.5),
      banner_b9_brand_color: paletteTextOnBg('#444444', surfDef, 3.5),
      banner_b9_cta_text: paletteTextOnBg('#ffffff', ctaDef, 4.5),
    });
    if (applyBrand) {
      const surf = brandLightWashFromStops(a, b, tx);
      const ctaBg9 = brandFieldMidFromStops(a, b, tx);
      Object.assign(out, {
        banner_b9_surface: surf,
        banner_b9_cta_bg: ctaBg9,
        banner_b9_headline_color: paletteTextOnBg(tx, surf, 4.5),
        banner_b9_brand_color: paletteTextOnBg(mixHexPair(tx, b, 0.32), surf, 3.5),
        banner_b9_cta_text: paletteTextOnBg(tx, ctaBg9, 4.5),
      });
    }
  }

  if (bannerKey === 'banner_10') {
    const darkDef = '#1a1a2e';
    const cardDef = '#ffffff';
    const rightDef =
      'linear-gradient(160deg,#5a6e80 0%,#8a9eac 40%,#6b7f8e 70%,#4a5a68 100%)';
    Object.assign(out, {
      banner_b10_dark: darkDef,
      banner_b10_accent: '#f0b400',
      banner_b10_dot1: '#00aacc',
      banner_b10_dot2: '#cccccc',
      banner_b10_bar_grad: 'linear-gradient(to bottom,#00aacc,#0077aa)',
      banner_b10_card_bg: cardDef,
      banner_b10_line_color: paletteTextOnBg(mixHexPair('#1a1a2a', '#0f172a', 0.5), cardDef, 4.5),
      banner_b10_cta_ink: paletteTextOnBg('#ffffff', darkDef, 4.5),
      banner_b10_logo_ink: paletteTextOnBg('#ffffff', darkDef, 4.5),
      banner_b10_right_bg_image: rightDef,
    });
    if (applyBrand) {
      const dark = brandFieldMidFromStops(a, b, tx);
      const { gradStart, gradEnd, mid } = brandStripGradientFromStops(a, b, tx);
      const cardBg = brandLightWashFromStops(a, b, tx);
      const lineOnCard = paletteTextOnBg(mixHexPair(tx, dark, 0.1), cardBg, 4.5);
      const ctaInk10 = paletteTextOnBg(tx, dark, 4.5);
      const logoInk10 = paletteTextOnBg(tx, dark, 4.5);
      const rightImg = `linear-gradient(160deg,${mixHexPair(mid, ac, 0.18)} 0%,${mixHexWithWhite(gradEnd, 0.1)} 40%,${mixHexPair(gradEnd, b, 0.28)} 72%,${mixHexWithBlack(gradStart, 0.15)} 100%)`;
      Object.assign(out, {
        banner_b10_dark: dark,
        banner_b10_accent: mixHexPair(ac, mixHexPair(a, '#fbbf24', 0.35), 0.5),
        banner_b10_dot1: mixHexPair(a, ac, 0.55),
        banner_b10_dot2: mixHexWithWhite(mixHexPair(tx, b, 0.25), 0.5),
        banner_b10_bar_grad: `linear-gradient(to bottom,${mixHexPair(a, b, 0.4)},${mixHexWithBlack(
          b,
          0.25
        )})`,
        banner_b10_card_bg: cardBg,
        banner_b10_line_color: lineOnCard,
        banner_b10_cta_ink: ctaInk10,
        banner_b10_logo_ink: logoInk10,
        banner_b10_right_bg_image: rightImg,
      });
    }
  }

  if (bannerKey === 'banner_11') {
    const cardDef11 = '#ffffff';
    Object.assign(out, {
      banner_b11_border: '#e8e8e8',
      banner_b11_card_bg: cardDef11,
      banner_b11_title_color: '#111111',
      banner_b11_sub_color: '#444444',
      banner_b11_cta_circle_bg: '#111111',
      banner_b11_cta_circle_ink: '#ffffff',
    });
    if (applyBrand) {
      const cardBg = brandLightWashFromStops(a, b, tx);
      const titleRaw = mixHexWithBlack(mixHexPair(tx, a, 0.12), 0.04);
      const subRaw = mixHexPair(tx, b, 0.28);
      const circleBg = enforceContrastOnBg(mixHexPair(tx, '#111111', 0.22), cardBg, 4.5);
      const circleInk = paletteTextOnBg(tx, circleBg, 4.5);
      Object.assign(out, {
        banner_b11_card_bg: cardBg,
        banner_b11_border: mixHexPair(cardBg, mixHexWithBlack(a, 0.35), 0.22),
        banner_b11_title_color: enforceContrastOnBg(titleRaw, cardBg, 4.5),
        banner_b11_sub_color: enforceContrastOnBg(subRaw, cardBg, 4.25),
        banner_b11_cta_circle_bg: circleBg,
        banner_b11_cta_circle_ink: circleInk,
      });
    }
  }

  if (bannerKey === 'banner_12') {
    Object.assign(out, {
      banner_b12_bg: '#1a2530',
      banner_b12_title_color: '#ffffff',
      banner_b12_sub: '#8a9baa',
      banner_b12_grid_line: '#2e4050',
      banner_b12_grid_cell: '#344d60',
      banner_b12_cta_tile_bg: '#253545',
      banner_b12_cta_tile_border: '#3a4e60',
      banner_b12_cta_tile_ink: '#ffffff',
    });
    if (applyBrand) {
      const bg = brandFieldMidFromStops(a, b, tx);
      const subMuted = mixHexPair(tx, mixHexWithWhite(tx, 0.38), 0.42);
      const gridLine = mixHexPair(bg, mixHexWithWhite(tx, 0.14), 0.3);
      const gridCell = mixHexPair(bg, mixHexPair(ac, mixHexWithWhite(tx, 0.18), 0.55), 0.32);
      const tileWash = brandLightWashFromStops(a, b, tx);
      const tileBg = relativeLuminance(tileWash) < 0.22 ? mixHexWithWhite(tileWash, 0.18) : tileWash;
      const tileInk = paletteTextOnBg(tx, tileBg, 4.5);
      const tileBorder = paletteTextOnBg(mixHexPair(ac, a, 0.35), tileBg, 3);
      Object.assign(out, {
        banner_b12_bg: bg,
        banner_b12_title_color: paletteTextOnBg(tx, bg, 4.5),
        banner_b12_sub: paletteTextOnBg(subMuted, bg, 3.1),
        banner_b12_grid_line: gridLine,
        banner_b12_grid_cell: gridCell,
        banner_b12_cta_tile_bg: tileBg,
        banner_b12_cta_tile_border: tileBorder,
        banner_b12_cta_tile_ink: tileInk,
      });
    }
  }

  if (bannerKey === 'banner_13') {
    Object.assign(out, {
      banner_b13_bg: '#2a9e72',
      banner_b13_grad: 'linear-gradient(135deg,#4cd68a 0%,#2a9e72 40%,#1e7a5e 100%)',
      banner_b13_title_color: '#ffffff',
      banner_b13_cta_color: '#ffffff',
      banner_b13_cta_pill_bg: '#ffffff',
      banner_b13_cta_pill_border: '#7dcfae',
      banner_b13_cta_pill_text: '#1e7a5e',
    });
    if (applyBrand) {
      const { gradEnd, mid } = brandStripGradientFromStops(a, b, tx);
      const copyBg = mixHexPair(mid, gradEnd, 0.42);
      const titleInk = paletteTextOnBg(tx, copyBg, 4.5);
      const pillBg = brandLightWashFromStops(a, b, tx);
      const pillBorder = paletteTextOnBg(mixHexPair(ac, a, 0.35), pillBg, 3);
      const pillText = paletteTextOnBg(tx, pillBg, 4.5);
      Object.assign(out, {
        banner_b13_bg: mid,
        banner_b13_grad: `linear-gradient(135deg,${mixHexWithWhite(ac, 0.25)} 0%,${mid} 40%,${gradEnd} 100%)`,
        banner_b13_title_color: titleInk,
        banner_b13_cta_color: pillText,
        banner_b13_cta_pill_bg: pillBg,
        banner_b13_cta_pill_border: pillBorder,
        banner_b13_cta_pill_text: pillText,
      });
    }
  }

  return out;
}
