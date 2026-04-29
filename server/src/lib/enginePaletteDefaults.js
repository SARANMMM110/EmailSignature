/**
 * Canonical four-stop defaults when palette / `design.colors` slots are missing or invalid.
 * Used by signature HTML, CTA strips, and DB row → generate payloads — keep in sync with client copy.
 * Brand field / strip surfaces from these stops live in {@link ./engineBrandSurfaces.js}.
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
