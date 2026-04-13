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

const SOCIAL_KEYS = ['linkedin', 'twitter', 'instagram', 'github', 'facebook', 'medium'];

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
 * Merge last-saved My information (localStorage) over demo/API defaults.
 * Used for brand-new signature rows so the next template starts with what you already entered.
 */
export function starterFieldsWithSavedMyInfo(baseFields, baseSocial) {
  const draft = readMyInfoDraft();
  const fields = { ...(baseFields || {}) };
  const social_links = { ...(baseSocial || {}) };
  if (!draft) return { fields, social_links };
  for (const k of FIELD_KEYS) {
    const dv = draft.fields?.[k];
    if (dv != null && String(dv).trim() !== '') fields[k] = dv;
  }
  for (const k of SOCIAL_KEYS) {
    const dv = draft.social_links?.[k];
    if (dv != null && String(dv).trim() !== '') social_links[k] = dv;
  }
  return { fields, social_links };
}

export function hasPersistedMyInfoDraft() {
  const d = readMyInfoDraft();
  if (!d) return false;
  const { fields, social_links } = pickDraftPayload(d.fields, d.social_links);
  return Object.keys(fields).length > 0 || Object.keys(social_links).length > 0;
}

/** Fill empty signature fields / socials from the last saved draft (same browser). */
export function mergeDraftIntoSignature(sig) {
  const draft = readMyInfoDraft();
  if (!draft || !sig) return sig;
  const nextFields = { ...(sig.fields || {}) };
  let changed = false;
  for (const k of FIELD_KEYS) {
    if (String(nextFields[k] ?? '').trim() === '' && String(draft.fields[k] ?? '').trim() !== '') {
      nextFields[k] = draft.fields[k];
      changed = true;
    }
  }
  const nextSocial = { ...(sig.social_links || {}) };
  for (const k of SOCIAL_KEYS) {
    if (String(nextSocial[k] ?? '').trim() === '' && String(draft.social_links[k] ?? '').trim() !== '') {
      nextSocial[k] = draft.social_links[k];
      changed = true;
    }
  }
  return changed ? { ...sig, fields: nextFields, social_links: nextSocial } : sig;
}
