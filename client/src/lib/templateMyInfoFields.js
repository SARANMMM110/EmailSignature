import { normalizeSignatureTemplateSlug, isImageTemplateSignature } from './templateIds.js';

/**
 * Which “My information” form fields each HTML layout actually reads.
 * Keep in sync with `server/src/templates/signatureTemplates.js` + `contextFromEditorPayload` in htmlGenerator.
 */

/** Layouts that include a headshot upload (template_4 is text-only on the left). */
export const TEMPLATE_HAS_PHOTO_SLOT = {
  template_1: true,
  template_2: true,
  template_3: true,
  template_4: false,
  template_5: true,
  template_6: true,
  template_7: true,
  template_8: true,
  template_9: true,
  template_10: true,
  template_11: true,
  template_12: true,
  template_13: true,
  template_14: true,
  template_15: true,
  template_16: true,
  template_17: true,
  template_18: true,
  template_19: true,
  template_20: true,
};

/** @type {Record<string, Set<string>>} */
const MY_INFO_KEYS_BY_SLUG = {
  template_1: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address', 'company']),
  template_2: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address', 'company']),
  template_3: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
  template_4: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'company']),
  template_5: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
  template_6: new Set([
    'full_name',
    'job_title',
    'phone',
    'email',
    'website',
    'address',
    'company',
    'facebook',
  ]),
  template_7: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address', 'company']),
  template_8: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address', 'company']),
  template_9: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
  template_10: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address', 'company', 'tagline']),
  template_11: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address', 'tagline']),
  template_12: new Set(['full_name', 'job_title', 'phone', 'email', 'address']),
  template_13: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
  template_14: new Set([
    'full_name',
    'job_title',
    'phone',
    'email',
    'website',
    'address',
  ]),
  template_15: new Set([
    'full_name',
    'job_title',
    'phone',
    'email',
    'website',
    'address',
  ]),
  template_16: new Set([
    'full_name',
    'job_title',
    'company',
    'phone',
    'email',
    'website',
    'address',
  ]),
  template_17: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
  template_18: new Set(['full_name', 'job_title', 'company', 'phone', 'email', 'website', 'address']),
  template_19: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
  template_20: new Set(['full_name', 'job_title', 'phone', 'email', 'website', 'address']),
};

const DEFAULT_KEYS = MY_INFO_KEYS_BY_SLUG.template_1;

/**
 * @param {{ design?: { templateId?: string }, template_id?: string } | null | undefined} signature
 * @param {string} key
 */
export function myInfoShowsField(signature, key) {
  if (isImageTemplateSignature(signature)) {
    return key === 'full_name';
  }
  const slug = normalizeSignatureTemplateSlug(signature?.design, signature?.template_id);
  const set = MY_INFO_KEYS_BY_SLUG[slug] || DEFAULT_KEYS;
  return set.has(key);
}

/**
 * @param {{ design?: { templateId?: string }, template_id?: string } | null | undefined} signature
 */
export function templateShowsPhotoSlot(signature) {
  if (isImageTemplateSignature(signature)) return false;
  const slug = normalizeSignatureTemplateSlug(signature?.design, signature?.template_id);
  return TEMPLATE_HAS_PHOTO_SLOT[slug] !== false;
}
