/**
 * Global dynamic theme for signature + CTA + premium strips.
 * Built from the editor’s four stops: primary, secondary, accent, text (same as color_1–4).
 *
 * Handlebars: `{{theme.primary_background}}`, `{{theme.text_on_primary}}`, etc.
 * Extra keys beyond the nine semantic names help per-surface templates (e.g. split cards).
 */

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/i.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function normalizeHex(input) {
  const s = String(input ?? '')
    .trim()
    .replace(/^#/, '');
  if (!s) return '#2563eb';
  if (s.length === 3) {
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`.toLowerCase();
  }
  if (s.length === 6 && /^[0-9a-f]{6}$/i.test(s)) return `#${s.toLowerCase()}`;
  return '#2563eb';
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

function mixHexWithWhite(hex, t) {
  return mixHexPair(hex, '#ffffff', t);
}

function mixHexWithBlack(hex, t) {
  return mixHexPair(hex, '#000000', t);
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
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

/** Prefer the user’s text swatch when contrast is OK; otherwise nudge for readability. */
export function paletteTextOnSurface(textHex, surfaceHex, minRatio = 4.5) {
  const t = String(textHex ?? '').trim();
  const s = String(surfaceHex ?? '').trim();
  if (hexToRgb(t) && hexToRgb(s) && wcagContrastRatio(t, s) >= minRatio) return t;
  const fallback = relativeLuminance(s) > 0.45 ? '#0f172a' : '#ffffff';
  return enforceContrastOnSurface(t || fallback, s, minRatio);
}

function surfaceLightCard(textHex) {
  const c = String(textHex || '#ffffff').trim();
  if (relativeLuminance(c) >= 0.88) return normalizeHex(c);
  return '#ffffff';
}

function pickButtonBackground(c1, c3) {
  const L3 = relativeLuminance(c3);
  if (L3 > 0.12 && L3 < 0.9) return normalizeHex(c3);
  return normalizeHex(c1);
}

/**
 * @param {{ primary?: string, secondary?: string, accent?: string, text?: string }} palette
 * @returns {Record<string, string>}
 */
export function buildEmailTheme(palette = {}) {
  const primary_background = normalizeHex(palette.primary);
  const secondary_background = normalizeHex(palette.secondary || palette.primary);
  const accent_color = normalizeHex(palette.accent);
  const textSwatch = normalizeHex(palette.text);

  const brandMid = mixHexPair(primary_background, secondary_background, 0.5);

  const primary_text = paletteTextOnSurface(textSwatch, brandMid, 4.5);
  const secondary_text = paletteTextOnSurface(
    mixHexPair(primary_text, accent_color, 0.38),
    brandMid,
    3.0
  );

  const button_color = pickButtonBackground(primary_background, accent_color);
  const button_text = paletteTextOnSurface(textSwatch, button_color, 4.5);

  const border_color = mixHexPair(primary_background, secondary_background, 0.42);
  const icon_color = paletteTextOnSurface(accent_color, primary_background, 3.1);

  const surface_light = surfaceLightCard(textSwatch);
  const text_on_primary = paletteTextOnSurface(textSwatch, primary_background, 4.5);
  const text_on_secondary = paletteTextOnSurface(textSwatch, secondary_background, 4.5);
  const text_on_light_card = paletteTextOnSurface(textSwatch, surface_light, 4.5);
  /** Small footer / meta line on white email canvas (e.g. “Made with …”). */
  const caption_muted = paletteTextOnSurface(
    mixHexPair(secondary_text, border_color, 0.5),
    '#ffffff',
    3.1
  );
  /** Copy on near-black strips (~#111) while respecting the text swatch when contrast is OK. */
  const text_on_dark = paletteTextOnSurface(textSwatch, '#111111', 4.5);

  return {
    primary_background,
    secondary_background,
    primary_text,
    secondary_text,
    accent_color,
    button_color,
    button_text,
    border_color,
    icon_color,
    surface_light,
    text_on_primary,
    text_on_secondary,
    text_on_light_card,
    caption_muted,
    text_on_dark,
  };
}
