import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import api from '../lib/api.js';
import { normalizePlanId } from '../data/plans.js';
import { entitlementTier1PlanId } from '../lib/effectiveTier1Plan.js';
import { clearStoredRegistrationRef, REGISTRATION_REF_STORAGE_KEY } from '../lib/registrationRef.js';
import { useRegistrationRefPreviewStore } from '../store/registrationRefPreviewStore.js';

/**
 * After sign-in / sign-up: redeem a stored `?ref=` code (first time or when switching to another link),
 * then align `profiles.plan` with the redeemed link (fixes drift when redeem was skipped or failed earlier).
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
      /** Clear invite UI only after profile refresh so the sidebar does not drop from Gold → Bronze for one frame. */
      let clearRefWhenDone = false;
      if (code) {
        try {
          const { data } = await api.post('me/redeem-registration-link', { code });
          redeemPayload = data;
          if (!cancelled && data?.ok) {
            clearRefWhenDone = true;
          } else if (!cancelled && data?.error === 'SKIP_AGENCY_USER') {
            clearRefWhenDone = true;
          }
        } catch (e) {
          const err = e.response?.data?.error;
          if (err === 'ALREADY_REDEEMED') {
            await api.post('me/sync-registration-plan').catch(() => {});
          }
          if (!cancelled && ['ALREADY_REDEEMED', 'INVALID_CODE', 'LINK_EXHAUSTED', 'SKIP_AGENCY_USER'].includes(err)) {
            clearRefWhenDone = true;
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

      if (!cancelled && clearRefWhenDone) {
        clearStoredRegistrationRef();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
