/**
 * Resolved 4-stop palette for UI (primary, secondary, accent, text).
 * Matches merge logic in `signatureToEditorPayload` / PalettesTab selection.
 */
export function resolvePaletteColorsFromDesign(design) {
  if (!design || typeof design !== 'object') {
    return ['#2563eb', '#1e40af', '#64748b', '#0f172a'];
  }
  const colors = Array.isArray(design.colors) ? design.colors : [];
  const pal = design.palette || {};
  return [
    colors[0] ?? pal.primary ?? '#2563eb',
    colors[1] ?? pal.secondary ?? '#1e40af',
    colors[2] ?? pal.accent ?? '#64748b',
    colors[3] ?? pal.text ?? '#0f172a',
  ];
}
