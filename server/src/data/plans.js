/**
 * Server copy of plan limits/features — keep in sync with `client/src/data/plans.js`.
 * Used by upload limits, signature/palette middleware, and row sanitization.
 */

export const PLAN_IDS = {
  PERSONAL: 'personal',
  ADVANCED: 'advanced',
  ULTIMATE: 'ultimate',
};

export const PLAN_ORDER = [PLAN_IDS.PERSONAL, PLAN_IDS.ADVANCED, PLAN_IDS.ULTIMATE];

export function normalizePlanId(plan) {
  let p = String(plan ?? '').trim().toLowerCase();
  if (!p) p = PLAN_IDS.PERSONAL;
  if (p === 'free') return PLAN_IDS.PERSONAL;
  if (p === 'pro') return PLAN_IDS.ADVANCED;
  if (p === 'business') return PLAN_IDS.ULTIMATE;
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
    limits: {
      max_active_signatures: Infinity,
      max_saved_custom_palettes: Infinity,
      layout_templates: Infinity,
      cta_banner_templates: Infinity,
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

export function minPlanForFeature(key) {
  for (const id of PLAN_ORDER) {
    if (featureUnlocked(PLANS[id], key)) return id;
  }
  return PLAN_IDS.ULTIMATE;
}

export function getPlan(planId) {
  const id = normalizePlanId(planId);
  return PLANS[id] || PLANS.personal;
}
