import { getTemplatePreviewUrl } from '../data/loadTemplatePreviewUrls.js';
import { uuidToTemplateSlug } from './templateIds.js';
import { resolveTemplateKey } from '../templates/signatureTemplates.js';

/**
 * Public HTTPS URL for the layout image used as the email signature (see `generateSignatureHtml`).
 * Tries the exact catalog id first (e.g. template_2.png), then UUID→slug, then cycled engine slug.
 * @param {string} [templateId] template_1, UUID, etc.
 * @returns {string|null}
 */
export function previewImageUrlForTemplateId(templateId) {
  if (templateId == null || templateId === '') return null;
  const s = String(templateId).trim();
  const lower = s.toLowerCase();

  if (/^template_\d+$/i.test(lower)) {
    const direct = getTemplatePreviewUrl(lower);
    if (direct) return direct;
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)) {
    const slug = uuidToTemplateSlug(s);
    const u = getTemplatePreviewUrl(slug);
    if (u) return u;
  }

  const key = resolveTemplateKey(s);
  return getTemplatePreviewUrl(key) || null;
}
