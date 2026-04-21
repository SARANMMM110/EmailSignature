import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { generateSignatureHtml } from '../services/htmlGenerator.js';
import { resolveTemplateKey, TEMPLATE_META } from '../templates/signatureTemplates.js';

const router = Router();

const ALLOWED = new Set(Object.keys(TEMPLATE_META));
const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function normalizePalette(input) {
  if (!input || typeof input !== 'object') return { ok: undefined };
  const out = {};
  for (const k of ['primary', 'secondary', 'accent', 'text']) {
    const v = String(input[k] ?? '').trim();
    if (!HEX.test(v)) return { error: `Invalid or missing palette.${k} (expected #RGB or #RRGGBB)` };
    out[k] = v;
  }
  return { ok: out };
}

/** Matches client gallery / editor starter font stack. */
const DEMO_DESIGN_FONT =
  "'Montserrat', 'Poppins', 'Roboto', -apple-system, Helvetica, Arial, sans-serif";

function landingDemoPayload(templateKey, palette) {
  return {
    templateId: templateKey,
    design: { font: DEMO_DESIGN_FONT },
    form: {},
    ...(palette ? { palette } : {}),
  };
}

/**
 * Public, read-only HTML previews for the marketing site (no auth).
 * Uses the same {@link generateSignatureHtml} pipeline as the authenticated editor.
 */
router.post(
  '/signature-html-batch',
  body('templateIds').isArray({ min: 1, max: 24 }),
  body('templateIds.*').isString(),
  body('palette').optional().isObject(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid request', errors: errors.array() });
      }
      const { templateIds, palette: rawPalette } = req.body;
      const palNorm = rawPalette ? normalizePalette(rawPalette) : { ok: undefined };
      if (palNorm.error) {
        return res.status(400).json({ message: palNorm.error });
      }
      const palette = palNorm.ok;

      const htmlById = {};
      for (const rawId of templateIds) {
        const key = resolveTemplateKey(String(rawId));
        if (!ALLOWED.has(key)) {
          return res.status(400).json({ message: `Unsupported template: ${rawId}` });
        }
        htmlById[key] = await generateSignatureHtml(landingDemoPayload(key, palette));
      }
      res.json({ htmlById });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
