import { normalizePlanId } from '../data/plans.js';

/** Active `agency_members` rows embedded on `profiles` (see authStore AGENCY_EMBED). */
function activeMemberAssignedPlan(profile) {
  const raw = profile?.agency_member_rows ?? profile?.agency_members;
  const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const active = rows.find((r) => r && r.is_active !== false);
  if (!active?.assigned_plan) return null;
  return normalizePlanId(active.assigned_plan);
}

/**
 * Tier used for entitlements (feature gates, limits) — profile / agency assignment only,
 * not a signup `?ref=` that has not been redeemed yet.
 */
export function entitlementTier1PlanId(profile) {
  const fromMembership = activeMemberAssignedPlan(profile);
  if (fromMembership) return fromMembership;
  if (profile?._devPlanUiOverride?.databasePlan != null) {
    return normalizePlanId(profile._devPlanUiOverride.databasePlan);
  }
  return normalizePlanId(profile?.plan || 'personal');
}

/**
 * Tier-1 plan for UI badges (sidebar, settings label, etc.).
 * Pending `?ref=` registration invite wins first so the app matches the link the user followed; ref is
 * cleared after redeem or skip. Then agency member assigned tier, then dev override, then `profiles.plan`.
 * Feature limits use {@link entitlementTier1PlanId} instead (no pending-ref override).
 */
export function effectiveTier1PlanId(profile, opts = {}) {
  const pending = opts.pendingRegistrationPlanId;
  if (pending) return normalizePlanId(pending);
  const fromMembership = activeMemberAssignedPlan(profile);
  if (fromMembership) return fromMembership;
  if (profile?._devPlanUiOverride?.databasePlan != null) {
    return normalizePlanId(profile._devPlanUiOverride.databasePlan);
  }
  return normalizePlanId(profile?.plan || 'personal');
}
