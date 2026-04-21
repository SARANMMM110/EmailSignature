import { normalizePlanId, PLAN_IDS } from '../data/plans.js';

export { normalizePlanId } from '../data/plans.js';

/** Personal tier (incl. legacy `free`) — badge cannot be hidden. */
export function isFreePlan(plan) {
  return normalizePlanId(plan) === PLAN_IDS.PERSONAL;
}

/** Paid tiers: Advanced + Ultimate (incl. legacy `pro` / `business`). */
export function isPaidPlan(plan) {
  const id = normalizePlanId(plan);
  return id === PLAN_IDS.ADVANCED || id === PLAN_IDS.ULTIMATE;
}
