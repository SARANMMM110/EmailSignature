import { getPlan, normalizePlanId } from '../data/plans.js';

/**
 * Enforce plan rules on a merged signature row before persist / HTML generation.
 * Mutates `row` in place; returns the same reference.
 */
export function applyPlanConstraintsToSignatureRow(row, rawPlan) {
  const planId = normalizePlanId(rawPlan);
  const plan = getPlan(planId);

  if (!plan.features.hide_made_with_badge) {
    row.show_badge = true;
  }
  if (!plan.features.whole_sig_clickthrough_url) {
    row.signature_link = null;
    const f = row.fields && typeof row.fields === 'object' ? row.fields : {};
    const bundle = f._bundle && typeof f._bundle === 'object' ? { ...f._bundle } : null;
    if (bundle) {
      if (bundle.form && typeof bundle.form === 'object') {
        bundle.form = { ...bundle.form, signatureLinkUrl: '' };
      }
      row.fields = { ...f, _bundle: bundle };
    }
  }

  const maxBanners = plan.limits.cta_banner_templates;
  if (typeof maxBanners === 'number' && maxBanners === 0) {
    row.banner_id = null;
    row.banner_config = {};
    const f = row.fields && typeof row.fields === 'object' ? row.fields : {};
    if (f._bundle && typeof f._bundle === 'object' && f._bundle.banner != null) {
      const restBundle = { ...f._bundle };
      delete restBundle.banner;
      row.fields = { ...f, _bundle: restBundle };
    }
  }

  return row;
}
