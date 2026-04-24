/**
 * Layout 10 — gallery previews + new DB rows until the user edits Palettes.
 * Keep in sync with `TEMPLATE_10_CANONICAL_COLORS` in client `templateIds.js`.
 */
export const TEMPLATE_10_CANONICAL_COLORS = Object.freeze([
  '#A6E22E', // primary — lime bar, pill, icons (match accent for vivid mode)
  '#1C1C1C', // secondary — charcoal shell
  '#A6E22E', // accent — same as primary → vivid lime-on-charcoal (image 2 reference)
  '#0f172a', // text — dark for pill label; headline stays light via generator
]);

/**
 * Layout 11 — lime panel + dark contact stack + circular photo (Figma reference).
 * Keep in sync with `TEMPLATE_11_CANONICAL_COLORS` in client `templateIds.js`.
 */
export const TEMPLATE_11_CANONICAL_COLORS = Object.freeze([
  '#81cc27', // primary — banner field (reference)
  '#0c0c0d', // secondary — contact card fill
  '#e8e8e8', // accent — light row copy on black (icons use white in generator)
  '#1a1d15', // text — headline / near-black type
]);

/** Layout 12 — 520×162 Rheina card (lime + cream + charcoal type). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_12_CANONICAL_COLORS = Object.freeze([
  '#DFFF00', // primary — lime capsule + accents (reference)
  '#1a1a1a', // secondary — headline + pill text
  '#FCF8F1', // accent — cream card (matches plate)
  '#9A9894', // text — intro + contact body
]);

/** Layout 13 — dark card + yellow rail (Sandro-style reference). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_13_CANONICAL_COLORS = Object.freeze([
  '#FFD54F', // primary — yellow accent + role line
  '#1C1C1C', // secondary — card shell
  '#2a2a2a', // accent — depth (unused mostly)
  '#FFFFFF', // text — white type + icons
]);

/** Layout 14 — light canvas + orange squircle + white footer (reference card). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_14_CANONICAL_COLORS = Object.freeze([
  '#F27121', // primary — orange photo block + social circles (reference)
  '#EDEAE6', // secondary — warm light canvas + glow base
  '#FFFFFF', // accent — footer bar
  '#0A0A0A', // text — black type + icons
]);

/** Layout 15 — chartreuse field + white tab/card (reference). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_15_CANONICAL_COLORS = Object.freeze([
  '#D4FF1F', // primary — lime field (reference)
  '#0a0a0a', // secondary — black type + borders + social rail
  '#ffffff', // accent — white tab + contact card + job pill
  '#757575', // text — muted address/contact body
]);

/** Layout 16 — 600px banner; navy #0a192f (CSS reference). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_16_CANONICAL_COLORS = Object.freeze([
  '#0a192f', // primary — left panel, icons, name
  '#050f1f', // secondary — deeper ring / depth
  '#ffffff', // accent — white column + portrait ring
  '#555555', // text — palette “text” slot; job/intro/contact tinted in generator
]);

/** Layout 17 — 600px creative card; lime #7dc242 (reference). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_17_CANONICAL_COLORS = Object.freeze([
  '#7dc242', // primary — lime accents, icons, footer bar, second name line
  '#111111', // secondary — headline ink
  '#6db33f', // accent — circular badge fill
  '#000000', // text — title + contacts (reference)
]);

/** Layout 18 — clean charcoal card + sage (reference). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_18_CANONICAL_COLORS = Object.freeze([
  '#A3B64F', // primary — brand + contact icons
  '#0b131e', // secondary — card fill (navy charcoal)
  '#1f2a38', // accent — subtle rim / depth hint for engine mix
  '#b9c2cf', // text — role + contacts (lightened in engine)
]);

/** Layout 19 — periwinkle + sage creative card. Keep in sync with client `templateIds.js`. */
export const TEMPLATE_19_CANONICAL_COLORS = Object.freeze([
  '#8a94f8',
  '#6f78e8',
  '#bed896',
  '#000000',
]);

/** Layout 20 — neon + dark field + light type (reference). Keep in sync with client `templateIds.js`. */
export const TEMPLATE_20_CANONICAL_COLORS = Object.freeze([
  '#39FF14',
  '#051a05',
  '#9ee89e',
  '#f0f4f0',
]);

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
  'classic-table': TEMPLATE_1_UUID,
  'minimal-stack': TEMPLATE_1_UUID,
  'corporate-strip': TEMPLATE_1_UUID,
};

/** Full-width image-only CTA — matches engine `banner_blank`. */
export const BLANK_IMAGE_BANNER_UUID = 'b0000005-0000-4000-8000-000000000005';

/** Mindscope-style dark ATS strip — matches engine `banner_5`. */
export const MINDSCOPE_BANNER_UUID = 'b0000006-0000-4000-8000-000000000006';

/** Mailchimp-inspired illustrated strip — matches engine `banner_6`. */
export const MAILCHIMP_BANNER_UUID = 'b0000007-0000-4000-8000-000000000007';

/** “Explore your world” travel strip — matches engine `banner_7`. */
export const EXPLORE_WORLD_BANNER_UUID = 'b0000008-0000-4000-8000-000000000008';

/** Wellness “Boost and Improve” strip — matches engine `banner_8`. */
export const BOOST_IMPROVE_BANNER_UUID = 'b0000009-0000-4000-8000-000000000009';

/** Online loan / Revolio-style strip — matches engine `banner_9`. */
export const ONLINE_LOAN_BANNER_UUID = 'b0000010-0000-4000-8000-000000000010';

/** Business / city skyline strip — matches engine `banner_10`. */
export const BUSINESS_CITY_BANNER_UUID = 'b0000011-0000-4000-8000-000000000011';

/** Leave a review card (Trustpilot-style copy) — matches engine `banner_11`. */
export const LEAVE_REVIEW_BANNER_UUID = 'b0000012-0000-4000-8000-000000000012';

/** Dark grid SEO / resource strip — matches engine `banner_12`. */
export const SEO_WHITEPAPER_BANNER_UUID = 'b0000013-0000-4000-8000-000000000013';

/** Green gradient CTA with logo + decor — matches engine `banner_13`. */
export const GREEN_GRADIENT_CTA_BANNER_UUID = 'b0000014-0000-4000-8000-000000000014';

export const BANNER_SLUG_TO_UUID = {
  'book-call': 'b0000001-0000-4000-8000-000000000001',
  download: 'b0000002-0000-4000-8000-000000000002',
  webinar: 'b0000003-0000-4000-8000-000000000003',
  'need-call': 'b0000004-0000-4000-8000-000000000004',
  blank: BLANK_IMAGE_BANNER_UUID,
  'mindscope-ats': MINDSCOPE_BANNER_UUID,
  'mailchimp-campaign': MAILCHIMP_BANNER_UUID,
  'explore-world-banner': EXPLORE_WORLD_BANNER_UUID,
  'boost-improve-banner': BOOST_IMPROVE_BANNER_UUID,
  'online-loan-banner': ONLINE_LOAN_BANNER_UUID,
  'leave-review-banner': LEAVE_REVIEW_BANNER_UUID,
  'seo-whitepaper-banner': SEO_WHITEPAPER_BANNER_UUID,
  'green-gradient-cta-banner': GREEN_GRADIENT_CTA_BANNER_UUID,
};

export function isBlankImageBannerPreset(presetId, bannerId) {
  const p = String(presetId || '').toLowerCase();
  if (p === 'blank-image' || p.includes('blank-image')) return true;
  const id = String(bannerId || '').trim().toLowerCase();
  return id === String(BLANK_IMAGE_BANNER_UUID).toLowerCase();
}

/** Matches server `resolveBannerKey` → `banner_5`. */
export function isMindscopeBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(MINDSCOPE_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('mindscope');
}

/** Matches server `resolveBannerKey` → `banner_6`. */
export function isMailchimpBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(MAILCHIMP_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('mailchimp');
}

/** Matches server `resolveBannerKey` → `banner_7`. */
export function isExploreWorldBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(EXPLORE_WORLD_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('explore-world') || p.includes('explore-your-world');
}

/** Matches server `resolveBannerKey` → `banner_8`. */
export function isBoostImproveBannerPreset(presetId, bannerId) {
  const bid = String(bannerId || '').trim().toLowerCase();
  if (bid === String(BOOST_IMPROVE_BANNER_UUID).toLowerCase()) return true;
  const p = String(presetId || '').toLowerCase();
  return p.includes('boost-improve');
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
  if (/^template_\d+$/i.test(s)) return 'template_1';
  return 'template_1';
}

export function resolveTemplateUuid(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim();
  const lower = s.toLowerCase();
  if (UUID_RE.test(s)) return s;
  return TEMPLATE_SLUG_TO_UUID[lower] || null;
}

export function resolveBannerUuid(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim().toLowerCase();
  if (UUID_RE.test(s)) return s;
  if (s.includes('blank')) return BANNER_SLUG_TO_UUID.blank;
  if (s.includes('download')) return BANNER_SLUG_TO_UUID.download;
  if (s.includes('webinar')) return BANNER_SLUG_TO_UUID.webinar;
  if (s.includes('need')) return BANNER_SLUG_TO_UUID['need-call'];
  if (s.includes('mindscope')) return MINDSCOPE_BANNER_UUID;
  if (s.includes('mailchimp')) return MAILCHIMP_BANNER_UUID;
  if (s.includes('explore-world') || s.includes('explore-your-world')) return EXPLORE_WORLD_BANNER_UUID;
  if (s.includes('boost-improve')) return BOOST_IMPROVE_BANNER_UUID;
  if (s.includes('online-loan')) return ONLINE_LOAN_BANNER_UUID;
  if (s.includes('business-city')) return BUSINESS_CITY_BANNER_UUID;
  if (s.includes('leave-review')) return LEAVE_REVIEW_BANNER_UUID;
  if (s.includes('seo-whitepaper')) return SEO_WHITEPAPER_BANNER_UUID;
  if (s.includes('green-gradient-cta')) return GREEN_GRADIENT_CTA_BANNER_UUID;
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
  if (n === 10) return 'template_10';
  if (n === 11) return 'template_11';
  if (n === 12) return 'template_12';
  if (n === 13) return 'template_13';
  if (n === 14) return 'template_14';
  if (n === 15) return 'template_15';
  if (n === 16) return 'template_16';
  if (n === 17) return 'template_17';
  if (n === 18) return 'template_18';
  if (n === 19) return 'template_19';
  if (n === 20) return 'template_20';
  return 'template_1';
}

/** Bundle / preview rail: Layout 2 = 600px; Layout 4 = 470px; Layout 1, 5 & 12 = 520px; Layout 18 = 521px; Layout 3, 13–17, 19–20 = 600px; Layout 11 = 620px (must match client editor preview). */
export function bundleRailPxForEngineSlug(slug) {
  const s = String(slug || '').toLowerCase();
  if (s === 'template_2') return 600;
  if (s === 'template_4') return 470;
  if (s === 'template_1' || s === 'template_5' || s === 'template_12') return 520;
  if (s === 'template_11') return 620;
  if (s === 'template_18') return 521;
  if (s === 'template_19') return 600;
  if (s === 'template_20') return 600;
  if (s === 'template_17') return 600;
  if (s === 'template_13') return 600;
  if (s === 'template_14') return 600;
  if (s === 'template_15') return 600;
  if (s === 'template_16') return 600;
  return 600;
}
