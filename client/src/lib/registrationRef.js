/** Session key for `?ref=` signup codes — consumed after successful redeem API call. */
export const REGISTRATION_REF_STORAGE_KEY = 'sb-registration-ref';

/** Drop a stored signup ref so it cannot overwrite plan after an agency invite. */
export function clearStoredRegistrationRef() {
  try {
    sessionStorage.removeItem(REGISTRATION_REF_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
