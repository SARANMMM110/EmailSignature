// ─────────────────────────────────────────────────────────
// PLAN DEFINITIONS — source of truth for all feature gates
// Based on BonusBuilder pricing spreadsheet
// ─────────────────────────────────────────────────────────

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
  if (p === PLAN_IDS.PERSONAL || p === PLAN_IDS.ADVANCED || p === PLAN_IDS.ULTIMATE) return p;
  return PLAN_IDS.PERSONAL;
}

export const PLANS = {
  personal: {
    id: 'personal',
    name: 'Personal',
    tagline: 'Perfect for freelancers & solo professionals',
    price_monthly: 7,
    price_yearly: 59,
    price_yearly_per_month: 4.92,
    stripe_price_id_monthly: env('VITE_STRIPE_PERSONAL_MONTHLY'),
    stripe_price_id_yearly: env('VITE_STRIPE_PERSONAL_YEARLY'),
    color: '#4B6EF5',
    badge: null,
    cta: 'Get Personal',

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
      whole_sig_clickthrough_url: false,
      multi_language_support: 'priority_local',
      copy_html_to_clipboard: true,
      png_rich_clipboard_render: true,
      hosted_png_image_url_flow: false,
      all_install_guides: true,
      hide_made_with_badge: false,
    },
  },

  advanced: {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'For growing professionals & small teams',
    price_monthly: 15,
    price_yearly: 119,
    price_yearly_per_month: 9.92,
    stripe_price_id_monthly: env('VITE_STRIPE_ADVANCED_MONTHLY'),
    stripe_price_id_yearly: env('VITE_STRIPE_ADVANCED_YEARLY'),
    color: '#16a34a',
    badge: 'Most Popular',
    cta: 'Get Advanced',

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
    name: 'Ultimate',
    tagline: 'Unlimited power for power users & agencies',
    price_monthly: 29,
    price_yearly: 239,
    price_yearly_per_month: 19.92,
    stripe_price_id_monthly: env('VITE_STRIPE_ULTIMATE_MONTHLY'),
    stripe_price_id_yearly: env('VITE_STRIPE_ULTIMATE_YEARLY'),
    color: '#7c3aed',
    badge: 'Best Value',
    cta: 'Get Ultimate',

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
  lines.push(`${L(p.limits.max_active_signatures)} active signatures`);
  lines.push(`${L(p.limits.layout_templates)} professional email layouts`);
  lines.push('Swap layout anytime after saving');
  lines.push('Profile photo, logo & full social pack');
  lines.push(`Up to ${p.limits.media_upload_limit_mb}MB file uploads`);
  if (p.features.custom_palette_creation) {
    lines.push(`${L(p.limits.max_saved_custom_palettes)} saved brand palettes`);
  }
  if (p.limits.cta_banner_templates > 0) {
    lines.push(`${L(p.limits.cta_banner_templates)} CTA banner styles`);
  }
  if (p.features.png_rich_clipboard_render) {
    lines.push('PNG clipboard & hosted image export');
  }
  if (p.features.whole_sig_clickthrough_url) {
    lines.push('Clickable whole signature');
  }
  if (p.features.hide_made_with_badge) {
    lines.push('Optional “Made with” badge');
  }
  lines.push('Copy HTML + install guides for every client');
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
    color: '#fbbf24',
    rows: [
      { feature: 'Max Active Signatures', personal: '3', advanced: '10', ultimate: 'Unlimited' },
      { feature: 'Duplicate / Copy Signature', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      {
        feature: 'Professional Email Layouts',
        personal: '5 included',
        advanced: '10 included',
        ultimate: 'Unlimited (all current & future)',
      },
      { feature: 'Change Layout After Saving', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
    ],
  },
  {
    category: 'Content & Media',
    color: '#bbf7d0',
    rows: [
      { feature: 'Profile Photo & Logo Upload', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Photo Crop Tool', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Social Media Pack', personal: 'Full', advanced: 'Full', ultimate: 'Full' },
      { feature: 'Media Upload Limit (Per File)', personal: '5MB', advanced: '10MB', ultimate: '25MB' },
      {
        feature: 'Brand Color Palettes',
        personal: 'System palettes only',
        advanced: 'Create & save up to 5',
        ultimate: 'Unlimited custom palettes',
      },
    ],
  },
  {
    category: 'Banners (CTA)',
    color: '#fed7aa',
    rows: [
      { feature: 'CTA Banner Templates', personal: 'No', advanced: '5', ultimate: '10' },
      { feature: 'Premium Banner Presets', personal: 'No', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Custom Banner Image Upload', personal: 'No', advanced: 'Yes', ultimate: 'Yes' },
    ],
  },
  {
    category: 'Advanced Tools',
    color: '#a5f3fc',
    rows: [
      { feature: 'Whole-Sig Click-through URL', personal: 'No', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Multi-Language Support', personal: 'Priority Local', advanced: 'Priority Local', ultimate: 'Priority Local' },
    ],
  },
  {
    category: 'Export & Installation',
    color: '#f9a8d4',
    rows: [
      { feature: 'Copy HTML to Clipboard', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'PNG Rich Clipboard / Render', personal: 'Yes', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'Hosted PNG / Image URL Flow', personal: 'No', advanced: 'Yes', ultimate: 'Yes' },
      { feature: 'All Install Guides', personal: 'All', advanced: 'All', ultimate: 'All' },
    ],
  },
  {
    category: 'Branding',
    color: '#86efac',
    rows: [{ feature: 'Hide "Made with SignatureBuilder" Badge', personal: 'No', advanced: 'Yes', ultimate: 'Yes' }],
  },
];
