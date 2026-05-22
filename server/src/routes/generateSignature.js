/**
 * POST /api/generate-signature — render HTML to PNG via Puppeteer, upload to Supabase Storage when
 * configured (public HTTPS URL for email clients), else save under /public/signatures.
 * Authenticated users need `copy_html_to_clipboard` (Personal+). Plan flag `png_rich_clipboard_render` matches Personal+ for client gates.
 *
 * Mounted in app.js **before** `express.json()` so WAF-mangled JSON bodies are not rejected by body-parser.
 */
import express from 'express';
import puppeteer from 'puppeteer';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { htmlFromRawGenerateSignatureRequest } from '../lib/parseSignatureExportBody.js';
import { uploadGeneratedSignaturePng } from '../services/signatureExportStorage.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { supabaseAdmin } from '../services/supabase.js';
import { PLANS, normalizePlanId, minPlanForFeature } from '../data/plans.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** server/public/signatures — served at GET /signatures/:file */
const PUBLIC_ROOT = path.join(__dirname, '..', '..', 'public');
const SIGNATURES_DIR = path.join(PUBLIC_ROOT, 'signatures');

/** One Chrome process shared across exports; serial queue avoids OOM from parallel launches. */
let sharedBrowser = null;
let browserLaunchPromise = null;
let renderQueue = Promise.resolve();

async function acquireSharedBrowser() {
  if (sharedBrowser?.isConnected?.()) return sharedBrowser;
  if (browserLaunchPromise) return browserLaunchPromise;
  const executablePath = resolvePuppeteerExecutablePath();
  browserLaunchPromise = puppeteer
    .launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
    .then((browser) => {
      sharedBrowser = browser;
      browserLaunchPromise = null;
      browser.on('disconnected', () => {
        sharedBrowser = null;
      });
      return browser;
    })
    .catch((e) => {
      browserLaunchPromise = null;
      throw e;
    });
  return browserLaunchPromise;
}

function withRenderLock(fn) {
  const run = renderQueue.then(fn, fn);
  renderQueue = run.catch(() => {});
  return run;
}

/** Read raw body (must run before global JSON parser). */
export const generateSignatureRawParser = express.raw({ type: '*/*', limit: '2mb' });

export function attachGenerateSignatureHtml(req, _res, next) {
  req.signatureExportHtml = htmlFromRawGenerateSignatureRequest(
    req.body,
    req.headers['content-type']
  );
  const ct = String(req.headers['content-type'] || '').slice(0, 80);
  const len = Buffer.isBuffer(req.body) ? req.body.length : 0;
  console.log('[generate-signature] request', {
    contentType: ct,
    bytes: len,
    htmlChars: req.signatureExportHtml?.length || 0,
    hasAuth: Boolean(req.headers.authorization),
  });
  next();
}

/**
 * Resolve which Chrome/Chromium binary to pass to `puppeteer.launch`.
 * If `PUPPETEER_EXECUTABLE_PATH` points at a missing file, it is **removed from `process.env`** so Puppeteer
 * does not still read it internally (which would cause "no executable was found" even when we omit `executablePath`).
 */
function resolvePuppeteerExecutablePath() {
  const fromEnv = String(process.env.PUPPETEER_EXECUTABLE_PATH || '').trim();
  if (fromEnv) {
    if (existsSync(fromEnv)) return fromEnv;
    delete process.env.PUPPETEER_EXECUTABLE_PATH;
    console.warn(
      `[generate-signature] PUPPETEER_EXECUTABLE_PATH="${fromEnv}" not found — removed from env. Using Puppeteer bundled browser (or unset CHROME path). Fix or remove this variable in your host / Docker / PM2 config.`
    );
  }
  const fallbacks = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of fallbacks) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

function wrapDocument(fragmentHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      height: auto !important;
      min-height: 0 !important;
    }
    /* Tight shrink-wrap — avoids fullPage capturing viewport/scroll dead space under the card */
    #sig-export-root {
      display: inline-block;
      vertical-align: top;
      line-height: normal;
      margin: 0;
      padding: 0;
      width: max-content;
      max-width: 100%;
      overflow: visible;
    }
  </style>
</head>
<body><div id="sig-export-root">${fragmentHtml}</div></body>
</html>`;
}

export async function generateSignaturePost(req, res, next) {
  try {
    const html = String(req.signatureExportHtml || '').trim();
    if (!html) {
      const ct = String(req.headers['content-type'] || '').slice(0, 80);
      const preview = Buffer.isBuffer(req.body)
        ? req.body.toString('utf8').trim().slice(0, 120)
        : '';
      console.warn('[generate-signature] Missing HTML', { contentType: ct, preview });
      return res.status(400).json({
        error: 'MISSING_HTML',
        message:
          'POST signature HTML as Content-Type text/html, or JSON {"html":"..."} / {"htmlB64":"..."}.',
      });
    }

    if (req.user && supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('plan')
          .eq('id', req.user.id)
          .maybeSingle();
        const pid = normalizePlanId(data?.plan);
        const plan = PLANS[pid] || PLANS.personal;
        if (!plan.features.copy_html_to_clipboard) {
          return res.status(403).json({
            error: 'PLAN_FEATURE_REQUIRED',
            feature: 'copy_html_to_clipboard',
            current_plan: pid,
            required_plan: minPlanForFeature('copy_html_to_clipboard'),
            message: 'Signature image export requires a plan that includes copy HTML to clipboard.',
          });
        }
      } catch (planErr) {
        console.warn('[generate-signature] plan check skipped:', planErr?.message || planErr);
      }
    }

    const port = Number(process.env.PORT) || 3001;
    const publicBase = String(process.env.PUBLIC_BASE_URL || `http://localhost:${port}`).replace(
      /\/$/,
      ''
    );

    const png = await withRenderLock(async () => {
      const browser = await acquireSharedBrowser();
      const page = await browser.newPage();
      try {
        await page.setViewport({
          width: 720,
          height: 480,
          deviceScaleFactor: 2,
        });

        await page.setContent(wrapDocument(html), {
          waitUntil: 'load',
          timeout: 45_000,
        });

        await new Promise((r) => setTimeout(r, 800));

        const root = await page.$('#sig-export-root');
        let buf;
        if (root) {
          try {
            buf = await root.screenshot({
              type: 'png',
              omitBackground: false,
              captureBeyondViewport: true,
            });
          } catch {
            buf = await root.screenshot({ type: 'png', omitBackground: false });
          }
          await root.dispose();
        }
        if (!buf?.length) {
          const box = await page.evaluate(() => {
            const el = document.getElementById('sig-export-root');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
              x: Math.max(0, Math.floor(r.left)),
              y: Math.max(0, Math.floor(r.top)),
              width: Math.min(Math.ceil(r.width), 4096),
              height: Math.min(Math.ceil(r.height), 4096),
            };
          });
          if (box && box.width > 0 && box.height > 0) {
            buf = await page.screenshot({
              type: 'png',
              clip: box,
              omitBackground: false,
            });
          } else {
            buf = await page.screenshot({ type: 'png', omitBackground: false });
          }
        }
        return buf;
      } finally {
        await page.close().catch(() => {});
      }
    });

    const fileName = `signature-${randomUUID()}.png`;
    const base64 = Buffer.from(png).toString('base64');

      const uploaded = await uploadGeneratedSignaturePng(png, fileName);
      let url;
      let storage = 'local';

      if (uploaded.ok) {
        url = uploaded.publicUrl;
        storage = 'supabase';
      } else {
        await fs.mkdir(SIGNATURES_DIR, { recursive: true });
        const filePath = path.join(SIGNATURES_DIR, fileName);
        await fs.writeFile(filePath, png);
        url = `${publicBase}/signatures/${fileName}`;
      }

      return res.json({
        url,
        mime: 'image/png',
        base64,
        dataUrl: `data:image/png;base64,${base64}`,
        storage,
      });
  } catch (e) {
    console.error('[generate-signature] render failed:', e?.message || e);
    if (e?.message?.includes('Could not find Chrome') || e?.message?.includes('Failed to launch')) {
      return res.status(503).json({
        error: 'PUPPETEER_UNAVAILABLE',
        message:
          'PNG export browser is not available on the server. Install Chromium/Puppeteer OS dependencies (see server/.env.example).',
      });
    }
    next(e);
  }
}
