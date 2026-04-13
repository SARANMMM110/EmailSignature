/**
 * Preset palettes (optional use in editor / API). Four stops: primary, secondary, accent, text.
 */
export const GALLERY_PALETTES = [
  { id: 'ocean', name: 'Ocean Blue', colors: ['#1e3a5f', '#2d6a9f', '#a8d4f5', '#0f172a'] },
  { id: 'bw', name: 'Black & White', colors: ['#111111', '#333333', '#e0e0e0', '#0f172a'] },
  { id: 'forest', name: 'Forest', colors: ['#1b4332', '#2d6a4f', '#95d5b2', '#0f172a'] },
  { id: 'sunset', name: 'Sunset', colors: ['#c1121f', '#e85d04', '#ffd166', '#1c1917'] },
  { id: 'webflow', name: 'Indigo', colors: ['#4353ff', '#1a1f71', '#c5cff5', '#0f172a'] },
  { id: 'airbnb', name: 'Coral', colors: ['#ff385c', '#6a0f26', '#ffb3bf', '#1c1917'] },
  { id: 'uber', name: 'Mint', colors: ['#06c167', '#064e3b', '#b8f5d4', '#0f172a'] },
  { id: 'gold', name: 'Gold', colors: ['#b45309', '#78350f', '#fde68a', '#1c1917'] },
];

export const DEFAULT_GALLERY_PALETTE_ID = GALLERY_PALETTES[0].id;

export function getGalleryPaletteById(id) {
  return GALLERY_PALETTES.find((p) => p.id === id) || GALLERY_PALETTES[0];
}
