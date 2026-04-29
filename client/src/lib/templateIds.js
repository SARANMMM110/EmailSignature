/** Stable template UUIDs — map gallery rows to HTML engines. */

/**
 * Layout 10 reference palette — intro gallery, layout-picker previews, and new signatures
 * until the user changes Palettes. Keep in sync with `TEMPLATE_10_CANONICAL_COLORS` on the server.
 */
export const TEMPLATE_10_CANONICAL_COLORS = Object.freeze([
  '#A6E22E', // primary — lime bar, pill, icons (match accent for vivid mode)
  '#1C1C1C', // secondary — charcoal shell
  '#A6E22E', // accent — same as primary → vivid lime-on-charcoal (image 2 reference)
  '#0f172a', // text — dark for pill label; headline stays light via generator
]);

/** Layout 11 — lime hero + dark contacts + round photo. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_11_CANONICAL_COLORS = Object.freeze([
  '#81cc27', // primary — banner field (reference)
  '#0c0c0d', // secondary — contact card fill
  '#e8e8e8', // accent — light row copy on black (icons use white in generator)
  '#1a1d15', // text — headline / near-black type
]);

/** Layout 12 — 520×162 Rheina card. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_12_CANONICAL_COLORS = Object.freeze([
  '#DFFF00',
  '#1a1a1a',
  '#FCF8F1',
  '#9A9894',
]);

/** Layout 13 — dark card + yellow rail. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_13_CANONICAL_COLORS = Object.freeze([
  '#FFD54F',
  '#1C1C1C',
  '#2a2a2a',
  '#FFFFFF',
]);

/** Layout 14 — light canvas + orange squircle. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_14_CANONICAL_COLORS = Object.freeze([
  '#F27121',
  '#EDEAE6',
  '#FFFFFF',
  '#0A0A0A',
]);

/** Layout 15 — chartreuse field + white tab/card (reference). Keep in sync with server `templateIds.js`. */
export const TEMPLATE_15_CANONICAL_COLORS = Object.freeze([
  '#D4FF1F',
  '#0a0a0a',
  '#ffffff',
  '#757575',
]);

/** Layout 16 — 600px banner; navy #0a192f. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_16_CANONICAL_COLORS = Object.freeze([
  '#0a192f',
  '#050f1f',
  '#ffffff',
  '#555555',
]);

/** Layout 17 — 600px creative card; lime #7dc242. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_17_CANONICAL_COLORS = Object.freeze([
  '#7dc242',
  '#111111',
  '#6db33f',
  '#000000',
]);

/** Layout 18 — clean charcoal + sage card. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_18_CANONICAL_COLORS = Object.freeze([
  '#A3B64F',
  '#0b131e',
  '#1f2a38',
  '#b9c2cf',
]);

/** Layout 19 — periwinkle + sage creative card. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_19_CANONICAL_COLORS = Object.freeze([
  '#8a94f8',
  '#6f78e8',
  '#bed896',
  '#000000',
]);

/** Layout 20 — neon dark card. Keep in sync with server `templateIds.js`. */
export const TEMPLATE_20_CANONICAL_COLORS = Object.freeze([
  '#39FF14',
  '#051a05',
  '#9ee89e',
  '#f0f4f0',
]);

/** Layout 21 — primary = shell, secondary = bronze rail (same legend order as server). */
export const TEMPLATE_21_CANONICAL_COLORS = Object.freeze([
  '#E5D8CD',
  '#8E623B',
  '#F5EFE8',
  '#000000',
]);

const TEMPLATE_1_UUID = 'a0000001-0000-4000-8000-000000000001';
const TEMPLATE_2_UUID = 'a0000002-0000-4000-8000-000000000002';
const TEMPLATE_3_UUID = 'a0000003-0000-4000-8000-000000000003';
const TEMPLATE_5_UUID = 'a0000005-0000-4000-8000-000000000005';
const TEMPLATE_6_UUID = 'a0000006-0000-4000-8000-000000000006';
const TEMPLATE_7_UUID = 'a0000007-0000-4000-8000-000000000007';
const TEMPLATE_8_UUID = 'a0000008-0000-4000-8000-000000000008';
const TEMPLATE_9_UUID = 'a0000009-0000-4000-8000-000000000009';
const TEMPLATE_10_UUID = 'a0000010-0000-4000-8000-000000000010';
const TEMPLATE_11_UUID = 'a0000011-0000-4000-8000-000000000011';
const TEMPLATE_12_UUID = 'a0000012-0000-4000-8000-000000000012';
const TEMPLATE_13_UUID = 'a0000013-0000-4000-8000-000000000013';
const TEMPLATE_14_UUID = 'a0000014-0000-4000-8000-000000000014';
const TEMPLATE_15_UUID = 'a0000015-0000-4000-8000-000000000015';
const TEMPLATE_16_UUID = 'a0000016-0000-4000-8000-000000000016';
const TEMPLATE_17_UUID = 'a0000017-0000-4000-8000-000000000017';
const TEMPLATE_18_UUID = 'a0000018-0000-4000-8000-000000000018';
const TEMPLATE_19_UUID = 'a0000019-0000-4000-8000-000000000019';
const TEMPLATE_20_UUID = 'a0000020-0000-4000-8000-000000000020';
const TEMPLATE_21_UUID = 'a0000021-0000-4000-8000-000000000021';

export const UUID_TO_TEMPLATE_SLUG = {
  'a0000001-0000-4000-8000-000000000001': 'template_1',
  'a0000002-0000-4000-8000-000000000002': 'template_2',
  'a0000003-0000-4000-8000-000000000003': 'template_3',
  'a0000004-0000-4000-8000-000000000004': 'template_1',
  'a0000005-0000-4000-8000-000000000005': 'template_5',
  'a0000006-0000-4000-8000-000000000006': 'template_6',
  'a0000007-0000-4000-8000-000000000007': 'template_7',
  'a0000008-0000-4000-8000-000000000008': 'template_8',
  'a0000009-0000-4000-8000-000000000009': 'template_9',
  'a0000010-0000-4000-8000-000000000010': 'template_10',
  'a0000011-0000-4000-8000-000000000011': 'template_11',
  'a0000012-0000-4000-8000-000000000012': 'template_12',
  'a0000013-0000-4000-8000-000000000013': 'template_13',
  'a0000014-0000-4000-8000-000000000014': 'template_14',
  'a0000015-0000-4000-8000-000000000015': 'template_15',
  'a0000016-0000-4000-8000-000000000016': 'template_16',
  'a0000017-0000-4000-8000-000000000017': 'template_17',
  'a0000018-0000-4000-8000-000000000018': 'template_18',
  'a0000019-0000-4000-8000-000000000019': 'template_19',
  'a0000020-0000-4000-8000-000000000020': 'template_20',
  'a0000021-0000-4000-8000-000000000021': 'template_21',
};

/** Reverse map — slug → DB `template_id` FK. */
export const TEMPLATE_SLUG_TO_UUID = {
  template_1: TEMPLATE_1_UUID,
  template_2: TEMPLATE_2_UUID,
  template_3: TEMPLATE_3_UUID,
  template_5: TEMPLATE_5_UUID,
  template_6: TEMPLATE_6_UUID,
  template_7: TEMPLATE_7_UUID,
  template_8: TEMPLATE_8_UUID,
  template_9: TEMPLATE_9_UUID,
  template_10: TEMPLATE_10_UUID,
  template_11: TEMPLATE_11_UUID,
  template_12: TEMPLATE_12_UUID,
  template_13: TEMPLATE_13_UUID,
  template_14: TEMPLATE_14_UUID,
  template_15: TEMPLATE_15_UUID,
  template_16: TEMPLATE_16_UUID,
  template_17: TEMPLATE_17_UUID,
  template_18: TEMPLATE_18_UUID,
  template_19: TEMPLATE_19_UUID,
  template_20: TEMPLATE_20_UUID,
  template_21: TEMPLATE_21_UUID,
  /** Retired Layout 4 — stale slugs map to Layout 1. */
  template_4: TEMPLATE_1_UUID,
};

export const TEMPLATE_SLUG_LABELS = {
  template_1: 'Layout 1',
  template_2: 'Layout 2',
  template_3: 'Layout 3',
  template_5: 'Layout 5',
  template_6: 'Layout 6',
  template_7: 'Layout 7',
  template_8: 'Layout 8',
  template_9: 'Layout 9',
  template_10: 'Layout 10',
  template_11: 'Layout 11',
  template_12: 'Layout 12',
  template_13: 'Layout 13',
  template_14: 'Layout 14',
  template_15: 'Layout 15',
  template_16: 'Layout 16',
  template_17: 'Layout 17',
  template_18: 'Layout 18',
  template_19: 'Layout 19',
  template_20: 'Layout 20',
  template_21: 'Layout 21',
};

/** Webinar / “Banner 1” layout — matches engine `banner_1`. */
export const WEBINAR_BANNER_UUID = 'b0000003-0000-4000-8000-000000000003';

/** Image-only CTA — matches engine `banner_blank`. */
export const BLANK_IMAGE_BANNER_UUID = 'b0000005-0000-4000-8000-000000000005';

/** Corporate navy + gold “Boost” strip — matches engine `banner_8`. */
export const BOOST_IMPROVE_BANNER_UUID = 'b0000009-0000-4000-8000-000000000009';

/** Online loan / Revolio-style strip — matches engine `banner_9`. */
export const ONLINE_LOAN_BANNER_UUID = 'b0000010-0000-4000-8000-000000000010';

/** Business / city skyline strip — matches engine `banner_10`. */
export const BUSINESS_CITY_BANNER_UUID = 'b0000011-0000-4000-8000-000000000011';

/** Leave a review card — matches engine `banner_11`. */
export const LEAVE_REVIEW_BANNER_UUID = 'b0000012-0000-4000-8000-000000000012';

/** Dark grid SEO / resource strip — matches engine `banner_12`. */
export const SEO_WHITEPAPER_BANNER_UUID = 'b0000013-0000-4000-8000-000000000013';

/** Green gradient CTA with logo + decor — matches engine `banner_13`. */
export const GREEN_GRADIENT_CTA_BANNER_UUID = 'b0000014-0000-4000-8000-000000000014';

/** Lavender funnel strip — same engine as need-call (`banner_4`). */
export const SUBSCRIBER_JOURNEY_BANNER_UUID = 'b0000015-0000-4000-8000-000000000015';

/** Slug → DB `banner_id` FK — must match server `templateIds.js` and Supabase seed. */
export const BANNER_SLUG_TO_UUID = {
  'book-call': 'b0000001-0000-4000-8000-000000000001',
  download: 'b0000002-0000-4000-8000-000000000002',
  webinar: WEBINAR_BANNER_UUID,
  'need-call': 'b0000004-0000-4000-8000-000000000004',
  'subscriber-journey': SUBSCRIBER_JOURNEY_BANNER_UUID,
  blank: BLANK_IMAGE_BANNER_UUID,
  'boost-improve-banner': BOOST_IMPROVE_BANNER_UUID,
  'online-loan-banner': ONLINE_LOAN_BANNER_UUID,
  'leave-review-banner': LEAVE_REVIEW_BANNER_UUID,
  'seo-whitepaper-banner': SEO_WHITEPAPER_BANNER_UUID,
  'green-gradient-cta-banner': GREEN_GRADIENT_CTA_BANNER_UUID,
};

export function isWebinarBannerPreset(presetId, bannerId) {
  const p = String(presetId || '').toLowerCase();
  if (p.includes('webinar')) return true;
  const id = String(bannerId || '').toLowerCase();
  return id === WEBINAR_BANNER_UUID;
}

export function isBlankImageBannerPreset(presetId, bannerId) {
  const p = String(presetId || '').toLowerCase();
  if (p === 'blank-image' || p.includes('blank-image')) return true;
  const id = String(bannerId || '').trim().toLowerCase();
  return id === String(BLANK_IMAGE_BANNER_UUID).toLowerCase();
}

/** Matches server `resolveBannerKey` → `banner_3` (resume / download strip). */
export function isDownloadBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(BANNER_SLUG_TO_UUID.download).toLowerCase()) return true;
  const s = `${String(presetId || '')} ${bid}`.toLowerCase();
  return s.includes('download') || s.includes('resume');
}

/** Matches server `resolveBannerKey` → `banner_4` (subscriber funnel / need-a-call strip). */
export function isNeedCallBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(BANNER_SLUG_TO_UUID['need-call']).toLowerCase()) return true;
  if (bid === String(SUBSCRIBER_JOURNEY_BANNER_UUID).toLowerCase()) return true;
  const s = `${String(presetId || '')} ${bid}`.toLowerCase();
  return s.includes('need') || s.includes('subscriber-journey');
}

/** Matches server `resolveBannerKey` → `banner_2` (book-a-call strip). Prefer `bannerId` over slug. */
export function isBookCallBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(BANNER_SLUG_TO_UUID['book-call']).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  if (p.includes('need')) return false;
  if (p === 'book-call' || /^book[-_]?call$/i.test(p)) return true;
  return false;
}

/** Matches server `resolveBannerKey` → `banner_8`. */
export function isBoostImproveBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(BOOST_IMPROVE_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('boost-improve');
}

/** Matches server `resolveBannerKey` → `banner_9`. */
export function isOnlineLoanBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(ONLINE_LOAN_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('online-loan');
}

/** Matches server `resolveBannerKey` → `banner_10`. */
export function isBusinessCityBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(BUSINESS_CITY_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('business-city');
}

/** Matches server `resolveBannerKey` → `banner_11`. */
export function isLeaveReviewBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(LEAVE_REVIEW_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('leave-review');
}

/** Matches server `resolveBannerKey` → `banner_12`. */
export function isSeoWhitepaperBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(SEO_WHITEPAPER_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('seo-whitepaper');
}

/** Matches server `resolveBannerKey` → `banner_13`. */
export function isGreenGradientCtaBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(GREEN_GRADIENT_CTA_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('green-gradient-cta');
}

export function uuidToTemplateSlug(uuid) {
  if (!uuid) return 'template_1';
  const s = String(uuid).trim().toLowerCase();
  if (UUID_TO_TEMPLATE_SLUG[s]) return UUID_TO_TEMPLATE_SLUG[s];
  if (/^template_3$/i.test(s)) return 'template_3';
  if (/^template_2$/i.test(s)) return 'template_2';
  if (/^template_5$/i.test(s)) return 'template_5';
  if (/^template_6$/i.test(s)) return 'template_6';
  if (/^template_7$/i.test(s)) return 'template_7';
  if (/^template_8$/i.test(s)) return 'template_8';
  if (/^template_9$/i.test(s)) return 'template_9';
  if (/^template_10$/i.test(s)) return 'template_10';
  if (/^template_11$/i.test(s)) return 'template_11';
  if (/^template_12$/i.test(s)) return 'template_12';
  if (/^template_13$/i.test(s)) return 'template_13';
  if (/^template_14$/i.test(s)) return 'template_14';
  if (/^template_15$/i.test(s)) return 'template_15';
  if (/^template_16$/i.test(s)) return 'template_16';
  if (/^template_17$/i.test(s)) return 'template_17';
  if (/^template_18$/i.test(s)) return 'template_18';
  if (/^template_19$/i.test(s)) return 'template_19';
  if (/^template_20$/i.test(s)) return 'template_20';
  if (/^template_21$/i.test(s)) return 'template_21';
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
    if (/^template_5$/i.test(s)) return 'template_5';
    if (/^template_6$/i.test(s)) return 'template_6';
    if (/^template_7$/i.test(s)) return 'template_7';
    if (/^template_8$/i.test(s)) return 'template_8';
    if (/^template_9$/i.test(s)) return 'template_9';
    if (/^template_10$/i.test(s)) return 'template_10';
    if (/^template_11$/i.test(s)) return 'template_11';
    if (/^template_12$/i.test(s)) return 'template_12';
    if (/^template_13$/i.test(s)) return 'template_13';
    if (/^template_14$/i.test(s)) return 'template_14';
    if (/^template_15$/i.test(s)) return 'template_15';
    if (/^template_16$/i.test(s)) return 'template_16';
    if (/^template_17$/i.test(s)) return 'template_17';
    if (/^template_18$/i.test(s)) return 'template_18';
    if (/^template_19$/i.test(s)) return 'template_19';
    if (/^template_20$/i.test(s)) return 'template_20';
    if (/^template_21$/i.test(s)) return 'template_21';
    if (/^template_\d+$/i.test(s)) return 'template_1';
    if (UUID_TEMPLATE_RE.test(s)) return uuidToTemplateSlug(s);
  }
  return 'template_1';
}

/** Editor preview / export rail width: Layout 2 = 600px; Layout 1, 5 & 12 = 520px; Layout 18 = 521px; Layout 3, 13–17, 19–20 = 600px; Layout 11 & 21 = 620px. */
export function bundleRailPxForEngineSlug(slug) {
  const s = String(slug || '').toLowerCase();
  if (s === 'template_2') return 600;
  if (s === 'template_1' || s === 'template_5' || s === 'template_12') return 520;
  if (s === 'template_11') return 620;
  if (s === 'template_18') return 521;
  if (s === 'template_19') return 600;
  if (s === 'template_20') return 600;
  if (s === 'template_21') return 620;
  if (s === 'template_17') return 600;
  if (s === 'template_13') return 600;
  if (s === 'template_14') return 600;
  if (s === 'template_15') return 600;
  if (s === 'template_16') return 600;
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
  if (s === 'template_5') return 'template_5';
  if (s === 'template_6') return 'template_6';
  if (s === 'template_7') return 'template_7';
  if (s === 'template_8') return 'template_8';
  if (s === 'template_9') return 'template_9';
  if (s === 'template_10') return 'template_10';
  if (s === 'template_11') return 'template_11';
  if (s === 'template_12') return 'template_12';
  if (s === 'template_13') return 'template_13';
  if (s === 'template_14') return 'template_14';
  if (s === 'template_15') return 'template_15';
  if (s === 'template_16') return 'template_16';
  if (s === 'template_17') return 'template_17';
  if (s === 'template_18') return 'template_18';
  if (s === 'template_19') return 'template_19';
  if (s === 'template_20') return 'template_20';
  if (s === 'template_21') return 'template_21';
  return 'template_1';
}

export const TEMPLATE_HAS_LOGO = {
  template_1: true,
  template_2: true,
  template_3: true,
  template_5: true,
  template_6: true,
  template_7: true,
  template_8: true,
  template_9: true,
  template_10: true,
  template_11: true,
  template_12: false,
  template_13: false,
  template_14: false,
  template_15: true,
  template_16: true,
  template_17: false,
  template_18: false,
  template_19: false,
  template_20: true,
  template_21: false,
};

/** @param {string | undefined} slugOrUuid */
export function templateSlugSupportsLogo(slugOrUuid) {
  if (!slugOrUuid) return true;
  const s = String(slugOrUuid).toLowerCase();
  if (s.includes('template_3')) return TEMPLATE_HAS_LOGO.template_3 !== false;
  if (s.includes('template_5')) return TEMPLATE_HAS_LOGO.template_5 !== false;
  if (s.includes('template_6')) return TEMPLATE_HAS_LOGO.template_6 !== false;
  if (s.includes('template_7')) return TEMPLATE_HAS_LOGO.template_7 !== false;
  if (s.includes('template_8')) return TEMPLATE_HAS_LOGO.template_8 !== false;
  if (s.includes('template_9')) return TEMPLATE_HAS_LOGO.template_9 !== false;
  if (s.includes('template_10')) return TEMPLATE_HAS_LOGO.template_10 !== false;
  if (s.includes('template_11')) return TEMPLATE_HAS_LOGO.template_11 !== false;
  if (s.includes('template_12')) return TEMPLATE_HAS_LOGO.template_12 !== false;
  if (s.includes('template_13')) return TEMPLATE_HAS_LOGO.template_13 !== false;
  if (s.includes('template_14')) return TEMPLATE_HAS_LOGO.template_14 !== false;
  if (s.includes('template_15')) return TEMPLATE_HAS_LOGO.template_15 !== false;
  if (s.includes('template_16')) return TEMPLATE_HAS_LOGO.template_16 !== false;
  if (s.includes('template_17')) return TEMPLATE_HAS_LOGO.template_17 !== false;
  if (s.includes('template_18')) return TEMPLATE_HAS_LOGO.template_18 !== false;
  if (s.includes('template_19')) return TEMPLATE_HAS_LOGO.template_19 !== false;
  if (s.includes('template_20')) return TEMPLATE_HAS_LOGO.template_20 !== false;
  if (s.includes('template_21')) return TEMPLATE_HAS_LOGO.template_21 !== false;
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
