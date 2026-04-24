const KEY = 'agency_join_link_token';

export function readAgencyJoinLinkToken() {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function writeAgencyJoinLinkToken(token) {
  if (typeof window === 'undefined') return;
  const t = String(token || '').trim();
  try {
    if (t) sessionStorage.setItem(KEY, t);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function clearAgencyJoinLinkToken() {
  writeAgencyJoinLinkToken('');
}
