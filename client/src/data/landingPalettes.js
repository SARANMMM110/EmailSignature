/**
 * Marketing landing page palettes — 4 hex colors [primary, secondary, accent, text]
 * aligned with editor `palette` object.
 */
export const LANDING_PALETTE_SWATCHES = [
  { id: 'p1', name: 'Ocean', colors: ['#2563eb', '#1d4ed8', '#93c5fd', '#0f172a'] },
  { id: 'p2', name: 'Indigo', colors: ['#4f46e5', '#4338ca', '#c7d2fe', '#1e1b4b'] },
  { id: 'p3', name: 'Teal', colors: ['#0d9488', '#0f766e', '#5eead4', '#042f2e'] },
  { id: 'p4', name: 'Emerald', colors: ['#059669', '#047857', '#6ee7b7', '#022c22'] },
  { id: 'p5', name: 'Rose', colors: ['#e11d48', '#be123c', '#fda4af', '#4c0519'] },
  { id: 'p6', name: 'Amber', colors: ['#d97706', '#b45309', '#fde68a', '#422006'] },
  { id: 'p7', name: 'Slate', colors: ['#334155', '#1e293b', '#94a3b8', '#020617'] },
  { id: 'p8', name: 'Violet', colors: ['#7c3aed', '#5b21b6', '#ddd6fe', '#1e1b4b'] },
];

/** 3×3 grid for dark “palette demo” section (includes repeats is OK — distinct looks). */
export const LANDING_PALETTE_GRID = [
  LANDING_PALETTE_SWATCHES[0],
  LANDING_PALETTE_SWATCHES[1],
  LANDING_PALETTE_SWATCHES[2],
  LANDING_PALETTE_SWATCHES[3],
  LANDING_PALETTE_SWATCHES[4],
  LANDING_PALETTE_SWATCHES[5],
  LANDING_PALETTE_SWATCHES[6],
  LANDING_PALETTE_SWATCHES[7],
  { id: 'p9', name: 'Core', colors: ['#5768f3', '#4752c4', '#b4b9ff', '#0f172a'] },
];

export const LANDING_TEMPLATE_ROWS = [
  { id: 'template_1', label: 'Pristine', tier: 'free' },
  { id: 'template_2', label: 'Aurora', tier: 'free' },
  { id: 'template_3', label: 'Lumen', tier: 'free' },
  { id: 'template_4', label: 'Meridian', tier: 'free' },
  { id: 'template_5', label: 'Vertex', tier: 'pro' },
  { id: 'template_6', label: 'Helix', tier: 'pro' },
  { id: 'template_7', label: 'Studio', tier: 'free' },
  { id: 'template_8', label: 'Split', tier: 'free' },
];
