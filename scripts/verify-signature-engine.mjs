#!/usr/bin/env node
/**
 * Phase 6 — lightweight verification (expand toward full template × palette matrix).
 * Run: node scripts/verify-signature-engine.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tplPath = path.join(root, 'server', 'src', 'templates', 'signatureTemplates.js');
const galleryPath = path.join(root, 'client', 'src', 'data', 'galleryPalettes.js');

let checks = 0;
let failed = 0;

function ok(name, condition, detail = '') {
  checks += 1;
  if (!condition) {
    failed += 1;
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    console.log(`OK: ${name}`);
  }
}

const tplSrc = readFileSync(tplPath, 'utf8');
ok('signatureTemplates.js readable', tplSrc.length > 500);
const templateKeys = [...tplSrc.matchAll(/\btemplate_\d+\s*:/g)].map((m) => m[0].replace(/\s*:/, ''));
const uniqueTpl = [...new Set(templateKeys)];
ok('At least one template_* definition', uniqueTpl.length >= 1, `found: ${uniqueTpl.join(', ')}`);

ok('Handlebars conditionals present', /\{\{#if/.test(tplSrc));
ok('role="presentation" tables', /role\s*=\s*["']presentation["']/i.test(tplSrc));

let paletteCount = 0;
try {
  const gal = readFileSync(galleryPath, 'utf8');
  const m = gal.match(/export const GALLERY_PALETTES\s*=\s*\[/);
  ok('GALLERY_PALETTES export exists', Boolean(m));
  paletteCount = (gal.match(/\{\s*id:\s*['"]/g) || []).length;
  ok('Gallery palettes array has entries', paletteCount >= 1, `~${paletteCount} objects`);
} catch {
  ok('galleryPalettes readable', false, 'missing file');
}

const combo = uniqueTpl.length * Math.max(paletteCount, 1);
console.log('\n--- Summary ---');
console.log(`Checks: ${checks}, failed: ${failed}`);
console.log(`Template keys in file (rough): ${uniqueTpl.length}; palettes (rough): ${paletteCount}; product: ${combo}`);
console.log('Target 8 templates × 3+ palettes = 24+ combinations — extend this script as templates grow.\n');

process.exit(failed > 0 ? 1 : 0);
