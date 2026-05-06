import { LANDING_TEMPLATE_SHOWCASE } from '../data/landingPalettes.js';
import { GALLERY_HIDDEN_ENGINE_SLUGS, uuidToTemplateSlug } from './templateIds.js';

/** Landing “Templates” strip order — intro-first, then API `sort_order` for the rest. */
const INTRO_SHOWCASE_ORDER = new Map(
  LANDING_TEMPLATE_SHOWCASE.map((row, index) => [row.id, index])
);

/** Stable catalog order for plan-based template locks (matches API `sort_order`). */
export function sortTemplatesBySortOrder(templates) {
  return [...(templates || [])].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
}

/**
 * Editor layout picker + signed-in gallery: hide duplicate-engine rows (same HTML as another layout),
 * then order like {@link LANDING_TEMPLATE_SHOWCASE}, then `sort_order`.
 */
export function prepareTemplatesForLayoutPicker(templates) {
  const list = (templates || []).filter(
    (t) => !GALLERY_HIDDEN_ENGINE_SLUGS.has(uuidToTemplateSlug(t.id))
  );
  return list.sort((a, b) => {
    const sa = uuidToTemplateSlug(a.id);
    const sb = uuidToTemplateSlug(b.id);
    const oa = INTRO_SHOWCASE_ORDER.has(sa) ? INTRO_SHOWCASE_ORDER.get(sa) : Number.POSITIVE_INFINITY;
    const ob = INTRO_SHOWCASE_ORDER.has(sb) ? INTRO_SHOWCASE_ORDER.get(sb) : Number.POSITIVE_INFINITY;
    if (oa !== ob) return oa - ob;
    return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
  });
}

/**
 * @param {{ preserveInputOrder?: boolean }} [opts] — if true, use array order as-is (after caller sorted with {@link prepareTemplatesForLayoutPicker}).
 */
export function lockedTemplateIdsForPlan(templates, maxLayouts, opts = {}) {
  const sorted =
    opts.preserveInputOrder === true ? [...(templates || [])] : sortTemplatesBySortOrder(templates);
  const locked = new Set();
  if (maxLayouts === Infinity) return locked;
  sorted.forEach((t, i) => {
    if (i >= maxLayouts) locked.add(t.id);
  });
  return locked;
}
