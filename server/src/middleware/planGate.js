import { supabaseAdmin } from '../services/supabase.js';
import { PLANS, normalizePlanId, minPlanForFeature } from '../data/plans.js';

async function loadProfilePlan(userId) {
  const { data, error } = await supabaseAdmin.from('profiles').select('plan').eq('id', userId).maybeSingle();
  if (error) throw error;
  return normalizePlanId(data?.plan);
}

/**
 * Express middleware — boolean/string features must be enabled on the user's plan.
 */
export function requireFeature(featureKey) {
  return async (req, res, next) => {
    try {
      const planId = await loadProfilePlan(req.user.id);
      const plan = PLANS[planId] || PLANS.personal;
      const val = plan.features[featureKey];
      if (val === true || (typeof val === 'string' && val !== '')) {
        return next();
      }
      return res.status(403).json({
        error: 'PLAN_FEATURE_REQUIRED',
        feature: featureKey,
        current_plan: planId,
        required_plan: minPlanForFeature(featureKey),
        message: 'This feature requires a higher plan.',
      });
    } catch (e) {
      next(e);
    }
  };
}

/**
 * Express middleware — block when current resource count is already at or above the plan limit.
 * `getCount(userId)` must return a Promise<number>.
 */
export function requireUnderLimit(limitKey, getCount) {
  return async (req, res, next) => {
    try {
      const planId = await loadProfilePlan(req.user.id);
      const plan = PLANS[planId] || PLANS.personal;
      const max = plan.limits[limitKey];
      if (max === Infinity || max === undefined) return next();
      const currentCount = await getCount(req.user.id);
      if (currentCount >= max) {
        return res.status(403).json({
          error: 'PLAN_LIMIT_REACHED',
          limit: limitKey,
          feature: limitKey,
          current: currentCount,
          max,
          current_plan: planId,
          required_plan: minPlanForFeature(limitKey),
          message: `You've reached the ${limitKey} limit for your plan.`,
        });
      }
      return next();
    } catch (e) {
      next(e);
    }
  };
}
