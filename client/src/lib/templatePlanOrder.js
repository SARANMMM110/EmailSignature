/** Stable catalog order for plan-based template locks (matches API `sort_order`). */
export function sortTemplatesBySortOrder(templates) {
  return [...(templates || [])].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
}

/** Set of template ids not included in the user's `layout_templates` limit (first N in sort order stay unlocked). */
export function lockedTemplateIdsForPlan(templates, maxLayouts) {
  const sorted = sortTemplatesBySortOrder(templates);
  const locked = new Set();
  if (maxLayouts === Infinity) return locked;
  sorted.forEach((t, i) => {
    if (i >= maxLayouts) locked.add(t.id);
  });
  return locked;
}
