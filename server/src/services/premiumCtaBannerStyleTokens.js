/**
 * Palette-driven inline colors for premium CTA strips (banner_5–banner_13).
 * When `apply_brand_palette_to_cta_banners` is false, defaults match the original static designs.
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

function norm(c, fallback) {
  const s = String(c || '').trim();
  return s && hexToRgb(s) ? s : fallback;
}

/** @param {boolean} applyBrand */
export function premiumCtaTokensForBanner(bannerKey, applyBrand, c1, c2, c3, c4) {
  const a = norm(c1, '#2563eb');
  const b = norm(c2, '#1e40af');
  const ac = norm(c3, '#64748b');
  const tx = norm(c4, '#0f172a');

  const out = {};

  if (bannerKey === 'banner_5') {
    Object.assign(out, {
      banner_b5_row_bg: '#0f2d6b',
      banner_b5_row_g1: '#0a1628',
      banner_b5_row_g2: '#0d2145',
      banner_b5_row_g3: '#0f2d6b',
      banner_b5_row_g4: '#1a3a80',
      banner_b5_rail_bg: '#0a1628',
      banner_b5_dot: '#00c4ff',
      banner_b5_accent: '#f9e000',
      banner_b5_cta_fill: '#2ecc71',
      banner_b5_cta_stroke: '#2ecc71',
      banner_b5_right_g1: '#1a3a80',
      banner_b5_right_g2: '#2a5298',
    });
    if (applyBrand) {
      Object.assign(out, {
        banner_b5_row_bg: mixHexWithBlack(a, 0.08),
        banner_b5_row_g1: mixHexWithBlack(a, 0.55),
        banner_b5_row_g2: mixHexPair(a, b, 0.35),
        banner_b5_row_g3: a,
        banner_b5_row_g4: mixHexPair(a, b, 0.65),
        banner_b5_rail_bg: mixHexWithBlack(a, 0.62),
        banner_b5_dot: mixHexPair(b, ac, 0.45),
        banner_b5_accent: mixHexPair(ac, '#fbbf24', 0.4),
        banner_b5_cta_fill: mixHexPair(b, ac, 0.55),
        banner_b5_cta_stroke: mixHexPair(b, ac, 0.45),
        banner_b5_right_g1: mixHexPair(a, b, 0.5),
        banner_b5_right_g2: mixHexWithWhite(b, 0.12),
      });
    }
  }

  if (bannerKey === 'banner_6') {
    const b6RightDefault = '#1c1c1c';
    const b6CtaBgDefault = '#ffe01b';
    Object.assign(out, {
      banner_b6_left_bg: '#1a1210',
      banner_b6_right_bg: b6RightDefault,
      banner_b6_panel_text: '#ffffff',
      banner_b6_cta_bg: b6CtaBgDefault,
      banner_b6_cta_text: '#1c1c1c',
    });
    if (applyBrand) {
      const rightBg = mixHexWithBlack(tx, 0.05);
      const ctaBg = mixHexPair(ac, '#fde047', 0.5);
      const ctaTextRaw = mixHexWithBlack(tx, 0.02);
      Object.assign(out, {
        banner_b6_left_bg: mixHexWithBlack(mixHexPair(a, tx, 0.12), 0.58),
        banner_b6_right_bg: rightBg,
        banner_b6_panel_text: enforceContrastOnBg('#ffffff', rightBg, 4.5),
        banner_b6_cta_bg: ctaBg,
        banner_b6_cta_text: enforceContrastOnBg(ctaTextRaw, ctaBg, 4.5),
      });
    }
  }

  if (bannerKey === 'banner_7') {
    Object.assign(out, {
      banner_b7_border: '#e8d94a',
      banner_b7_shell_bg: '#1a2355',
      banner_b7_rail_bg: '#111b42',
      banner_b7_mid_bg: '#1a2355',
      banner_b7_world_color: '#e8d94a',
      banner_b7_cta_bg: '#e8d94a',
      banner_b7_cta_text: '#1a2355',
      banner_b7_url: '#c8d8ff',
    });
    if (applyBrand) {
      const gold = mixHexPair(ac, '#facc15', 0.55);
      Object.assign(out, {
        banner_b7_border: gold,
        banner_b7_shell_bg: mixHexWithBlack(a, 0.35),
        banner_b7_rail_bg: mixHexWithBlack(a, 0.52),
        banner_b7_mid_bg: mixHexWithBlack(a, 0.35),
        banner_b7_world_color: gold,
        banner_b7_cta_bg: gold,
        banner_b7_cta_text: mixHexWithBlack(a, 0.25),
        banner_b7_url: mixHexWithWhite(b, 0.35),
      });
    }
  }

  if (bannerKey === 'banner_8') {
    Object.assign(out, {
      banner_b8_left_bg: '#1e2d1e',
      banner_b8_logo_muted: '#aac88a',
      banner_b8_scene_grad: 'linear-gradient(105deg,#e8f0d8 0%,#d4e8b0 40%,#b8d888 100%)',
      banner_b8_right_bg: '#7ab82a',
      banner_b8_headline_color: '#1a2e0a',
      banner_b8_sub_color: '#2a4a10',
      banner_b8_cta_bg: '#1e2d1e',
    });
    if (applyBrand) {
      Object.assign(out, {
        banner_b8_left_bg: mixHexWithBlack(a, 0.55),
        banner_b8_logo_muted: mixHexWithWhite(ac, 0.12),
        banner_b8_scene_grad: `linear-gradient(105deg,${mixHexWithWhite(ac, 0.55)} 0%,${mixHexPair(
          ac,
          b,
          0.35
        )} 40%,${mixHexPair(a, ac, 0.4)} 100%)`,
        banner_b8_right_bg: mixHexPair(a, b, 0.45),
        banner_b8_headline_color: mixHexWithBlack(tx, 0.08),
        banner_b8_sub_color: mixHexPair(tx, b, 0.35),
        banner_b8_cta_bg: mixHexWithBlack(a, 0.55),
      });
    }
  }

  if (bannerKey === 'banner_9') {
    Object.assign(out, {
      banner_b9_surface: '#f5f0e8',
      banner_b9_cta_bg: '#1e3d2f',
    });
    if (applyBrand) {
      Object.assign(out, {
        banner_b9_surface: mixHexWithWhite(mixHexPair(a, tx, 0.12), 0.75),
        banner_b9_cta_bg: mixHexPair(b, mixHexWithBlack(a, 0.2), 0.4),
      });
    }
  }

  if (bannerKey === 'banner_10') {
    Object.assign(out, {
      banner_b10_dark: '#1a1a2e',
      banner_b10_accent: '#f0b400',
      banner_b10_dot1: '#00aacc',
      banner_b10_dot2: '#cccccc',
      banner_b10_bar_grad: 'linear-gradient(to bottom,#00aacc,#0077aa)',
    });
    if (applyBrand) {
      const dark = mixHexWithBlack(tx, 0.02);
      Object.assign(out, {
        banner_b10_dark: dark,
        banner_b10_accent: mixHexPair(ac, '#fbbf24', 0.5),
        banner_b10_dot1: mixHexPair(a, ac, 0.55),
        banner_b10_dot2: mixHexWithWhite(tx, 0.55),
        banner_b10_bar_grad: `linear-gradient(to bottom,${mixHexPair(a, b, 0.4)},${mixHexWithBlack(
          b,
          0.25
        )})`,
      });
    }
  }

  if (bannerKey === 'banner_11') {
    Object.assign(out, {
      banner_b11_border: '#e8e8e8',
      banner_b11_card_bg: '#ffffff',
      banner_b11_title_color: '#111111',
      banner_b11_sub_color: '#444444',
    });
    if (applyBrand) {
      const cardBg = mixHexWithWhite(mixHexPair(a, ac, 0.28), 0.76);
      const titleRaw = mixHexWithBlack(mixHexPair(tx, a, 0.12), 0.04);
      const subRaw = mixHexPair(tx, b, 0.28);
      Object.assign(out, {
        banner_b11_card_bg: cardBg,
        banner_b11_border: mixHexPair(cardBg, mixHexWithBlack(a, 0.35), 0.22),
        banner_b11_title_color: enforceContrastOnBg(titleRaw, cardBg, 4.5),
        banner_b11_sub_color: enforceContrastOnBg(subRaw, cardBg, 4.25),
      });
    }
  }

  if (bannerKey === 'banner_12') {
    Object.assign(out, {
      banner_b12_bg: '#1a2530',
      banner_b12_sub: '#8a9baa',
    });
    if (applyBrand) {
      Object.assign(out, {
        banner_b12_bg: mixHexWithBlack(a, 0.42),
        banner_b12_sub: mixHexWithWhite(mixHexPair(b, ac, 0.35), 0.22),
      });
    }
  }

  if (bannerKey === 'banner_13') {
    Object.assign(out, {
      banner_b13_bg: '#2a9e72',
      banner_b13_grad: 'linear-gradient(135deg,#4cd68a 0%,#2a9e72 40%,#1e7a5e 100%)',
    });
    if (applyBrand) {
      const mid = mixHexPair(a, b, 0.45);
      Object.assign(out, {
        banner_b13_bg: mid,
        banner_b13_grad: `linear-gradient(135deg,${mixHexWithWhite(ac, 0.25)} 0%,${mid} 40%,${mixHexWithBlack(
          b,
          0.15
        )} 100%)`,
      });
    }
  }

  return out;
}
