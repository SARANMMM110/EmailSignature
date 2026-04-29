import { TEMPLATE_META } from '../templates/signatureTemplates.js';
import { TEMPLATE_PERSONA_TAGS } from './templatePersonas.js';

const MAX_CATALOG = 500;

const AVAILABLE_IDS = () => {
  const keys = Object.keys(TEMPLATE_META);
  if (!keys.length) return ['template_1'];
  return keys.sort((a, b) => {
    const ma = /^template_(\d+)$/i.exec(a);
    const mb = /^template_(\d+)$/i.exec(b);
    if (ma && mb) return parseInt(ma[1], 10) - parseInt(mb[1], 10);
    return a.localeCompare(b);
  });
};

/**
 * How many layout rows to expose in GET /api/templates (one row per defined {@link TEMPLATE_META} entry).
 * Set `TEMPLATE_CATALOG_SIZE=0` for DB/file list only.
 * @returns {number}
 */
export function getTemplateCatalogSize() {
  const v = process.env.TEMPLATE_CATALOG_SIZE;
  if (v === '0' || v === '') return 0;
  const n = parseInt(v ?? '0', 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_CATALOG);
}

/**
 * @param {number} size
 * @returns {object[]}
 */
export function buildExpandedTemplatesCatalog(size) {
  const slugs = AVAILABLE_IDS();
  const count = Math.min(size, slugs.length, MAX_CATALOG);
  const list = [];
  for (let i = 0; i < count; i++) {
    const id = slugs[i];
    const meta = TEMPLATE_META[id];
    if (!meta) continue;
    const styleTags = Array.isArray(meta.style_tags) ? [...meta.style_tags] : [meta.style || 'design'];
    list.push({
      id,
      name: meta.name,
      html_structure: '',
      preview_img_url: null,
      tier: meta.tier || 'free',
      style: meta.style || 'design',
      style_tags: styleTags,
      persona_tags: TEMPLATE_PERSONA_TAGS[id] || [],
      has_logo: meta.has_logo !== false,
      has_photo: meta.has_photo !== false,
      color_count: meta.color_count || 6,
      sort_order: i + 1,
      is_active: true,
    });
  }
  return list;
}

let cachedList = null;
let cachedSize = -1;

export function getExpandedTemplatesCatalog() {
  const size = getTemplateCatalogSize();
  if (size <= 0) return null;
  if (cachedList && cachedSize === size) return cachedList;
  cachedList = buildExpandedTemplatesCatalog(size);
  cachedSize = size;
  return cachedList;
}

/**
 * @param {{ tier?: string, style?: string, has_logo?: string }} filters
 */
export function getFilteredTemplatesCatalog(filters) {
  const catalog = getExpandedTemplatesCatalog();
  if (!catalog) return null;
  let list = catalog;
  if (filters.tier) list = list.filter((t) => t.tier === filters.tier);
  if (filters.style) {
    list = list.filter((t) => (t.style_tags || [t.style]).includes(filters.style));
  }
  if (filters.has_logo === 'true') list = list.filter((t) => t.has_logo);
  if (filters.has_logo === 'false') list = list.filter((t) => !t.has_logo);
  return list;
}

export function findCatalogTemplateById(id) {
  const catalog = getExpandedTemplatesCatalog();
  if (!catalog || id == null) return null;
  const s = String(id);
  return catalog.find((t) => t.id === s) || null;
}
