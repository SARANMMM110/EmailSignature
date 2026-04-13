/** Show “Continue with Google” only when true in .env and Google is enabled in Supabase. */
export const isGoogleAuthEnabled =
  import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';

export function formatAuthError(err) {
  const raw = err?.message || String(err || '');
  const lower = raw.toLowerCase();
  if (
    lower.includes('provider is not enabled') ||
    lower.includes('unsupported provider') ||
    err?.code === 'validation_failed'
  ) {
    return 'Google sign-in is not enabled for this project. Use email and password, or turn on Google under Supabase → Authentication → Providers, then set VITE_ENABLE_GOOGLE_AUTH=true in client/.env.';
  }
  return raw || 'Something went wrong';
}
