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
      const html = await generateSignatureHtml(
        {
          templateId: req.body.templateId,
          form: req.body.form,
          palette: req.body.palette,
          design: req.body.design,
          banner: req.body.banner,
        },
        { forPaste }
      );
      res.json({ html });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
