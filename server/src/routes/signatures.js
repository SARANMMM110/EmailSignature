import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabase.js';
import {
  generateSignatureHtml,
  rowToGeneratePayload,
} from '../services/htmlGenerator.js';
import { throwIfSupabaseError } from '../lib/supabaseRestError.js';
import {
  resolveTemplateUuid,
  resolveBannerUuid,
  uuidToTemplateSlug,
  TEMPLATE_SLUG_TO_UUID,
  TEMPLATE_10_CANONICAL_COLORS,
  TEMPLATE_11_CANONICAL_COLORS,
  TEMPLATE_12_CANONICAL_COLORS,
  TEMPLATE_13_CANONICAL_COLORS,
  TEMPLATE_14_CANONICAL_COLORS,
  TEMPLATE_15_CANONICAL_COLORS,
  TEMPLATE_16_CANONICAL_COLORS,
  TEMPLATE_17_CANONICAL_COLORS,
  TEMPLATE_18_CANONICAL_COLORS,
  TEMPLATE_19_CANONICAL_COLORS,
  TEMPLATE_20_CANONICAL_COLORS,
} from '../lib/templateIds.js';
import { requireUnderLimit } from '../middleware/planGate.js';
import { countUserSignatures } from '../lib/planCounts.js';
import { applyPlanConstraintsToSignatureRow } from '../lib/planSanitize.js';

/** Stored `generated_html` should keep image-only CTA shell before upload (matches live editor preview). */
const ROW_GENERATE_HTML_OPTIONS = { persistIncompleteBlank: true };

const router = Router();

async function planSanitizeRowForUser(row, userId) {
  const { data, error } = await supabaseAdmin.from('profiles').select('plan').eq('id', userId).maybeSingle();
  throwIfSupabaseError(error);
  applyPlanConstraintsToSignatureRow(row, data?.plan);
}

function bundleFromBody(body) {
  return body.data && typeof body.data === 'object' ? body.data : {};
}

function dbRowFromRequest(body, html) {
  const bundle = bundleFromBody(body);
  const form = bundle.form || {};
  return {
    user_id: body.userId,
    label: body.name?.trim() || form.signatureName || 'Untitled',
    template_id: resolveTemplateUuid(bundle.templateId || body.template_id),
    banner_id: null,
    signature_link: form.signatureLinkUrl || null,
    show_badge: form.showBadge !== false,
    fields: {
      full_name: form.fullName || null,
      job_title: form.jobTitle || null,
      company: form.companyName || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      address: form.address || null,
      photo_url: form.photoUrl || null,
      logo_url: form.logoUrl || null,
      _bundle: bundle,
    },
    design: {
      palette: bundle.palette || {},
      templateId: bundle.templateId || 'template_1',
    },
    social_links: {
      linkedin: form.linkedin || null,
      twitter: form.twitter || null,
      instagram: form.instagram || null,
      github: form.github || null,
      facebook: form.facebook || null,
      telegram: form.telegram || null,
      medium: form.medium || null,
    },
    banner_config: bundle.banner
      ? {
          link_url: bundle.banner.href,
          text: bundle.banner.text ?? '',
          preset_id: bundle.banner.id || bundle.banner.preset_id || 'book-call',
          field_1: bundle.banner.field_1,
          field_2: bundle.banner.field_2,
          field_3: bundle.banner.field_3,
          field_4: bundle.banner.field_4,
          field_5: bundle.banner.field_5,
          banner_image_url: bundle.banner.banner_image_url,
          image_url: bundle.banner.image_url,
        }
      : {},
    generated_html: html || null,
  };
}

export function signatureRowToClient(row) {
  if (!row) return null;
  const bundle = row.fields?._bundle;
  const data =
    bundle && typeof bundle === 'object'
      ? bundle
      : {
          templateId: row.design?.templateId || 'template_1',
          form: {
            signatureName: row.label,
            fullName: row.fields?.full_name,
            jobTitle: row.fields?.job_title,
            companyName: row.fields?.company,
            phone: row.fields?.phone,
            email: row.fields?.email,
            website: row.fields?.website,
            address: row.fields?.address,
            photoUrl: row.fields?.photo_url,
            logoUrl: row.fields?.logo_url,
            linkedin: row.social_links?.linkedin,
            twitter: row.social_links?.twitter,
            instagram: row.social_links?.instagram,
            github: row.social_links?.github,
            facebook: row.social_links?.facebook,
            telegram: row.social_links?.telegram,
            medium: row.social_links?.medium,
            showBadge: row.show_badge,
            signatureLinkUrl: row.signature_link,
          },
          palette: row.design?.palette || {},
          banner:
            row.banner_config &&
            (String(row.banner_config.link_url || row.banner_config.href || '').trim() ||
              String(row.banner_config.banner_image_url || '').trim())
              ? {
                  id: row.banner_config.preset_id,
                  href: row.banner_config.link_url,
                  text: row.banner_config.text,
                  field_1: row.banner_config.field_1,
                  field_2: row.banner_config.field_2,
                  field_3: row.banner_config.field_3,
                  field_4: row.banner_config.field_4,
                  field_5: row.banner_config.field_5,
                  banner_image_url: row.banner_config.banner_image_url,
                  image_url: row.banner_config.image_url,
                }
              : null,
        };

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.label,
    label: row.label,
    template_id: row.template_id,
    data,
    html: row.generated_html,
    generated_html: row.generated_html,
    fields: row.fields,
    design: row.design,
    social_links: row.social_links,
    banner_id: row.banner_id,
    banner_config: row.banner_config,
    show_badge: row.show_badge,
    signature_link: row.signature_link,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// --- Optional dev override (restore with billing if useful) ---
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('signatures')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });
    throwIfSupabaseError(error);
    res.json({ signatures: (data || []).map(signatureRowToClient) });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  requireUnderLimit('max_active_signatures', countUserSignatures),
  body('label').optional().trim(),
  body('template_id').optional(),
  body('signature_image_url').optional().isString(),
  body('name').optional().trim(),
  body('data').optional().isObject(),
  body('html').optional().isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      if (req.body.data && typeof req.body.data === 'object') {
        let html = req.body.html;
        if (!html) html = await generateSignatureHtml(req.body.data);
        const row = dbRowFromRequest({ ...req.body, userId: req.user.id }, html);
        await planSanitizeRowForUser(row, req.user.id);
        const { data, error } = await supabaseAdmin
          .from('signatures')
          .insert(row)
          .select('*')
          .single();
        throwIfSupabaseError(error);
        return res.status(201).json({ signature: signatureRowToClient(data) });
      }

      const sigImg =
        typeof req.body.signature_image_url === 'string'
          ? req.body.signature_image_url.trim()
          : '';
      if (sigImg) {
        const label = (req.body.label || 'My signature').trim() || 'My signature';
        const tid = TEMPLATE_SLUG_TO_UUID.template_1;
        const row = {
          user_id: req.user.id,
          template_id: tid,
          banner_id: null,
          label,
          signature_link: null,
          show_badge: true,
          fields: { photo_url: sigImg },
          design: {
            templateId: 'template_1',
            palette: {},
          },
          social_links: {},
          banner_config: {},
        };
        row.generated_html = await generateSignatureHtml(
          rowToGeneratePayload(row),
          ROW_GENERATE_HTML_OPTIONS
        );
        await planSanitizeRowForUser(row, req.user.id);
        const { data, error } = await supabaseAdmin
          .from('signatures')
          .insert(row)
          .select('*')
          .single();
        throwIfSupabaseError(error);
        return res.status(201).json({ signature: signatureRowToClient(data) });
      }

      const label = (req.body.label || 'My signature').trim() || 'My signature';
      const slugInput = String(req.body.template_id || 'template_1').trim();
      const tid = resolveTemplateUuid(slugInput) || TEMPLATE_SLUG_TO_UUID.template_1;
      const canonicalSlug = uuidToTemplateSlug(tid);
      const design =
        canonicalSlug === 'template_10'
          ? {
              templateId: canonicalSlug,
              palette: {
                primary: TEMPLATE_10_CANONICAL_COLORS[0],
                secondary: TEMPLATE_10_CANONICAL_COLORS[1],
                accent: TEMPLATE_10_CANONICAL_COLORS[2],
                text: TEMPLATE_10_CANONICAL_COLORS[3],
              },
              colors: [...TEMPLATE_10_CANONICAL_COLORS],
            }
            : canonicalSlug === 'template_11'
            ? {
                templateId: canonicalSlug,
                palette: {
                  primary: TEMPLATE_11_CANONICAL_COLORS[0],
                  secondary: TEMPLATE_11_CANONICAL_COLORS[1],
                  accent: TEMPLATE_11_CANONICAL_COLORS[2],
                  text: TEMPLATE_11_CANONICAL_COLORS[3],
                },
                colors: [...TEMPLATE_11_CANONICAL_COLORS],
              }
            : canonicalSlug === 'template_12'
              ? {
                  templateId: canonicalSlug,
                  palette: {
                    primary: TEMPLATE_12_CANONICAL_COLORS[0],
                    secondary: TEMPLATE_12_CANONICAL_COLORS[1],
                    accent: TEMPLATE_12_CANONICAL_COLORS[2],
                    text: TEMPLATE_12_CANONICAL_COLORS[3],
                  },
                  colors: [...TEMPLATE_12_CANONICAL_COLORS],
                }
              : canonicalSlug === 'template_13'
                ? {
                    templateId: canonicalSlug,
                    palette: {
                      primary: TEMPLATE_13_CANONICAL_COLORS[0],
                      secondary: TEMPLATE_13_CANONICAL_COLORS[1],
                      accent: TEMPLATE_13_CANONICAL_COLORS[2],
                      text: TEMPLATE_13_CANONICAL_COLORS[3],
                    },
                    colors: [...TEMPLATE_13_CANONICAL_COLORS],
                  }
                : canonicalSlug === 'template_14'
                  ? {
                      templateId: canonicalSlug,
                      palette: {
                        primary: TEMPLATE_14_CANONICAL_COLORS[0],
                        secondary: TEMPLATE_14_CANONICAL_COLORS[1],
                        accent: TEMPLATE_14_CANONICAL_COLORS[2],
                        text: TEMPLATE_14_CANONICAL_COLORS[3],
                      },
                      colors: [...TEMPLATE_14_CANONICAL_COLORS],
                    }
                  : canonicalSlug === 'template_15'
                    ? {
                        templateId: canonicalSlug,
                        palette: {
                          primary: TEMPLATE_15_CANONICAL_COLORS[0],
                          secondary: TEMPLATE_15_CANONICAL_COLORS[1],
                          accent: TEMPLATE_15_CANONICAL_COLORS[2],
                          text: TEMPLATE_15_CANONICAL_COLORS[3],
                        },
                        colors: [...TEMPLATE_15_CANONICAL_COLORS],
                      }
                    : canonicalSlug === 'template_16'
                      ? {
                          templateId: canonicalSlug,
                          palette: {
                            primary: TEMPLATE_16_CANONICAL_COLORS[0],
                            secondary: TEMPLATE_16_CANONICAL_COLORS[1],
                            accent: TEMPLATE_16_CANONICAL_COLORS[2],
                            text: TEMPLATE_16_CANONICAL_COLORS[3],
                          },
                          colors: [...TEMPLATE_16_CANONICAL_COLORS],
                        }
                      : canonicalSlug === 'template_17'
                        ? {
                            templateId: canonicalSlug,
                            palette: {
                              primary: TEMPLATE_17_CANONICAL_COLORS[0],
                              secondary: TEMPLATE_17_CANONICAL_COLORS[1],
                              accent: TEMPLATE_17_CANONICAL_COLORS[2],
                              text: TEMPLATE_17_CANONICAL_COLORS[3],
                            },
                            colors: [...TEMPLATE_17_CANONICAL_COLORS],
                          }
                        : canonicalSlug === 'template_18'
                          ? {
                              templateId: canonicalSlug,
                              palette: {
                                primary: TEMPLATE_18_CANONICAL_COLORS[0],
                                secondary: TEMPLATE_18_CANONICAL_COLORS[1],
                                accent: TEMPLATE_18_CANONICAL_COLORS[2],
                                text: TEMPLATE_18_CANONICAL_COLORS[3],
                              },
                              colors: [...TEMPLATE_18_CANONICAL_COLORS],
                            }
                          : canonicalSlug === 'template_19'
                            ? {
                                templateId: canonicalSlug,
                                palette: {
                                  primary: TEMPLATE_19_CANONICAL_COLORS[0],
                                  secondary: TEMPLATE_19_CANONICAL_COLORS[1],
                                  accent: TEMPLATE_19_CANONICAL_COLORS[2],
                                  text: TEMPLATE_19_CANONICAL_COLORS[3],
                                },
                                colors: [...TEMPLATE_19_CANONICAL_COLORS],
                              }
                            : canonicalSlug === 'template_20'
                              ? {
                                  templateId: canonicalSlug,
                                  palette: {
                                    primary: TEMPLATE_20_CANONICAL_COLORS[0],
                                    secondary: TEMPLATE_20_CANONICAL_COLORS[1],
                                    accent: TEMPLATE_20_CANONICAL_COLORS[2],
                                    text: TEMPLATE_20_CANONICAL_COLORS[3],
                                  },
                                  colors: [...TEMPLATE_20_CANONICAL_COLORS],
                                }
                              : { templateId: canonicalSlug, palette: {} };
      const row = {
        user_id: req.user.id,
        template_id: tid,
        banner_id: null,
        label,
        signature_link: null,
        show_badge: true,
        fields: {},
        design,
        social_links: {},
        banner_config: {},
      };
      row.generated_html = await generateSignatureHtml(
        rowToGeneratePayload(row),
        ROW_GENERATE_HTML_OPTIONS
      );
      await planSanitizeRowForUser(row, req.user.id);
      const { data, error } = await supabaseAdmin
        .from('signatures')
        .insert(row)
        .select('*')
        .single();
      throwIfSupabaseError(error);
      res.status(201).json({ signature: signatureRowToClient(data) });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/:id/copy',
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
      }
      const { data: row, error } = await supabaseAdmin
        .from('signatures')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .maybeSingle();
      throwIfSupabaseError(error);
      if (!row) return res.status(404).json({ message: 'Signature not found' });
      let html = row.generated_html;
      if (!html) {
        html = await generateSignatureHtml(rowToGeneratePayload(row), ROW_GENERATE_HTML_OPTIONS);
        await supabaseAdmin
          .from('signatures')
          .update({ generated_html: html, updated_at: new Date().toISOString() })
          .eq('id', row.id);
      }
      res.json({ html });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/:id/duplicate',
  requireUnderLimit('max_active_signatures', countUserSignatures),
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
      }

      const { data: orig, error: fe } = await supabaseAdmin
        .from('signatures')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .maybeSingle();
      throwIfSupabaseError(fe);
      if (!orig) return res.status(404).json({ message: 'Signature not found' });

      const copy = {
        user_id: req.user.id,
        template_id: orig.template_id,
        banner_id: orig.banner_id,
        label: `Copy of ${orig.label}`,
        signature_link: orig.signature_link,
        show_badge: orig.show_badge,
        fields: orig.fields,
        design: orig.design,
        social_links: orig.social_links,
        banner_config: orig.banner_config,
        generated_html: orig.generated_html,
      };
      await planSanitizeRowForUser(copy, req.user.id);
      copy.generated_html = await generateSignatureHtml(
        rowToGeneratePayload(copy),
        ROW_GENERATE_HTML_OPTIONS
      );
      const { data, error } = await supabaseAdmin
        .from('signatures')
        .insert(copy)
        .select('*')
        .single();
      throwIfSupabaseError(error);
      res.status(201).json({ signature: signatureRowToClient(data) });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id',
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
      }
      const { data, error } = await supabaseAdmin
        .from('signatures')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .maybeSingle();
      throwIfSupabaseError(error);
      if (!data) return res.status(404).json({ message: 'Signature not found' });
      res.json({ signature: signatureRowToClient(data) });
    } catch (e) {
      next(e);
    }
  }
);

router.put(
  '/:id',
  param('id').isUUID(),
  body('label').optional().trim(),
  body('fields').optional().isObject(),
  body('design').optional().isObject(),
  body('social_links').optional().isObject(),
  body('banner_id').optional({ nullable: true }),
  body('banner_config').optional().isObject(),
  body('show_badge').optional().isBoolean(),
  body('signature_link').optional({ nullable: true }),
  body('name').optional().trim(),
  body('data').optional().isObject(),
  body('html').optional().isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      const { id } = req.params;
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from('signatures')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .maybeSingle();
      throwIfSupabaseError(fetchErr);
      if (!existing) return res.status(404).json({ message: 'Signature not found' });

      // Merge updates, regenerate email-safe HTML, persist generated_html on every save.
      let nextRow = { ...existing };

      if (req.body.name != null) nextRow.label = req.body.name.trim();
      if (req.body.label != null) nextRow.label = req.body.label;
      if (req.body.fields != null) {
        nextRow.fields = { ...existing.fields, ...req.body.fields };
      }
      if (req.body.design != null) {
        nextRow.design = { ...existing.design, ...req.body.design };
        if (req.body.design.templateId) {
          const t = String(req.body.design.templateId).trim();
          if (/^template_image$/i.test(t)) {
            nextRow.template_id = TEMPLATE_SLUG_TO_UUID.template_1;
            nextRow.design = { ...nextRow.design, templateId: 'template_1' };
          } else {
            const r = resolveTemplateUuid(t);
            if (r) nextRow.template_id = r;
          }
        }
      }
      if (req.body.social_links != null) {
        nextRow.social_links = { ...existing.social_links, ...req.body.social_links };
      }
      /**
       * Replace `banner_config` entirely from the editor — shallow merge kept deleted keys
       * (e.g. `{}` merged with old config left `link_url`, and `secondary_*` could never clear).
       */
      if (req.body.banner_config != null && typeof req.body.banner_config === 'object') {
        nextRow.banner_config = req.body.banner_config;
      }
      if (typeof req.body.show_badge === 'boolean') nextRow.show_badge = req.body.show_badge;
      if (req.body.signature_link !== undefined) {
        nextRow.signature_link = req.body.signature_link || null;
      }
      if (req.body.banner_id !== undefined) {
        nextRow.banner_id = req.body.banner_id ? resolveBannerUuid(req.body.banner_id) : null;
        if (!nextRow.banner_id && nextRow.fields && typeof nextRow.fields === 'object') {
          const f = nextRow.fields;
          if (f._bundle && typeof f._bundle === 'object' && f._bundle.banner != null) {
            const restBundle = { ...f._bundle };
            delete restBundle.banner;
            nextRow.fields = { ...f, _bundle: restBundle };
          }
        }
      }

      if (req.body.data != null) {
        let html = req.body.html;
        if (html == null) html = await generateSignatureHtml(req.body.data);
        const partial = dbRowFromRequest(
          {
            name: req.body.name || req.body.label || nextRow.label,
            data: req.body.data,
            userId: req.user.id,
            template_id: req.body.template_id,
          },
          html
        );
        nextRow = {
          ...nextRow,
          label: partial.label,
          fields: partial.fields,
          design: partial.design,
          social_links: partial.social_links,
          banner_config: partial.banner_config,
          signature_link: partial.signature_link,
          show_badge: partial.show_badge,
          template_id: partial.template_id ?? nextRow.template_id,
          generated_html: html,
        };
      }

      await planSanitizeRowForUser(nextRow, req.user.id);
      nextRow.generated_html = await generateSignatureHtml(
        rowToGeneratePayload(nextRow),
        ROW_GENERATE_HTML_OPTIONS
      );

      nextRow.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('signatures')
        .update({
          label: nextRow.label,
          fields: nextRow.fields,
          design: nextRow.design,
          social_links: nextRow.social_links,
          banner_config: nextRow.banner_config,
          banner_id: nextRow.banner_id,
          template_id: nextRow.template_id,
          show_badge: nextRow.show_badge,
          signature_link: nextRow.signature_link,
          generated_html: nextRow.generated_html,
          updated_at: nextRow.updated_at,
        })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select('*')
        .single();
      throwIfSupabaseError(error);
      res.json({ signature: signatureRowToClient(data) });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/:id',
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
      }
      const { data, error } = await supabaseAdmin
        .from('signatures')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select('id');
      throwIfSupabaseError(error);
      if (!data?.length) return res.status(404).json({ message: 'Signature not found' });
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
