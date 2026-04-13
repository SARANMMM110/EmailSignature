import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { createT, normalizeLang } from '../i18n/appStrings.js';

/**
 * UI copy from `profile.language` (fr | en). Defaults to English when logged out or unset.
 */
export function useI18n() {
  const lang = useAuthStore((s) => normalizeLang(s.profile?.language));
  const t = useMemo(() => createT(lang), [lang]);
  return { t, lang };
}
