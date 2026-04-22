import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import api from '../lib/api.js';
import { REGISTRATION_REF_STORAGE_KEY } from '../lib/registrationRef.js';

/**
 * After sign-in / sign-up, applies a stored `?ref=` registration code once (server updates `profiles.plan`).
 */
export function RegistrationRedeemBootstrap() {
  const userId = useAuthStore((s) => s.session?.user?.id);

  useEffect(() => {
    if (!userId) return undefined;
    const raw = sessionStorage.getItem(REGISTRATION_REF_STORAGE_KEY);
    const code = raw?.trim();
    if (!code) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post('me/redeem-registration-link', { code });
        if (!cancelled && data?.ok) {
          sessionStorage.removeItem(REGISTRATION_REF_STORAGE_KEY);
        }
      } catch (e) {
        const err = e.response?.data?.error;
        if (!cancelled && ['ALREADY_REDEEMED', 'INVALID_CODE', 'LINK_EXHAUSTED'].includes(err)) {
          sessionStorage.removeItem(REGISTRATION_REF_STORAGE_KEY);
        }
      } finally {
        if (!cancelled) {
          await useAuthStore.getState().fetchProfile();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
