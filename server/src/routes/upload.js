import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { supabaseAdmin, getStorageBucket } from '../services/supabase.js';
import { buildEmaileeTableHtml } from '../lib/emaileeHtml.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  },
});

const router = Router();

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

router.post('/photo', upload.single('image'), async (req, res, next) => {
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
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    const name = `${randomUUID()}.jpg`;
    const path = `photos/${req.user.id}/${name}`;
    const url = await uploadBuffer(path, buf, 'image/jpeg');
    res.json({ url });
  } catch (e) {
    next(e);
  }
});

router.post('/logo', upload.single('image'), async (req, res, next) => {
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

const emaileeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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
