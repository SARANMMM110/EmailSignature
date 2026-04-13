/** UUID → slug for HTML generation (must match client `templateIds.js`). */
export const UUID_TO_TEMPLATE_SLUG = {
  'a0000001-0000-4000-8000-000000000001': 'template_1',
  'a0000002-0000-4000-8000-000000000002': 'template_2',
  'a0000003-0000-4000-8000-000000000003': 'template_3',
  /** Legacy “Card Style” gallery row → Layout 4 (dark card). */
  'a0000004-0000-4000-8000-000000000004': 'template_4',
  'a0000005-0000-4000-8000-000000000005': 'template_5',
  'a0000006-0000-4000-8000-000000000006': 'template_6',
  'a0000007-0000-4000-8000-000000000007': 'template_7',
  'a0000008-0000-4000-8000-000000000008': 'template_8',
  'a0000009-0000-4000-8000-000000000009': 'template_9',
};

/** Stable UUIDs — must match supabase template seed migrations (e.g. 002, 009, 010). */
const TEMPLATE_1_UUID = 'a0000001-0000-4000-8000-000000000001';
const TEMPLATE_2_UUID = 'a0000002-0000-4000-8000-000000000002';
const TEMPLATE_3_UUID = 'a0000003-0000-4000-8000-000000000003';
const TEMPLATE_4_UUID = 'a0000004-0000-4000-8000-000000000004';
const TEMPLATE_5_UUID = 'a0000005-0000-4000-8000-000000000005';
const TEMPLATE_6_UUID = 'a0000006-0000-4000-8000-000000000006';
const TEMPLATE_7_UUID = 'a0000007-0000-4000-8000-000000000007';
const TEMPLATE_8_UUID = 'a0000008-0000-4000-8000-000000000008';
const TEMPLATE_9_UUID = 'a0000009-0000-4000-8000-000000000009';

export const TEMPLATE_SLUG_TO_UUID = {
  template_1: TEMPLATE_1_UUID,
  template_2: TEMPLATE_2_UUID,
  template_3: TEMPLATE_3_UUID,
  template_4: TEMPLATE_4_UUID,
  template_5: TEMPLATE_5_UUID,
  template_6: TEMPLATE_6_UUID,
  template_7: TEMPLATE_7_UUID,
  template_8: TEMPLATE_8_UUID,
  template_9: TEMPLATE_9_UUID,
  'classic-table': TEMPLATE_1_UUID,
  'minimal-stack': TEMPLATE_1_UUID,
  'corporate-strip': TEMPLATE_1_UUID,
};

export const BANNER_SLUG_TO_UUID = {
  'book-call': 'b0000001-0000-4000-8000-000000000001',
  download: 'b0000002-0000-4000-8000-000000000002',
  webinar: 'b0000003-0000-4000-8000-000000000003',
  'need-call': 'b0000004-0000-4000-8000-000000000004',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {string} [uuid]
 * @returns {string} engine slug e.g. template_1, template_2
 */
export function uuidToTemplateSlug(uuid) {
  if (!uuid) return 'template_1';
  const s = String(uuid).trim().toLowerCase();
  if (UUID_TO_TEMPLATE_SLUG[s]) return UUID_TO_TEMPLATE_SLUG[s];
  if (/^template_3$/i.test(s)) return 'template_3';
  if (/^template_2$/i.test(s)) return 'template_2';
  if (/^template_4$/i.test(s)) return 'template_4';
  if (/^template_5$/i.test(s)) return 'template_5';
  if (/^template_6$/i.test(s)) return 'template_6';
  if (/^template_7$/i.test(s)) return 'template_7';
  if (/^template_8$/i.test(s)) return 'template_8';
  if (/^template_9$/i.test(s)) return 'template_9';
  if (/^template_\d+$/i.test(s)) return 'template_1';
  return 'template_1';
}

export function resolveTemplateUuid(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim();
  if (UUID_RE.test(s)) return s;
  return TEMPLATE_SLUG_TO_UUID[s] || null;
}

export function resolveBannerUuid(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim().toLowerCase();
  if (UUID_RE.test(s)) return s;
  if (s.includes('download')) return BANNER_SLUG_TO_UUID.download;
  if (s.includes('webinar')) return BANNER_SLUG_TO_UUID.webinar;
  if (s.includes('need')) return BANNER_SLUG_TO_UUID['need-call'];
  if (s.includes('book') || s.includes('call')) return BANNER_SLUG_TO_UUID['book-call'];
  return null;
}

/**
 * Expanded catalog uses ids template_1 … template_n; HTML uses one engine per slug (see {@link resolveTemplateKey}).
 * Thumbnail URLs must use the same engine slug as {@link resolveTemplateKey} or the gallery
 * image will not match the rendered signature.
 * @param {string} id e.g. template_8
 * @returns {string | null} e.g. template_1, or null if not template_\d+
 */
export function engineSlugFromCatalogTemplateId(id) {
  if (id == null || typeof id !== 'string') return null;
  const m = /^template_(\d+)$/i.exec(id.trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n === 2) return 'template_2';
  if (n === 3) return 'template_3';
  if (n === 4) return 'template_4';
  if (n === 5) return 'template_5';
  if (n === 6) return 'template_6';
  if (n === 7) return 'template_7';
  if (n === 8) return 'template_8';
  if (n === 9) return 'template_9';
  return 'template_1';
}

/** Bundle / preview rail: Layout 1 & 5 = 520px; Layout 2 & 4 = 470px; Layout 3 = 600px (must match client editor preview). */
export function bundleRailPxForEngineSlug(slug) {
  const s = String(slug || '').toLowerCase();
  if (s === 'template_2' || s === 'template_4') return 470;
  if (s === 'template_1' || s === 'template_5') return 520;
  return 600;
}
