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
