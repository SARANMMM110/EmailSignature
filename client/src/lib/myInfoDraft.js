const STORAGE_KEY = 'signatureBuilder.myInfo.v1';

const FIELD_KEYS = [
  'full_name',
  'job_title',
  'company',
  'phone',
  'email',
  'website',
  'address',
  'photo_url',
  'logo_url',
];

const SOCIAL_KEYS = ['linkedin', 'twitter', 'instagram', 'github', 'facebook', 'telegram', 'medium'];

export function readMyInfoDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    return {
      fields: o.fields && typeof o.fields === 'object' ? o.fields : {},
      social_links: o.social_links && typeof o.social_links === 'object' ? o.social_links : {},
    };
  } catch {
    return null;
  }
}

export function writeMyInfoDraft(fields, social_links) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fields: fields && typeof fields === 'object' ? fields : {},
        social_links: social_links && typeof social_links === 'object' ? social_links : {},
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function pickDraftPayload(fields, social_links) {
  const f = {};
  for (const k of FIELD_KEYS) {
    const v = fields?.[k];
    if (v != null && String(v).trim() !== '') f[k] = v;
  }
  const s = {};
  for (const k of SOCIAL_KEYS) {
    const v = social_links?.[k];
    if (v != null && String(v).trim() !== '') s[k] = v;
  }
  return { fields: f, social_links: s };
}

/**
 * Map Supabase `profiles` + auth user into signature `fields` (snake_case).
 * Company / website are not stored on profiles; omit so callers keep demo or API defaults.
 */
export function fieldsFromAccountProfile(profile, user) {
  if (!profile && !user) return {};
  const out = {};
  const fromParts = [profile?.first_name, profile?.last_name]
    .map((x) => (x != null ? String(x).trim() : ''))
    .filter(Boolean)
    .join(' ')
    .trim();
  const full =
    (profile?.full_name != null && String(profile.full_name).trim()) ||
    fromParts ||
    '';
  if (full) out.full_name = full;
  const email = user?.email != null ? String(user.email).trim() : '';
  if (email) out.email = email;
  if (profile?.job_title != null && String(profile.job_title).trim() !== '') {
    out.job_title = String(profile.job_title).trim();
  }
  if (profile?.phone != null && String(profile.phone).trim() !== '') {
    out.phone = String(profile.phone).trim();
  }
  if (profile?.address != null && String(profile.address).trim() !== '') {
    out.address = String(profile.address).trim();
  }
  if (profile?.avatar_url != null && String(profile.avatar_url).trim() !== '') {
    out.photo_url = String(profile.avatar_url).trim();
  }
  if (profile?.logo_url != null && String(profile.logo_url).trim() !== '') {
    out.logo_url = String(profile.logo_url).trim();
  }
  return out;
}

export function profileHasPrefillableContent(profile, user) {
  return Object.keys(fieldsFromAccountProfile(profile, user)).length > 0;
}

/**
 * Merge account profile over demo/API defaults for a pristine signature row.
 */
export function starterFieldsWithProfile(baseFields, baseSocial, profile, user) {
  const p = fieldsFromAccountProfile(profile, user);
  const fields = { ...(baseFields || {}) };
  for (const k of FIELD_KEYS) {
    const v = p[k];
    if (v != null && String(v).trim() !== '') fields[k] = v;
  }
  return { fields, social_links: { ...(baseSocial || {}) } };
}

/** Partial `form` object (camelCase) for POST /html/generate from profile + user. */
export function profileFormPartialForGenerate(profile, user) {
  const f = fieldsFromAccountProfile(profile, user);
  const out = {};
  if (f.full_name) out.fullName = f.full_name;
  if (f.job_title) out.jobTitle = f.job_title;
  if (f.company) out.companyName = f.company;
  if (f.phone) out.phone = f.phone;
  if (f.email) out.email = f.email;
  if (f.website) out.website = f.website;
  if (f.address) out.address = f.address;
  if (f.photo_url) out.photoUrl = f.photo_url;
  if (f.logo_url) out.logoUrl = f.logo_url;
  return out;
}

/**
 * Previously filled any empty field from the account profile. That made intentional clears
 * impossible (empty was treated like “not set yet”). Profile seeding now happens only for
 * fresh template rows via {@link starterFieldsWithProfile}; do not merge profile into empties here.
 */
export function mergeProfileIntoSignature(sig, _profile, _user) {
  return sig;
}

/**
 * After a signature was seeded with {@link starterFieldsWithProfile} using empty profile, or when
 * profile loads later, replace fields that still match demo placeholders with account data.
 * Does not overwrite values the user has changed away from the demo defaults, and does not
 * refill fields the user cleared to empty (empty is intentional, not “still demo”).
 */
export function applyProfileOverDemoPlaceholders(sig, profile, user, demoFields) {
  const p = fieldsFromAccountProfile(profile, user);
  if (!sig || !demoFields || typeof demoFields !== 'object' || Object.keys(p).length === 0) return sig;
  const nextFields = { ...(sig.fields || {}) };
  let changed = false;
  for (const k of FIELD_KEYS) {
    const pv = String(p[k] ?? '').trim();
    if (!pv) continue;
    const cur = String(nextFields[k] ?? '').trim();
    const demoVal = String(demoFields[k] ?? '').trim();
    if (demoVal !== '' && cur === demoVal) {
      nextFields[k] = p[k];
      changed = true;
    }
  }
  return changed ? { ...sig, fields: nextFields } : sig;
}

export function hasPersistedMyInfoDraft() {
  const d = readMyInfoDraft();
  if (!d) return false;
  const { fields, social_links } = pickDraftPayload(d.fields, d.social_links);
  return Object.keys(fields).length > 0 || Object.keys(social_links).length > 0;
}

