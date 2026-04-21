import { create } from 'zustand';

/**
 * Global upgrade prompts — opened from plan gates and API 403 handlers.
 */
export const useUpgradeModalStore = create((set) => ({
  open: false,
  featureKey: null,
  title: '',
  message: '',
  requiredPlanId: null,

  showUpgradeModal: (payload = {}) =>
    set({
      open: true,
      featureKey: payload.feature ?? payload.featureKey ?? null,
      title: typeof payload.title === 'string' ? payload.title : '',
      message: typeof payload.message === 'string' ? payload.message : '',
      requiredPlanId: payload.requiredPlan ?? payload.requiredPlanId ?? null,
    }),

  hideUpgradeModal: () =>
    set({
      open: false,
      featureKey: null,
      title: '',
      message: '',
      requiredPlanId: null,
    }),
}));
