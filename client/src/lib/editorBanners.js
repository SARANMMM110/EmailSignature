import {
  WEBINAR_BANNER_UUID,
  BANNER_SLUG_TO_UUID,
  BLANK_IMAGE_BANNER_UUID,
  MINDSCOPE_BANNER_UUID,
  MAILCHIMP_BANNER_UUID,
  EXPLORE_WORLD_BANNER_UUID,
  BOOST_IMPROVE_BANNER_UUID,
  ONLINE_LOAN_BANNER_UUID,
  LEAVE_REVIEW_BANNER_UUID,
  SEO_WHITEPAPER_BANNER_UUID,
  GREEN_GRADIENT_CTA_BANNER_UUID,
} from './templateIds.js';

/** CTA rows shown in the editor (Banners tab + banner picker cache) — stable DB UUIDs. */
export const EDITOR_BANNER_SORT_IDS = [
  WEBINAR_BANNER_UUID,
  BANNER_SLUG_TO_UUID['book-call'],
  MINDSCOPE_BANNER_UUID,
  MAILCHIMP_BANNER_UUID,
  EXPLORE_WORLD_BANNER_UUID,
  BOOST_IMPROVE_BANNER_UUID,
  ONLINE_LOAN_BANNER_UUID,
  LEAVE_REVIEW_BANNER_UUID,
  SEO_WHITEPAPER_BANNER_UUID,
  GREEN_GRADIENT_CTA_BANNER_UUID,
  BANNER_SLUG_TO_UUID.download,
  BANNER_SLUG_TO_UUID['need-call'],
  BLANK_IMAGE_BANNER_UUID,
].map((id) => String(id).toLowerCase());

/**
 * When Supabase (or local DB) has not run the latest banner migrations, the API omits rows.
 * Editor still needs stable UUIDs so HTML generation and presets match — merge API rows with
 * these minimal fallbacks for any missing allowed id.
 */
const CANONICAL_BANNER_FALLBACKS = Object.freeze({
  [String(WEBINAR_BANNER_UUID).toLowerCase()]: {
    id: WEBINAR_BANNER_UUID,
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
  [String(MINDSCOPE_BANNER_UUID).toLowerCase()]: {
    id: MINDSCOPE_BANNER_UUID,
    name: 'Mindscope ATS',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(MAILCHIMP_BANNER_UUID).toLowerCase()]: {
    id: MAILCHIMP_BANNER_UUID,
    name: 'Campaign strip',
    tier: 'pro',
    is_active: true,
    html_structure: '<!-- engine -->',
  },
  [String(EXPLORE_WORLD_BANNER_UUID).toLowerCase()]: {
    id: EXPLORE_WORLD_BANNER_UUID,
    name: 'Explore your world',
    tier: 'pro',
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
 * @param {Array<{ id?: string }>} rows
 * @returns {typeof rows}
 */
export function filterAndSortEditorBanners(rows) {
  const byId = new Map();
  for (const b of rows || []) {
    if (!b || b.id == null) continue;
    byId.set(String(b.id).toLowerCase(), b);
  }
  return EDITOR_BANNER_SORT_IDS.map((sortId) => {
    const fromApi = byId.get(sortId);
    if (fromApi) return fromApi;
    const stub = CANONICAL_BANNER_FALLBACKS[sortId];
    return stub ? { ...stub } : null;
  }).filter(Boolean);
}
