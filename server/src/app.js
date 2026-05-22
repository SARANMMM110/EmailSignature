import express, { Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import { requireAdminJwt } from './middleware/requireAdminJwt.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import publicRegistrationLinks from './routes/publicRegistrationLinks.js';
import meRoutes from './routes/me.js';
import adminRoutes from './routes/admin.js';
import agencyRoutes, { agencyAdminRouter } from './routes/agency.js';
import { ensureAdminCredentials } from './services/adminCredentials.js';
import signaturesRoutes from './routes/signatures.js';
import templatesRoutes from './routes/templates.js';
import palettesRoutes from './routes/palettes.js';
import bannersRoutes from './routes/banners.js';
import uploadRoutes from './routes/upload.js';
import htmlRoutes from './routes/html.js';
import {
  attachGenerateSignatureHtml,
  generateSignaturePost,
  generateSignatureRawParser,
} from './routes/generateSignature.js';
import { optionalAuth } from './middleware/optionalAuth.js';
import landingPreviewRoutes from './routes/landingPreview.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
/** Local Vite dev is often opened as localhost or 127.0.0.1 — allow both so /api/html/generate works. */
const devEditorOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? clientUrl
        : (origin, cb) => {
            if (!origin) return cb(null, true);
            if (devEditorOrigins.includes(origin)) return cb(null, true);
            cb(null, false);
          },
    credentials: true,
  })
);
/** PNG export — raw body parser BEFORE global JSON (WAF may strip JSON quotes from HTML payloads). */
app.post(
  '/api/generate-signature',
  generateSignatureRawParser,
  attachGenerateSignatureHtml,
  optionalAuth,
  generateSignaturePost
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/** Invalid JSON (e.g. `{html:<table>...}` without quotes) — return 400 JSON, not an opaque 500. */
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    const preview = String(err.body || '')
      .trim()
      .slice(0, 120);
    console.error('[api] Invalid JSON body', { method: req.method, path: req.path, preview });
    return res.status(400).json({
      error: 'INVALID_JSON_BODY',
      message:
        'Request body must be valid JSON with quoted keys and string values, e.g. {"html":"<table>...</table>"} or {"htmlB64":"..."}.',
      ...(preview ? { receivedPreview: preview } : {}),
    });
  }
  next(err);
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

/** Same payload as `/health` — handy when nginx only reverse-proxies `/api/` to Node. */
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

/** Puppeteer exports — must match generateSignature.js write path */
app.use('/signatures', express.static(path.join(PUBLIC_DIR, 'signatures'), { maxAge: '1d' }));

app.use('/api/auth', authRoutes);
app.use('/api/public/registration-links', publicRegistrationLinks);
app.use('/api/me', requireAuth, meRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
const adminApi = Router();
adminApi.use(requireAdminJwt);
adminApi.use(adminRoutes);
adminApi.use(agencyAdminRouter);
app.use('/api/admin', adminApi);
app.use('/api/agency', agencyRoutes);
app.use('/api/landing', landingPreviewRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/palettes', palettesRoutes);
app.use('/api/banners', bannersRoutes);

app.use('/api/html', requireAuth, htmlRoutes);
app.use('/api/signatures', requireAuth, signaturesRoutes);
app.use('/api/upload', requireAuth, uploadRoutes);

app.use(errorHandler);

ensureAdminCredentials()
  .catch((e) => console.warn('[admin] ensureAdminCredentials:', e?.message || e))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  });
