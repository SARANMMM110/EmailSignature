import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getPlan, planHasAccess, minPlanForFeature } from '../data/plans.js';
import { effectiveTier1PlanId } from '../lib/effectiveTier1Plan.js';

/**
 * Returns gate helpers based on the current user's plan.
 */
export function usePlanGate() {
  const profile = useAuthStore((s) => s.profile);
  const userPlanId = effectiveTier1PlanId(profile);
  const userPlan = getPlan(userPlanId);

  return useMemo(
    () => ({
      planId: userPlanId,
      plan: userPlan,

      can(featureKey) {
        const val = userPlan.features[featureKey];
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return true;
        if (typeof val === 'number') return val > 0;
        return false;
      },

      limit(limitKey) {
        return userPlan.limits[limitKey] ?? Infinity;
      },

      isAtLimit(limitKey, currentCount) {
        const max = userPlan.limits[limitKey];
        if (max === Infinity || max === undefined) return false;
        return currentCount >= max;
      },

      hasAccess(requiredPlanId) {
        return planHasAccess(userPlanId, requiredPlanId);
      },

      requiresPlan(featureKey) {
        return minPlanForFeature(featureKey);
      },

      limitText(limitKey) {
        const val = userPlan.limits[limitKey];
        if (val === Infinity) return 'Unlimited';
        return String(val);
      },
    }),
    [userPlanId, userPlan]
  );
}
