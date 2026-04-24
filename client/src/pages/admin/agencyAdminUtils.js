export function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function agencySetupUrl(token) {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin.replace(/\/+$/, '');
  return `${base}/agency-setup?token=${encodeURIComponent(token)}`;
}

/** Prefer server `full_url` (CLIENT_URL); fallback for older API responses. */
export function tierInviteUrl(row) {
  const u = row?.full_url?.trim();
  if (u) return u;
  return agencySetupUrl(row?.token);
}
