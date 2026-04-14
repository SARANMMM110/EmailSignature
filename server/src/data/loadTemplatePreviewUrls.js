import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'templatePreviewUrls.json');

let cache = null;
let cacheMtime = null;

/**
 * Default gallery / signature-image URLs (served from the client app as static files).
 * Files live in `client/public/template-previews/` — built from repo `image templates/`.
 */
const DEFAULT_TEMPLATE_PREVIEW_PATHS = {
  template_1: '/template-previews/template_1.svg',
  template_2: '/template-previews/template_2.png',
  template_4:
    'https://static.codia.ai/s/image_caba0333-a82b-443e-9903-6458245ac81f.png',
  template_5: '/template-previews/template_5.png',
  template_6: '/template-previews/template_6.png',
};

function readFromDisk() {
  try {
    if (!fs.existsSync(JSON_PATH)) return {};
    const stat = fs.statSync(JSON_PATH);
    if (cache && cacheMtime === stat.mtimeMs) return cache;
    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    cache = typeof parsed === 'object' && parsed !== null ? parsed : {};
    cacheMtime = stat.mtimeMs;
    return cache;
  } catch {
    return {};
  }
}

/**
 * Public URL for a layout engine slug (`template_1` … `template_8`).
 * Optional `templatePreviewUrls.json` overrides (HTTPS or root-relative `/...`).
 */
export function getTemplatePreviewUrl(templateSlug) {
  if (templateSlug == null || templateSlug === '') return null;
  const key = String(templateSlug).trim().toLowerCase();
  const fromJson = readFromDisk()[key];
  if (typeof fromJson === 'string' && fromJson.trim()) {
    const t = fromJson.trim();
    if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')) return t;
  }
  return DEFAULT_TEMPLATE_PREVIEW_PATHS[key] || null;
}
