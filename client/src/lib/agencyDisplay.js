export function ownerFirstFromProfile(profile) {
  const full = String(profile?.full_name ?? '').trim();
  if (full) return full.split(/\s+/)[0];
  if (profile?.first_name?.trim()) return String(profile.first_name).trim();
  if (profile?.last_name?.trim()) return String(profile.last_name).trim();
  return '';
}

/** DB `agency_name` or default `Agency owner {first}` from the owner profile. */
export function displayAgencyTitle(agencyPayload, profile) {
  const n = String(agencyPayload?.agency_name ?? '').trim();
  if (n) return n;
  const first = ownerFirstFromProfile(profile);
  return first ? `Agency owner ${first}` : 'Your agency';
}

/**
 * Second line under the sidebar label "Agency owner" — no duplicate "Agency owner …" prefix.
 * Uses saved org name when set; otherwise the owner's display name (or a short fallback).
 */
export function displayAgencyNavSubtitle(agencyPayload, profile) {
  const org = String(agencyPayload?.agency_name ?? '').trim();
  if (org) return org;
  const full = String(profile?.full_name ?? '').trim();
  if (full) return full;
  const first = ownerFirstFromProfile(profile);
  if (first) return first;
  return 'Your agency';
}
