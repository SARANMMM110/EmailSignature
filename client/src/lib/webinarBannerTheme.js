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

function primaryOnWhite(primaryHex, textCandidate) {
  const primary = String(primaryHex || '#1e3a5f').trim();
  if (relativeLuminance(primary) <= 0.62) return primary;
  const text = String(textCandidate || '').trim();
  if (text && relativeLuminance(text) <= 0.55) return text;
  return '#0f172a';
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

function companyMutedColor(textHex, secondaryHex) {
  const t = String(textHex || '').trim();
  if (t && relativeLuminance(t) >= 0.18 && relativeLuminance(t) <= 0.55) return t;
  const s = String(secondaryHex || '').trim();
  if (s && relativeLuminance(s) >= 0.25 && relativeLuminance(s) <= 0.6) return mixHexWithWhite(s, 0.35);
  return '#6b7280';
}

function bannerHeadlineOnDark(c4) {
  const c = String(c4 || '').trim();
  if (c && relativeLuminance(c) > 0.82) return c;
  return '#ffffff';
}

function bannerSublineOnDark(c3) {
  const c = String(c3 || '').trim();
  const L3 = relativeLuminance(c);
  if (!c) return mixHexWithWhite('#ffffff', 0.14);
  if (L3 > 0.62) return mixHexWithWhite(c, 0.08);
  return mixHexWithWhite(c, 0.38);
}

function bannerCtaOnDark(c1, c2, c3, c4) {
  const L3 = relativeLuminance(c3);
  if (L3 > 0.42 && L3 < 0.94) {
    return {
      bg: String(c3).trim(),
      text: primaryOnWhite(c3, pickDarkestReadable([c1, c2, c4], 0.45)),
    };
  }
  const L4 = relativeLuminance(c4);
  if (L4 > 0.82) {
    return {
      bg: String(c4).trim(),
      text: primaryOnWhite(c4, pickDarkestReadable([c1, c2], 0.48)),
    };
  }
  return {
    bg: '#ffffff',
    text: primaryOnWhite(c1, pickDarkestReadable([c2, c4], 0.48)),
  };
}

export function webinarBannerStyleVars(color1, color2, color3, color4) {
  const c1 = String(color1 || '#1a1d21').trim();
  const c2 = String(color2 || c1).trim();
  const c3 = String(color3 || '#94a3b8').trim();
  const c4 = String(color4 || '#0f172a').trim();
  const L = relativeLuminance(c1);
  const darkBg = L < 0.55;

  if (darkBg) {
    const cta = bannerCtaOnDark(c1, c2, c3, c4);
    return {
      banner_bg_start: mixHexWithWhite(c1, 0.06),
      banner_bg_mid: c1,
      banner_bg_end: mixHexWithBlack(c2, 0.38),
      banner_headline_color: bannerHeadlineOnDark(c4),
      banner_subline_color: bannerSublineOnDark(c3),
      banner_cta_bg: cta.bg,
      banner_cta_text: cta.text,
      banner_bar_1: c2,
      banner_bar_2: mixHexWithWhite(c2, 0.12),
      banner_bar_3: c3,
      banner_bar_4: mixHexWithWhite(c3, relativeLuminance(c3) > 0.55 ? 0.06 : 0.28),
      banner_bar_5:
        relativeLuminance(c4) > 0.85 ? mixHexWithWhite(c2, 0.22) : mixHexWithWhite(c4, 0.35),
    };
  }

  const headline = pickDarkestReadable([c4, c1, mixHexWithBlack(c2, 0.12)], 0.48);
  const subline = companyMutedColor(c4, c2);
  const ctaBg = pickDarkestReadable([c3, c2, mixHexWithBlack(c1, 0.18)], 0.44);

  return {
    banner_bg_start: mixHexWithWhite(c3, 0.35),
    banner_bg_mid: mixHexWithWhite(c1, 0.28),
    banner_bg_end: mixHexWithWhite(c2, 0.14),
    banner_headline_color: headline,
    banner_subline_color: subline,
    banner_cta_bg: ctaBg,
    banner_cta_text: '#ffffff',
    banner_bar_1: mixHexWithBlack(c1, 0.08),
    banner_bar_2: c1,
    banner_bar_3: c2,
    banner_bar_4: mixHexWithWhite(c3, 0.12),
    banner_bar_5: pickDarkestReadable([c4, c2], 0.45),
  };
}
