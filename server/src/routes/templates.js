import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import { supabaseAdmin } from '../services/supabase.js';
import {
  signatureTemplates as fileTemplates,
  resolveTemplateKey,
  TEMPLATE_META,
} from '../templates/signatureTemplates.js';
import { getTemplatePreviewUrl } from '../data/loadTemplatePreviewUrls.js';
import { uuidToTemplateSlug, TEMPLATE_SLUG_TO_UUID } from '../lib/templateIds.js';
import {
  findCatalogTemplateById,
  getFilteredTemplatesCatalog,
  getTemplateCatalogSize,
} from '../data/templatesCatalog.js';
import { TEMPLATE_PERSONA_TAGS } from '../data/templatePersonas.js';

const router = Router();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function templateIdAcceptable(id) {
  const s = String(id).trim();
  if (/^template_\d+$/i.test(s)) return true;
  return UUID_RE.test(s);
}

function slugForUploadedPreview(row) {
  const id = row?.id;
  if (id == null || id === '') return null;
  const s = String(id);
  if (/^template_\d+$/i.test(s)) return s.toLowerCase();
  return uuidToTemplateSlug(s);
}

function mergeStaticPreview(row) {
  const slug = slugForUploadedPreview(row);
  if (!slug) return row;
  const urlForSlug = getTemplatePreviewUrl(slug);
  if (!urlForSlug) return row;
  if (row.preview_img_url && String(row.preview_img_url).trim()) return row;
  return { ...row, preview_img_url: urlForSlug };
}

/** Map a DB/API row id to the HTML engine slug (all seeded UUIDs → `template_1`). */
function catalogEngineSlug(row) {
  const id = row?.id;
  if (id == null || id === '') return 'template_1';
  const s = String(id).trim();
  if (UUID_RE.test(s)) return resolveTemplateKey(uuidToTemplateSlug(s));
  return resolveTemplateKey(s);
}

/**
 * Supabase may have one row per catalog UUID — collapse to one gallery card per HTML engine slug.
 */
function dedupeTemplatesByEngine(rows) {
  const best = new Map();
  for (const row of rows) {
    const eng = catalogEngineSlug(row);
    const order = Number(row.sort_order);
    const sortKey = Number.isFinite(order) ? order : 9999;
    const prev = best.get(eng);
    if (!prev || sortKey < prev.sortKey) {
      best.set(eng, { row, sortKey });
    }
  }
  return [...best.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((x) => x.row);
}

/** Prefer in-code layout metadata over stale DB copy so the gallery matches `signatureTemplates`. */
function normalizeCatalogRowForEngine(row) {
  const eng = catalogEngineSlug(row);
  const meta = TEMPLATE_META[eng];
  const fileRow = fileTemplates.find((t) => t.id === eng);
  const styleTags =
    meta && Array.isArray(meta.style_tags) ? [...meta.style_tags] : [meta?.style || row.style || 'design'];
  const personaTags =
    (meta && Array.isArray(meta.persona_tags) && meta.persona_tags.length
      ? meta.persona_tags
      : TEMPLATE_PERSONA_TAGS[eng]) || [];
  return {
    ...row,
    id: eng,
    name: meta?.name || fileRow?.name || row.name,
    tier: meta?.tier || row.tier || 'free',
    style: meta?.style || row.style || 'design',
    style_tags: styleTags,
    persona_tags: Array.isArray(row.persona_tags) && row.persona_tags.length ? row.persona_tags : personaTags,
    has_logo: meta?.has_logo ?? row.has_logo !== false,
    has_photo: meta?.has_photo ?? row.has_photo !== false,
    color_count: meta?.color_count ?? row.color_count ?? 6,
    sort_order: fileRow?.sort_order ?? row.sort_order ?? 1,
  };
}

/** Upsert `templates` rows for engines that exist in code but not yet in the DB (e.g. migration not applied). */
async function ensureMissingTemplatesInSupabase(normalizedRows) {
  if (!supabaseAdmin) return;
  const present = new Set((normalizedRows || []).map((r) => String(r.id || '').toLowerCase()));
  for (const slug of Object.keys(TEMPLATE_META)) {
    if (present.has(slug.toLowerCase())) continue;
    const uuid = TEMPLATE_SLUG_TO_UUID[slug];
    if (!uuid) continue;
    const meta = TEMPLATE_META[slug];
    const fileRow = fileTemplates.find((t) => t.id === slug);
    const row = {
      id: uuid,
      name: meta?.name || fileRow?.name || slug,
      html_structure: '<!-- engine -->',
      tier: meta?.tier || fileRow?.tier || 'free',
      style: meta?.style || fileRow?.style || 'design',
      has_logo: meta?.has_logo !== false,
      has_photo: meta?.has_photo !== false,
      color_count: meta?.color_count ?? fileRow?.color_count ?? 6,
      sort_order: fileRow?.sort_order ?? 99,
      is_active: true,
    };
    const { error } = await supabaseAdmin.from('templates').upsert(row, { onConflict: 'id' });
    if (error) console.warn('[templates] upsert missing engine', slug, error.message);
  }
}

/** Append any {@link TEMPLATE_META} engine missing from the DB-backed list so the gallery matches the HTML engines. */
function mergeMissingEnginesFromMeta(normalizedRows) {
  const bySlug = new Map((normalizedRows || []).map((r) => [String(r.id).toLowerCase(), r]));
  for (const slug of Object.keys(TEMPLATE_META)) {
    if (bySlug.has(slug.toLowerCase())) continue;
    const uuid = TEMPLATE_SLUG_TO_UUID[slug];
    const fileRow = fileTemplates.find((t) => t.id === slug);
    const synthetic = normalizeCatalogRowForEngine({
      id: uuid || slug,
      name: fileRow?.name,
      html_structure: '',
      tier: fileRow?.tier,
      style: fileRow?.style,
      has_logo: fileRow?.has_logo,
      has_photo: fileRow?.has_photo,
      color_count: fileRow?.color_count,
      sort_order: fileRow?.sort_order,
      is_active: true,
    });
    bySlug.set(String(synthetic.id).toLowerCase(), synthetic);
  }
  return [...bySlug.values()].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function mapFileTemplates(filters) {
  let list = fileTemplates.map((t, i) => ({
    id: t.id,
    name: t.name,
    html_structure: '',
    preview_img_url: getTemplatePreviewUrl(t.id) || t.thumbnail || t.preview_img_url || null,
    tier: t.tier || 'free',
    style: t.style || (t.category === 'Minimal' ? 'minimalist' : 'design'),
    style_tags: Array.isArray(t.style_tags)
      ? t.style_tags
      : [t.style || (t.category === 'Minimal' ? 'minimalist' : 'design')],
    has_logo: t.has_logo !== false,
    has_photo: t.has_photo !== false,
    color_count: t.color_count || 6,
    sort_order: t.sort_order ?? i + 1,
    is_active: true,
  }));
  if (filters.tier) list = list.filter((t) => t.tier === filters.tier);
  if (filters.style) list = list.filter((t) => (t.style_tags || [t.style]).includes(filters.style));
  if (filters.has_logo === 'true') list = list.filter((t) => t.has_logo);
  if (filters.has_logo === 'false') list = list.filter((t) => !t.has_logo);
  return list;
}

router.get(
  '/',
  query('tier').optional().isIn(['free', 'pro']),
  query('style').optional().isIn(['design', 'minimalist']),
  query('has_logo').optional().isIn(['true', 'false']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid query', errors: errors.array() });
      }
      const { tier, style, has_logo } = req.query;
      const filters = { tier, style, has_logo };

      if (getTemplateCatalogSize() > 0) {
        const expanded = getFilteredTemplatesCatalog(filters) || [];
        return res.json({ templates: expanded.map(mergeStaticPreview) });
      }

      if (!supabaseAdmin) {
        return res.json({ templates: mapFileTemplates(filters) });
      }

      let q = supabaseAdmin.from('templates').select('*').eq('is_active', true);
      if (tier) q = q.eq('tier', tier);
      if (style) q = q.eq('style', style);
      if (has_logo === 'true') q = q.eq('has_logo', true);
      if (has_logo === 'false') q = q.eq('has_logo', false);

      const { data, error } = await q.order('sort_order', { ascending: true });
      if (error) {
        console.warn('[templates] DB:', error.message);
        return res.json({ templates: mapFileTemplates(filters) });
      }
      if (!data?.length) {
        return res.json({ templates: mapFileTemplates(filters) });
      }
      const uniqueByEngine = dedupeTemplatesByEngine(data).map(normalizeCatalogRowForEngine);
      await ensureMissingTemplatesInSupabase(uniqueByEngine);
      const merged = mergeMissingEnginesFromMeta(uniqueByEngine);
      res.json({ templates: merged.map(mergeStaticPreview) });
    } catch (e) {
      next(e);
    }
  }
);

router.get('/:id', param('id').notEmpty(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid id', errors: errors.array() });
    }
    const id = req.params.id;

    if (getTemplateCatalogSize() > 0) {
      const fromCatalog = findCatalogTemplateById(id);
      if (fromCatalog) {
        return res.json({ template: mergeStaticPreview(fromCatalog) });
      }
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        return res.json({ template: mergeStaticPreview(data) });
      }
    }

    const file = fileTemplates.find((t) => t.id === id);
    if (file) {
      return res.json({
        template: mergeStaticPreview({
          id: file.id,
          name: file.name,
          html_structure: '',
          preview_img_url: getTemplatePreviewUrl(file.id) || file.thumbnail || file.preview_img_url || null,
          tier: file.tier || 'free',
          style: file.style || (file.category === 'Minimal' ? 'minimalist' : 'design'),
          style_tags: Array.isArray(file.style_tags)
            ? file.style_tags
            : [
                file.style ||
                  (file.category === 'Minimal' ? 'minimalist' : 'design'),
              ],
          has_logo: file.has_logo !== false,
          has_photo: file.has_photo !== false,
          color_count: file.color_count || 6,
          sort_order: file.sort_order ?? fileTemplates.indexOf(file),
          is_active: true,
        }),
      });
    }

    if (templateIdAcceptable(id)) {
      const file0 = fileTemplates[0];
      if (file0) {
        return res.json({
          template: mergeStaticPreview({
            id: 'template_1',
            name: file0.name,
            html_structure: '',
            preview_img_url: getTemplatePreviewUrl('template_1'),
            tier: file0.tier || 'free',
            style: file0.style || 'design',
            style_tags: Array.isArray(file0.style_tags)
              ? file0.style_tags
              : [file0.style || 'design'],
            has_logo: file0.has_logo !== false,
            has_photo: file0.has_photo !== false,
            color_count: file0.color_count || 4,
            sort_order: 1,
            is_active: true,
          }),
        });
      }
    }

    res.status(404).json({ message: 'Template not found' });
  } catch (e) {
    next(e);
  }
});

export default router;
