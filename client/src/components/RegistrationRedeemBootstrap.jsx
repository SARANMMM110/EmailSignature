import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import api from '../lib/api.js';
import { normalizePlanId } from '../data/plans.js';
import { entitlementTier1PlanId } from '../lib/effectiveTier1Plan.js';
import { clearStoredRegistrationRef, REGISTRATION_REF_STORAGE_KEY } from '../lib/registrationRef.js';
import { useRegistrationRefPreviewStore } from '../store/registrationRefPreviewStore.js';

/**
 * After sign-in / sign-up: redeem a stored `?ref=` code once, then align `profiles.plan`
 * with any existing registration redemption (fixes drift when redeem was skipped or failed earlier).
 */
export function RegistrationRedeemBootstrap() {
  const userId = useAuthStore((s) => s.session?.user?.id);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      await useRegistrationRefPreviewStore.getState().syncFromStorage();
      const raw = sessionStorage.getItem(REGISTRATION_REF_STORAGE_KEY);
      const code = raw?.trim();

      let redeemPayload = null;
      if (code) {
        try {
          const { data } = await api.post('me/redeem-registration-link', { code });
          redeemPayload = data;
          if (!cancelled && data?.ok) {
            clearStoredRegistrationRef();
          } else if (!cancelled && data?.error === 'SKIP_AGENCY_USER') {
            clearStoredRegistrationRef();
          }
        } catch (e) {
          const err = e.response?.data?.error;
          if (err === 'ALREADY_REDEEMED') {
            await api.post('me/sync-registration-plan').catch(() => {});
          }
          if (!cancelled && ['ALREADY_REDEEMED', 'INVALID_CODE', 'LINK_EXHAUSTED', 'SKIP_AGENCY_USER'].includes(err)) {
            clearStoredRegistrationRef();
          }
        }
      }

      await api.post('me/sync-registration-plan').catch(() => {});

      if (!cancelled) {
        await useAuthStore.getState().fetchProfile();
        if (
          !cancelled &&
          redeemPayload?.ok === true &&
          redeemPayload.plan_id &&
          entitlementTier1PlanId(useAuthStore.getState().profile) !== normalizePlanId(redeemPayload.plan_id)
        ) {
          await new Promise((r) => setTimeout(r, 450));
          if (!cancelled) await useAuthStore.getState().fetchProfile();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
