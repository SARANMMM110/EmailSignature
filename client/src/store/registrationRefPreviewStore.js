import { create } from 'zustand';
import { normalizePlanId } from '../data/plans.js';
import { getPublicRegistrationLinkPreview } from '../lib/api.js';
import { REGISTRATION_REF_STORAGE_KEY } from '../lib/registrationRef.js';

/**
 * Public registration link (`?ref=`) preview — used so plan badges match the invite tier before redeem.
 */
export const useRegistrationRefPreviewStore = create((set, get) => ({
  planId: null,
  planName: null,
  loading: false,

  clear: () => set({ planId: null, planName: null, loading: false }),

  async syncFromStorage() {
    if (typeof sessionStorage === 'undefined') {
      set({ planId: null, planName: null, loading: false });
      return;
    }
    const code = sessionStorage.getItem(REGISTRATION_REF_STORAGE_KEY)?.trim();
    if (!code) {
      get().clear();
      return;
    }
    set({ loading: true });
    try {
      const data = await getPublicRegistrationLinkPreview(code);
      const still = sessionStorage.getItem(REGISTRATION_REF_STORAGE_KEY)?.trim() === code;
      if (!still) {
        get().clear();
        return;
      }
      if (data?.valid && data.plan_id) {
        set({
          planId: normalizePlanId(data.plan_id),
          planName: String(data.plan_name || data.plan_id || '').trim() || normalizePlanId(data.plan_id),
          loading: false,
        });
      } else {
        set({ planId: null, planName: null, loading: false });
      }
    } catch {
      set({ planId: null, planName: null, loading: false });
    }
  },
}));
