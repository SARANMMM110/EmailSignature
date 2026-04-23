import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { supabaseAdmin, getStorageBucket } from '../services/supabase.js';
import { buildEmaileeTableHtml } from '../lib/emaileeHtml.js';
import { getPlan, normalizePlanId } from '../data/plans.js';
import { requireFeature } from '../middleware/planGate.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
/** Multer ceiling; per-plan limits enforced in `enforcePlanUploadBytes` after auth. */
const MAX_SIZE = 28 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  },
});

const router = Router();

async function enforcePlanUploadBytes(req, res, next) {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ message: 'Storage not configured' });
    }
    if (!req.file) return next();
    const { data, error } = await supabaseAdmin.from('profiles').select('plan').eq('id', req.user.id).maybeSingle();
    if (error) {
      const err = new Error(error.message || 'Could not load profile');
      err.statusCode = 400;
      return next(err);
    }
    const plan = getPlan(data?.plan);
    const maxB = plan.limits.media_upload_limit_mb * 1024 * 1024;
    if (req.file.size > maxB) {
      return res.status(413).json({
        error: 'FILE_TOO_LARGE',
        max_mb: plan.limits.media_upload_limit_mb,
        plan: normalizePlanId(data?.plan),
        message: `File exceeds ${plan.limits.media_upload_limit_mb}MB limit for the ${plan.name} plan.`,
      });
    }
    return next();
  } catch (e) {
    return next(e);
  }
}

async function uploadBuffer(path, buffer, contentType) {
  const bucket = getStorageBucket();
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    const err = new Error(error.message || 'Upload failed');
    err.statusCode = 500;
    throw err;
  }
  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  if (!pub?.publicUrl) {
    const err = new Error('Could not resolve public URL');
    err.statusCode = 500;
    throw err;
  }
  return pub.publicUrl;
}

router.post('/photo', upload.single('image'), enforcePlanUploadBytes, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ message: 'Storage not configured' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Missing image field (multipart file)' });
    }
    const buf = await sharp(req.file.buffer)
      .rotate()
      .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const name = `${randomUUID()}.png`;
    const path = `photos/${req.user.id}/${name}`;
    const url = await uploadBuffer(path, buf, 'image/png');
    res.json({ url });
  } catch (e) {
    next(e);
  }
});

router.post('/logo', upload.single('image'), enforcePlanUploadBytes, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ message: 'Storage not configured' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Missing image field (multipart file)' });
    }
    const buf = await sharp(req.file.buffer)
      .rotate()
      .resize(400, 200, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
    const name = `${randomUUID()}.png`;
    const path = `logos/${req.user.id}/${name}`;
    const url = await uploadBuffer(path, buf, 'image/png');
    res.json({ url });
  } catch (e) {
    next(e);
  }
});

/**
 * CTA / banner images.
 * Default: full strip 720×~93 JPEG (`cover`) for blank strip & wide banner backgrounds.
 * `?mode=mark`: logo / icon — fit inside 400×400 (`inside`, no strip crop).
 * `?mode=scene`: wide hero / illustration — fit inside 560×200 (`inside`).
 */
router.post('/banner-image', upload.single('image'), enforcePlanUploadBytes, async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ message: 'Storage not configured' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Missing image field (multipart file)' });
    }
    const mode = String(req.query.mode || 'strip').toLowerCase();

    if (mode === 'mark') {
      const MARK_MAX = 400;
      const buf = await sharp(req.file.buffer)
        .rotate()
        .resize(MARK_MAX, MARK_MAX, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer();
      const name = `${randomUUID()}.png`;
      const path = `banners/${req.user.id}/${name}`;
      const url = await uploadBuffer(path, buf, 'image/png');
      res.json({ url });
      return;
    }

    if (mode === 'scene') {
      const SCENE_W = 560;
      const SCENE_H = 200;
      const buf = await sharp(req.file.buffer)
        .rotate()
        .resize(SCENE_W, SCENE_H, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer();
      const name = `${randomUUID()}.png`;
      const path = `banners/${req.user.id}/${name}`;
      const url = await uploadBuffer(path, buf, 'image/png');
      res.json({ url });
      return;
    }

    /** Blank / CTA image canvas — matches engine blank strip ratio (`72/560` of width 720). */
    const BANNER_MAX_W = 720;
    const BANNER_MAX_H = Math.round((BANNER_MAX_W * 72) / 560);
    /** Fill the strip (center crop); avoids letterboxed “postage stamp” in the banner preview. */
    const buf = await sharp(req.file.buffer)
      .rotate()
      .resize(BANNER_MAX_W, BANNER_MAX_H, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    const name = `${randomUUID()}.jpg`;
    const path = `banners/${req.user.id}/${name}`;
    const url = await uploadBuffer(path, buf, 'image/jpeg');
    res.json({ url });
  } catch (e) {
    next(e);
  }
});

const emaileeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/png') cb(null, true);
    else cb(new Error('Only PNG is allowed for Emailee export'), false);
  },
});

/**
 * Upload rendered signature (and optional banner) PNGs → public URLs + Emailee-shaped HTML
 * (same pattern as Emailee’s hosted &lt;table&gt;&lt;img&gt; paste block).
 */
router.post(
  '/emailee-export',
  requireFeature('hosted_png_image_url_flow'),
  emaileeUpload.fields([
    { name: 'signature', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({ message: 'Storage not configured' });
      }
      const sig = req.files?.signature?.[0];
      if (!sig?.buffer?.length) {
        return res.status(400).json({ message: 'Missing signature PNG (multipart field "signature")' });
      }

      const uid = req.user.id;
      const ts = Date.now();
      const sigPath = `exports/${uid}/sig-${ts}-${randomUUID().slice(0, 8)}.png`;
      const sigBuf = await sharp(sig.buffer).png({ compressionLevel: 9 }).toBuffer();
      const signatureUrl = await uploadBuffer(sigPath, sigBuf, 'image/png');

      let bannerUrl = null;
      const ban = req.files?.banner?.[0];
      if (ban?.buffer?.length) {
        const banPath = `exports/${uid}/banner-${ts}-${randomUUID().slice(0, 8)}.png`;
        const banBuf = await sharp(ban.buffer).png({ compressionLevel: 9 }).toBuffer();
        bannerUrl = await uploadBuffer(banPath, banBuf, 'image/png');
      }

      const rows = bannerUrl
        ? [
            { src: signatureUrl, alt: 'My signature' },
            { src: bannerUrl, alt: 'my banner' },
          ]
        : [{ src: signatureUrl, alt: 'My signature' }];

      const emaileeHtml = buildEmaileeTableHtml(rows);
      res.json({ signatureUrl, bannerUrl, emaileeHtml });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
