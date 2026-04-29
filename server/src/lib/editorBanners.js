import {
  BANNER_SLUG_TO_UUID,
  BLANK_IMAGE_BANNER_UUID,
  BOOST_IMPROVE_BANNER_UUID,
  ONLINE_LOAN_BANNER_UUID,
  LEAVE_REVIEW_BANNER_UUID,
  SEO_WHITEPAPER_BANNER_UUID,
  GREEN_GRADIENT_CTA_BANNER_UUID,
} from './templateIds.js';

/** Same order as client `EDITOR_BANNER_SORT_IDS` — stable editor + API catalog. */
const BANNER_CATALOG_ORDER = [
  BANNER_SLUG_TO_UUID.webinar,
  BANNER_SLUG_TO_UUID['book-call'],
  BOOST_IMPROVE_BANNER_UUID,
  ONLINE_LOAN_BANNER_UUID,
  LEAVE_REVIEW_BANNER_UUID,
  SEO_WHITEPAPER_BANNER_UUID,
  GREEN_GRADIENT_CTA_BANNER_UUID,
  BANNER_SLUG_TO_UUID.download,
  BANNER_SLUG_TO_UUID['need-call'],
  BLANK_IMAGE_BANNER_UUID,
].map((id) => String(id).toLowerCase());

const CANONICAL_FALLBACKS = Object.freeze({
  [String(BANNER_SLUG_TO_UUID.webinar).toLowerCase()]: {
    id: BANNER_SLUG_TO_UUID.webinar,
    name: 'Webinar',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(BANNER_SLUG_TO_UUID['book-call']).toLowerCase()]: {
    id: BANNER_SLUG_TO_UUID['book-call'],
    name: 'Book a call',
    tier: 'free',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(BOOST_IMPROVE_BANNER_UUID).toLowerCase()]: {
    id: BOOST_IMPROVE_BANNER_UUID,
    name: 'Boost & improve',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(ONLINE_LOAN_BANNER_UUID).toLowerCase()]: {
    id: ONLINE_LOAN_BANNER_UUID,
    name: 'Online loan',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(LEAVE_REVIEW_BANNER_UUID).toLowerCase()]: {
    id: LEAVE_REVIEW_BANNER_UUID,
    name: 'Leave a review',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(SEO_WHITEPAPER_BANNER_UUID).toLowerCase()]: {
    id: SEO_WHITEPAPER_BANNER_UUID,
    name: 'SEO whitepaper',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(GREEN_GRADIENT_CTA_BANNER_UUID).toLowerCase()]: {
    id: GREEN_GRADIENT_CTA_BANNER_UUID,
    name: 'Green gradient CTA',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(BANNER_SLUG_TO_UUID.download).toLowerCase()]: {
    id: BANNER_SLUG_TO_UUID.download,
    name: 'Download',
    tier: 'free',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(BANNER_SLUG_TO_UUID['need-call']).toLowerCase()]: {
    id: BANNER_SLUG_TO_UUID['need-call'],
    name: 'Need a call',
    tier: 'free',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(BLANK_IMAGE_BANNER_UUID).toLowerCase()]: {
    id: BLANK_IMAGE_BANNER_UUID,
    name: 'Image only',
    tier: 'free',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
});

/**
 * Ensures every catalog banner id exists (migrations not applied yet, or partial seed).
 * @param {Array<Record<string, unknown>>|null|undefined} rows
 * @returns {Array<Record<string, unknown>>}
 */
export function mergeEditorBannerCatalog(rows) {
  const byId = new Map();
  for (const b of rows || []) {
    if (!b || b.id == null) continue;
    byId.set(String(b.id).toLowerCase(), b);
  }
  const needId = String(BANNER_SLUG_TO_UUID['need-call']).toLowerCase();
  const subId = String(BANNER_SLUG_TO_UUID['subscriber-journey']).toLowerCase();
  if (byId.has(subId)) {
    if (!byId.has(needId)) {
      const sub = byId.get(subId);
      byId.set(needId, { ...sub, id: BANNER_SLUG_TO_UUID['need-call'], name: sub.name || 'Need a call' });
    }
    byId.delete(subId);
  }
  return BANNER_CATALOG_ORDER.map((sortId) => {
    const fromDb = byId.get(sortId);
    if (fromDb) return fromDb;
    const stub = CANONICAL_FALLBACKS[sortId];
    return stub ? { ...stub } : null;
  }).filter(Boolean);
}
