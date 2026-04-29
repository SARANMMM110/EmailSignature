import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { generateSignatureHtml } from '../services/htmlGenerator.js';

const router = Router();

router.post(
  '/generate',
  body('templateId').optional().isString(),
  body('form').optional().isObject(),
  body('palette').optional().isObject(),
  body('design').optional().isObject(),
  body('banner').optional({ nullable: true }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid payload', errors: errors.array() });
      }
      const forPaste =
        req.body.forPaste === true || req.body.forPaste === 'true' || req.body.forPaste === 1;
      const includePreviewSlots =
        req.body.includePreviewSlots === true ||
        req.body.includePreviewSlots === 'true' ||
        req.body.includePreviewSlots === 1;
      const fillDemoPlaceholders =
        req.body.fillDemoPlaceholders === true ||
        req.body.fillDemoPlaceholders === 'true' ||
        req.body.fillDemoPlaceholders === 1;
      const result = await generateSignatureHtml(
        {
          templateId: req.body.templateId,
          form: req.body.form,
          palette: req.body.palette,
          design: req.body.design,
          banner: req.body.banner,
        },
        { forPaste, includePreviewSlots, fillDemoPlaceholders }
      );
      if (includePreviewSlots && result && typeof result === 'object' && 'html' in result) {
        res.json({ html: result.html, previewSlots: result.previewSlots ?? null });
      } else {
        const html = typeof result === 'object' && result?.html != null ? result.html : result;
        res.json({ html });
      }
    } catch (e) {
      next(e);
    }
  }
);

export default router;
