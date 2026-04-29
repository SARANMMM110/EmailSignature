/**
 * WCAG-style contrast helpers for smart palette / readability checks.
 * @typedef {{ role: string, label: string, ratio: number, min: number, fg: string, bg: string }} PaletteContrastIssue
 */

export function normalizeHex(input) {
  const s = String(input ?? '')
    .trim()
    .replace(/^#/, '');
  if (!s) return '#000000';
  if (s.length === 3) {
    const a = s[0] + s[0];
    const b = s[1] + s[1];
    const c = s[2] + s[2];
    return `#${a}${b}${c}`.toLowerCase();
  }
  if (s.length === 6 && /^[0-9a-f]{6}$/i.test(s)) return `#${s.toLowerCase()}`;
  return '#000000';
}

export function hexToRgb(hex) {
  const h = normalizeHex(hex).slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Relative luminance (sRGB), WCAG 2.1 */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(fgHex, bgHex) {
  const L1 = relativeLuminance(fgHex);
  const L2 = relativeLuminance(bgHex);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pick #0f172a or #f8fafc whichever reads better on `bg`. */
export function pickReadableTextOnBackground(bgHex) {
  const bg = normalizeHex(bgHex);
  const dark = '#0f172a';
  const light = '#f8fafc';
  return contrastRatio(dark, bg) >= contrastRatio(light, bg) ? dark : light;
}

export function mixHex(a, b, t) {
  const A = hexToRgb(normalizeHex(a));
  const B = hexToRgb(normalizeHex(b));
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(A.r + (B.r - A.r) * u);
  const g = Math.round(A.g + (B.g - A.g) * u);
  const b2 = Math.round(A.b + (B.b - A.b) * u);
  const to = (n) => n.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b2)}`;
}

/**
 * Map Simple mode (brand / body / surface) → engine 4-tuple [primary, secondary, accent, text].
 */
export function deriveFourFromSimple(mainHex, textHex, surfaceHex) {
  const main = normalizeHex(mainHex);
  const surface = normalizeHex(surfaceHex);
  const secondary = mixHex(main, '#0f172a', 0.28);
  const accent = mixHex(surface, '#ffffff', surface === '#000000' || relativeLuminance(surface) < 0.08 ? 0.35 : 0.12);
  let text = normalizeHex(textHex);
  if (contrastRatio(text, accent) < 4.5) text = pickReadableTextOnBackground(accent);
  if (contrastRatio(text, '#ffffff') < 3 && contrastRatio(text, main) < 3) {
    text = pickReadableTextOnBackground('#ffffff');
  }
  return [main, secondary, accent, text];
}

/**
 * Nudge body text & accent so common email-signature pairs stay readable.
 * @param {string[]} colors [primary, secondary, accent, text]
 */
export function polishPaletteFour(colors) {
  if (!Array.isArray(colors) || colors.length < 4) return colors;
  let [p, s, a, t] = colors.map(normalizeHex);
  const MIN_BODY = 4.5;
  const MIN_LARGE = 3.1;

  if (contrastRatio(t, a) < MIN_BODY) t = pickReadableTextOnBackground(a);
  if (contrastRatio(t, '#ffffff') < MIN_LARGE) {
    const t2 = pickReadableTextOnBackground('#ffffff');
    if (contrastRatio(t2, a) >= contrastRatio(t, a)) t = t2;
  }
  if (contrastRatio(t, p) < MIN_LARGE && relativeLuminance(p) > 0.55) {
    t = pickReadableTextOnBackground(p);
  }
  if (contrastRatio(p, a) < MIN_LARGE && relativeLuminance(p) > 0.7) {
    p = mixHex(p, '#0f172a', 0.18);
  }
  return [p, s, a, t];
}

/**
 * @param {string[]} colors [primary, secondary, accent, text]
 * @returns {{ ok: boolean, issues: PaletteContrastIssue[] }}
 */
export function analyzePaletteReadability(colors) {
  if (!Array.isArray(colors) || colors.length < 4) {
    return { ok: true, issues: [] };
  }
  const [p, s, a, t] = colors.map(normalizeHex);
  /** @type {PaletteContrastIssue[]} */
  const issues = [];

  const push = (role, label, fg, bg, min) => {
    const ratio = contrastRatio(fg, bg);
    if (ratio < min) issues.push({ role, label, ratio, min, fg, bg });
  };

  push('text', 'Body text on light panels (accent)', t, a, 4.5);
  push('text', 'Text near white areas', t, '#ffffff', 3);
  push('primary', 'Primary on white (headlines / bars)', p, '#ffffff', 3);
  push('secondary', 'Secondary on white (icons / labels)', s, '#ffffff', 3);

  return { ok: issues.length === 0, issues };
}
