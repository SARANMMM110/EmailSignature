// ─────────────────────────────────────────────────────────
// PLAN DEFINITIONS — source of truth for all feature gates
// Based on BonusBuilder pricing spreadsheet
// ─────────────────────────────────────────────────────────

import { BRAND_NAME } from '../constants/brand.js';

const env = (k) => import.meta.env[k];

export const PLAN_IDS = {
  PERSONAL: 'personal',
  ADVANCED: 'advanced',
  ULTIMATE: 'ultimate',
};

export const PLAN_ORDER = [PLAN_IDS.PERSONAL, PLAN_IDS.ADVANCED, PLAN_IDS.ULTIMATE];

/** Maps legacy DB values to current tier ids. */
export function normalizePlanId(plan) {
  let p = String(plan ?? '').trim().toLowerCase();
  if (!p) p = PLAN_IDS.PERSONAL;
  if (p === 'free') return PLAN_IDS.PERSONAL;
  if (p === 'pro') return PLAN_IDS.ADVANCED;
  if (p === 'business') return PLAN_IDS.ULTIMATE;
  /** Marketing / legacy labels on registration links or admin CSV */
  if (p === 'bronze' || p === 'starter' || p === 'basic') return PLAN_IDS.PERSONAL;
  if (p === 'silver' || p === 'standard') return PLAN_IDS.ADVANCED;
  if (p === 'gold' || p === 'premium' || p === 'platinum') return PLAN_IDS.ULTIMATE;
  if (p === PLAN_IDS.PERSONAL || p === PLAN_IDS.ADVANCED || p === PLAN_IDS.ULTIMATE) return p;
  return PLAN_IDS.PERSONAL;
}

export const PLANS = {
  personal: {
    id: 'personal',
    name: 'Bronze',
    tagline: 'Essential layouts and exports for solo professionals',
    price_monthly: 7,
    price_yearly: 59,
    price_yearly_per_month: 4.92,
    stripe_price_id_monthly: env('VITE_STRIPE_PERSONAL_MONTHLY'),
    stripe_price_id_yearly: env('VITE_STRIPE_PERSONAL_YEARLY'),
    color: '#92400e',
    badge: null,
    cta: 'Get Bronze',

    limits: {
      max_active_signatures: 3,
      max_saved_custom_palettes: 0,
      layout_templates: 5,
      cta_banner_templates: 0,
      media_upload_limit_mb: 5,
    },

    features: {
      duplicate_copy_signature: true,
      change_layout_after_saving: true,
      custom_palette_creation: false,
      profile_photo_logo_upload: true,
      photo_crop_tool: true,
      social_media_pack: 'full',
      premium_banner_presets: false,
      custom_banner_image_upload: false,
      whole_sig_clickthrough_url: true,
      multi_language_support: 'priority_local',
      copy_html_to_clipboard: true,
      png_rich_clipboard_render: true,
      hosted_png_image_url_flow: true,
      all_install_guides: true,
      hide_made_with_badge: false,
    },
  },

  advanced: {
    id: 'advanced',
    name: 'Silver',
    tagline: 'For growing teams who need banners and brand palettes',
    price_monthly: 15,
    price_yearly: 119,
    price_yearly_per_month: 9.92,
    stripe_price_id_monthly: env('VITE_STRIPE_ADVANCED_MONTHLY'),
    stripe_price_id_yearly: env('VITE_STRIPE_ADVANCED_YEARLY'),
    color: '#64748b',
    badge: 'Most Popular',
    cta: 'Get Silver',

    limits: {
      max_active_signatures: 10,
      max_saved_custom_palettes: 5,
      layout_templates: 10,
      cta_banner_templates: 5,
      media_upload_limit_mb: 10,
    },

    features: {
      duplicate_copy_signature: true,
      change_layout_after_saving: true,
      custom_palette_creation: true,
      profile_photo_logo_upload: true,
      photo_crop_tool: true,
      social_media_pack: 'full',
      premium_banner_presets: true,
      custom_banner_image_upload: true,
      whole_sig_clickthrough_url: true,
      multi_language_support: 'priority_local',
      copy_html_to_clipboard: true,
      png_rich_clipboard_render: true,
      hosted_png_image_url_flow: true,
      all_install_guides: true,
      hide_made_with_badge: true,
    },
  },

  ultimate: {
    id: 'ultimate',
    name: 'Gold',
    tagline: 'Unlimited layouts and palettes for power users & agencies',
    price_monthly: 29,
    price_yearly: 239,
    price_yearly_per_month: 19.92,
    stripe_price_id_monthly: env('VITE_STRIPE_ULTIMATE_MONTHLY'),
    stripe_price_id_yearly: env('VITE_STRIPE_ULTIMATE_YEARLY'),
    color: '#ca8a04',
    badge: 'Best Value',
    cta: 'Get Gold',

    limits: {
      max_active_signatures: Infinity,
      max_saved_custom_palettes: Infinity,
      layout_templates: Infinity,
      cta_banner_templates: 10,
      media_upload_limit_mb: 25,
    },

    features: {
      duplicate_copy_signature: true,
      change_layout_after_saving: true,
      custom_palette_creation: true,
      profile_photo_logo_upload: true,
      photo_crop_tool: true,
      social_media_pack: 'full',
      premium_banner_presets: true,
      custom_banner_image_upload: true,
      whole_sig_clickthrough_url: true,
      multi_language_support: 'priority_local',
      copy_html_to_clipboard: true,
      png_rich_clipboard_render: true,
      hosted_png_image_url_flow: true,
      all_install_guides: true,
      hide_made_with_badge: true,
    },
  },
};

function limitUnlocked(plan, key) {
  if (!Object.prototype.hasOwnProperty.call(plan.limits, key)) return false;
  const n = plan.limits[key];
  return n === Infinity || (typeof n === 'number' && n > 0);
}

function featureUnlocked(plan, key) {
  if (Object.prototype.hasOwnProperty.call(plan.limits, key)) {
    return limitUnlocked(plan, key);
  }
  const v = plan.features[key];
  if (v === true) return true;
  if (typeof v === 'string' && v) return true;
  return false;
}

/** First plan tier (personal → advanced → ultimate) that unlocks this limit or feature key. */
export function minPlanForFeature(key) {
  for (const id of PLAN_ORDER) {
    const plan = PLANS[id];
    if (featureUnlocked(plan, key)) return id;
  }
  return PLAN_IDS.ULTIMATE;
}

export function getPlan(planId) {
  const id = normalizePlanId(planId);
  return PLANS[id] || PLANS.personal;
}

/** Short, scannable highlights per plan — shared by Pricing and Landing pages. */
export function planHighlights(planId) {
  const p = PLANS[planId];
  const L = (n) => (n === Infinity ? 'Unlimited' : String(n));
  const lines = [];
  lines.push(`Max ${L(p.limits.max_active_signatures)} active signatures`);
  lines.push('Duplicate / copy signature');
  lines.push(`${L(p.limits.layout_templates)} layout templates`);
  lines.push('Change layout after saving');
  if (p.features.custom_palette_creation) {
    lines.push(`Custom palettes — save up to ${L(p.limits.max_saved_custom_palettes)}`);
  } else {
    lines.push('Curated system palettes (no custom saves)');
  }
  lines.push('Profile photo, logo upload & crop tool');
  lines.push(`Media uploads up to ${p.limits.media_upload_limit_mb}MB`);
  if (p.limits.cta_banner_templates > 0) {
    lines.push(`${L(p.limits.cta_banner_templates)} CTA banner styles`);
  } else {
    lines.push('No CTA banner styles on this tier');
  }
  if (p.features.custom_banner_image_upload) {
    lines.push('Custom banner image upload');
  }
  if (p.features.whole_sig_clickthrough_url) {
    lines.push('Add redirect link on your signature');
  }
  lines.push('Copy HTML, download PNG, all installation guides');
  lines.push(
    p.features.hide_made_with_badge
      ? `“Made with ${BRAND_NAME}” badge hidden`
      : `“Made with ${BRAND_NAME}” badge shown`
  );
  return lines;
}

const PLAN_RANK = { personal: 1, advanced: 2, ultimate: 3 };

export function planHasAccess(userPlanId, requiredPlanId) {
  const u = normalizePlanId(userPlanId);
  const r = normalizePlanId(requiredPlanId);
  return (PLAN_RANK[u] || 0) >= (PLAN_RANK[r] || 0);
}

export const COMPARISON_TABLE = [
  {
    category: 'Core',
    color: '#fde68a',
    rows: [
      { feature: 'Max Active Signatures', personal: '3', advanced: '10', ultimate: 'Unlimited' },
      { feature: 'Duplicate / Copy Signature', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
    ],
  },
  {
    category: 'Layouts & Design',
    color: '#e9d5ff',
    rows: [
      { feature: 'Templates Available', personal: '5', advanced: '10', ultimate: '20+' },
      { feature: 'Change Layout After Saving', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Custom Palette Creation', personal: 'No', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Saved Custom Palettes', personal: '0', advanced: '5', ultimate: 'Unlimited' },
    ],
  },
  {
    category: 'Content & Media',
    color: '#bbf7d0',
    rows: [
      { feature: 'Profile Photo & Logo Upload', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Photo Crop Tool', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Media Upload Limit', personal: '5MB', advanced: '10MB', ultimate: '25MB' },
    ],
  },
  {
    category: 'Banners (CTA)',
    color: '#fed7aa',
    rows: [
      { feature: 'CTA Banner Styles', personal: 'No', advanced: '5', ultimate: '10' },
      { feature: 'Custom Banner Upload', personal: 'No', advanced: 'Yes', ultimate: 'Yes' },
    ],
  },
  {
    category: 'Advanced Tools',
    color: '#a5f3fc',
    rows: [{ feature: 'Add Redirect Link', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' }],
  },
  {
    category: 'Export & Installation',
    color: '#f9a8d4',
    rows: [
      { feature: 'Copy HTML', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Download PNG', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Installation Guides', personal: 'All', advanced: 'All', ultimate: 'All' },
    ],
  },
  {
    category: 'Branding',
    color: '#86efac',
    rows: [
      {
        feature: `“Made with ${BRAND_NAME}” badge`,
        personal: 'Shown',
        advanced: 'Hidden',
        ultimate: 'Hidden',
      },
    ],
  },
];
