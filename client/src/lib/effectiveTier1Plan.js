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
 * Tier-1 plan for UI: if the user has an active `agency_members` row, use its `assigned_plan`
 * (invite tier). That can disagree with `profiles.plan` when redeem/join races or legacy data.
 * Otherwise use the profile row (and dev override metadata when present).
 */
export function effectiveTier1PlanId(profile) {
  const fromMembership = activeMemberAssignedPlan(profile);
  if (fromMembership) return fromMembership;
  if (profile?._devPlanUiOverride?.databasePlan != null) {
    return normalizePlanId(profile._devPlanUiOverride.databasePlan);
  }
  return normalizePlanId(profile?.plan || 'personal');
}
