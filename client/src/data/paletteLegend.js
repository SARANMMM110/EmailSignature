/** Human-readable roles for the 4 engine stops (matches server `contextFromEditorPayload` usage). */
export const PALETTE_ROLE_KEYS = ['primary', 'secondary', 'accent', 'text'];

export const PALETTE_ROLE_LEGEND = {
  primary: {
    title: 'Primary',
    short: 'Background 1',
    description: 'Largest brand fills and gradients (signature shells and CTA strip bases).',
  },
  secondary: {
    title: 'Secondary',
    short: 'Background 2',
    description: 'Second tone for depth, rails, and blended backgrounds with primary.',
  },
  accent: {
    title: 'Accent',
    short: 'Labels & icons',
    description: 'Pills, icon strokes, highlight lines, and softer decorative panels.',
  },
  text: {
    title: 'Text',
    short: 'Body copy',
    description: 'Names, paragraphs, phone, email, address, and other main readable copy.',
  },
};

/** Derived hint (not a separate engine slot). */
export const PALETTE_BORDER_HINT =
  'Dividers and hairlines usually blend Secondary with Text — tune those for sharper or softer separators.';

/** Shown near the colour legend — same four engine stops for signature + CTA (layouts map slot 1 to the largest shell where the design has one). */
export const PALETTE_LEGEND_CTA_ALIGNMENT =
  'Signature and CTA banners share these roles: background 1 and 2 for large fills and gradients, text for main copy, accent for labels, pills, and icon tints.';

/**
 * Editor “Colour legend” order and copy. Each slot maps to one engine index in `design.colors`:
 * `[0]=primary`, `[1]=secondary`, `[2]=accent`, `[3]=text` (same as server / export).
 */
export const PALETTE_EDITOR_LEGEND_SLOTS = [
  {
    id: 'legend-bg',
    engineIndex: 0,
    title: 'Background colour 1',
    short: 'Primary',
    description: 'First brand fill: main field, bars, and large colour blocks (engine: primary).',
  },
  {
    id: 'legend-secondary',
    engineIndex: 1,
    title: 'Background colour 2',
    short: 'Secondary',
    description: 'Second brand tone blended into shells and depth (engine: secondary).',
  },
  {
    id: 'legend-text',
    engineIndex: 3,
    title: 'Text colour',
    short: 'Body copy',
    description: 'Name, paragraphs, phone, email, address, and other main readable text (engine: text).',
  },
  {
    id: 'legend-icons',
    engineIndex: 2,
    title: 'Labels and icon colour',
    short: 'Accent',
    description: 'Pills, icon tints, stripes, and softer surfaces (engine: accent).',
  },
];
