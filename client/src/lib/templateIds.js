/** Stable template UUIDs — map gallery rows to HTML engines. */

const TEMPLATE_1_UUID = 'a0000001-0000-4000-8000-000000000001';
const TEMPLATE_2_UUID = 'a0000002-0000-4000-8000-000000000002';
const TEMPLATE_3_UUID = 'a0000003-0000-4000-8000-000000000003';
const TEMPLATE_4_UUID = 'a0000004-0000-4000-8000-000000000004';
const TEMPLATE_5_UUID = 'a0000005-0000-4000-8000-000000000005';
const TEMPLATE_6_UUID = 'a0000006-0000-4000-8000-000000000006';
const TEMPLATE_7_UUID = 'a0000007-0000-4000-8000-000000000007';
const TEMPLATE_8_UUID = 'a0000008-0000-4000-8000-000000000008';

export const UUID_TO_TEMPLATE_SLUG = {
  'a0000001-0000-4000-8000-000000000001': 'template_1',
  'a0000002-0000-4000-8000-000000000002': 'template_2',
  'a0000003-0000-4000-8000-000000000003': 'template_3',
  'a0000004-0000-4000-8000-000000000004': 'template_4',
  'a0000005-0000-4000-8000-000000000005': 'template_5',
  'a0000006-0000-4000-8000-000000000006': 'template_6',
  'a0000007-0000-4000-8000-000000000007': 'template_7',
  'a0000008-0000-4000-8000-000000000008': 'template_8',
  'a0000009-0000-4000-8000-000000000009': 'template_1',
};

/** Reverse map — slug → DB `template_id` FK. */
export const TEMPLATE_SLUG_TO_UUID = {
  template_1: TEMPLATE_1_UUID,
  template_2: TEMPLATE_2_UUID,
  template_3: TEMPLATE_3_UUID,
  template_4: TEMPLATE_4_UUID,
  template_5: TEMPLATE_5_UUID,
  template_6: TEMPLATE_6_UUID,
  template_7: TEMPLATE_7_UUID,
  template_8: TEMPLATE_8_UUID,
};

export const TEMPLATE_SLUG_LABELS = {
  template_1: 'Layout 1',
  template_2: 'Layout 2',
  template_3: 'Layout 3',
  template_4: 'Layout 4',
  template_5: 'Layout 5',
  template_6: 'Layout 6',
  template_7: 'Layout 7',
  template_8: 'Layout 8',
};

/** Webinar / “Banner 1” layout — matches engine `banner_1`. */
export const WEBINAR_BANNER_UUID = 'b0000003-0000-4000-8000-000000000003';

/** Slug → DB `banner_id` FK — must match server `templateIds.js` and Supabase seed. */
export const BANNER_SLUG_TO_UUID = {
  'book-call': 'b0000001-0000-4000-8000-000000000001',
  download: 'b0000002-0000-4000-8000-000000000002',
  webinar: WEBINAR_BANNER_UUID,
  'need-call': 'b0000004-0000-4000-8000-000000000004',
};

export function isWebinarBannerPreset(presetId, bannerId) {
  const p = String(presetId || '').toLowerCase();
  if (p.includes('webinar')) return true;
  const id = String(bannerId || '').toLowerCase();
  return id === WEBINAR_BANNER_UUID;
}

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
  if (/^template_\d+$/i.test(s)) return 'template_1';
  return 'template_1';
}

const UUID_TEMPLATE_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Canonical layout slug for editor state. */
export function normalizeSignatureTemplateSlug(design, template_id) {
  const ordered = [template_id, design?.templateId, design?.template_slug];
  for (const c of ordered) {
    if (c == null || c === '') continue;
    const s = String(c).trim();
    if (!s) continue;
    if (/^template_image$/i.test(s)) return 'template_1';
    if (/^template_2$/i.test(s)) return 'template_2';
    if (/^template_3$/i.test(s)) return 'template_3';
    if (/^template_4$/i.test(s)) return 'template_4';
    if (/^template_5$/i.test(s)) return 'template_5';
    if (/^template_6$/i.test(s)) return 'template_6';
    if (/^template_7$/i.test(s)) return 'template_7';
    if (/^template_8$/i.test(s)) return 'template_8';
    if (/^template_\d+$/i.test(s)) return 'template_1';
    if (UUID_TEMPLATE_RE.test(s)) return uuidToTemplateSlug(s);
  }
  return 'template_1';
}

/** Editor preview / export rail width: Layout 2 = 500px; Layout 4 = 470px; Layout 1 & 5 = 520px; Layout 3 = 600px. */
export function bundleRailPxForEngineSlug(slug) {
  const s = String(slug || '').toLowerCase();
  if (s === 'template_2') return 500;
  if (s === 'template_4') return 470;
  if (s === 'template_1' || s === 'template_5') return 520;
  return 600;
}

/** @param {{ design?: { templateId?: string }, template_id?: string } | null | undefined} signature */
export function bundleRailPxForSignature(signature) {
  const slug = normalizeSignatureTemplateSlug(signature?.design, signature?.template_id);
  return bundleRailPxForEngineSlug(slug);
}

export function isImageTemplateSignature() {
  return false;
}

/** Map catalog / gallery id to the HTML engine used for live preview + save. */
export function engineSlugForGalleryPreview(slug) {
  const s = String(slug).toLowerCase();
  if (s === 'template_2') return 'template_2';
  if (s === 'template_3') return 'template_3';
  if (s === 'template_4') return 'template_4';
  if (s === 'template_5') return 'template_5';
  if (s === 'template_6') return 'template_6';
  if (s === 'template_7') return 'template_7';
  if (s === 'template_8') return 'template_8';
  return 'template_1';
}

export const TEMPLATE_HAS_LOGO = {
  template_1: true,
  template_2: true,
  template_3: true,
  template_4: true,
  template_5: true,
  template_6: true,
  template_7: true,
  template_8: true,
};

/** @param {string | undefined} slugOrUuid */
export function templateSlugSupportsLogo(slugOrUuid) {
  if (!slugOrUuid) return true;
  const s = String(slugOrUuid).toLowerCase();
  if (s.includes('template_3')) return TEMPLATE_HAS_LOGO.template_3 !== false;
  if (s.includes('template_4')) return TEMPLATE_HAS_LOGO.template_4 !== false;
  if (s.includes('template_5')) return TEMPLATE_HAS_LOGO.template_5 !== false;
  if (s.includes('template_6')) return TEMPLATE_HAS_LOGO.template_6 !== false;
  if (s.includes('template_7')) return TEMPLATE_HAS_LOGO.template_7 !== false;
  if (s.includes('template_8')) return TEMPLATE_HAS_LOGO.template_8 !== false;
  if (s.includes('template_2')) return TEMPLATE_HAS_LOGO.template_2 !== false;
  return TEMPLATE_HAS_LOGO.template_1 !== false;
}

/** @param {{ design?: { templateId?: string }, template_id?: string } | null | undefined} signature */
export function signatureLayoutSupportsLogo(signature) {
  if (!signature) return true;
  return templateSlugSupportsLogo(signature.design?.templateId || signature.template_id);
}

export function displayNameForTemplateRow(row) {
  const explicit = row?.name;
  if (explicit != null && String(explicit).trim() !== '') return String(explicit).trim();
  const id = row?.id != null ? String(row.id).toLowerCase() : '';
  if (UUID_TO_TEMPLATE_SLUG[id]) {
    const slug = UUID_TO_TEMPLATE_SLUG[id];
    return TEMPLATE_SLUG_LABELS[slug] || slug;
  }
  return TEMPLATE_SLUG_LABELS.template_1;
}
