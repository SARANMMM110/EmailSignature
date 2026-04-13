/**
 * Billing / plan gates — disabled during product development.
 * Restore the block below when you ship pricing (set SHOW_LANDING_PRICING in LandingPage.jsx too).
 *
 * --- PRODUCTION (restore) ---
 * export function isPaidPlan(plan) {
 *   return plan === 'pro' || plan === 'business';
 * }
 * export function isFreePlan(plan) {
 *   return !plan || plan === 'free';
 * }
 * --- end ---
 */

export function isPaidPlan(_plan) {
  return true;
}

export function isFreePlan(_plan) {
  return false;
}
