/**
 * Canonical four-stop defaults when palette / `design.colors` slots are missing or invalid.
 * Keep in sync with `server/src/lib/enginePaletteDefaults.js`.
 */
export const ENGINE_PALETTE_DEFAULTS = Object.freeze({
  primary: '#2563eb',
  secondary: '#1e40af',
  accent: '#64748b',
  text: '#0f172a',
});

export const ENGINE_PALETTE_DEFAULT_ARRAY = Object.freeze([
  ENGINE_PALETTE_DEFAULTS.primary,
  ENGINE_PALETTE_DEFAULTS.secondary,
  ENGINE_PALETTE_DEFAULTS.accent,
  ENGINE_PALETTE_DEFAULTS.text,
]);

function validHexLoose(s) {
  const t = String(s ?? '')
    .trim()
    .replace(/^#/, '');
  if (!t) return false;
  if (t.length === 3) return /^[0-9a-f]{3}$/i.test(t);
  if (t.length === 6) return /^[0-9a-f]{6}$/i.test(t);
  return false;
}

/**
 * Always returns four parseable hex strings for `design.colors` + preview payloads.
 * @param {unknown} colors
 * @param {{ primary?: string, secondary?: string, accent?: string, text?: string }} [designPalette]
 */
export function normalizedEngineColorStops(colors, designPalette = {}) {
  const c = Array.isArray(colors) ? colors : [];
  const p = designPalette && typeof designPalette === 'object' ? designPalette : {};
  const keys = ['primary', 'secondary', 'accent', 'text'];
  const out = [];
  for (let i = 0; i < 4; i++) {
    let v = String(c[i] ?? '').trim() || String(p[keys[i]] ?? '').trim();
    if (!validHexLoose(v)) v = ENGINE_PALETTE_DEFAULTS[keys[i]];
    const raw = v.startsWith('#') ? v.slice(1) : v.replace(/^#/, '');
    out.push(`#${raw.toLowerCase()}`);
  }
  return out;
}
