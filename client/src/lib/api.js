import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';
import { useUpgradeModalStore } from '../store/upgradeModalStore.js';
import { supabase, isSupabaseConfigured } from './supabase.js';

const GET_SESSION_TIMEOUT_MS = 8000;

async function resolveAccessToken() {
  if (isSupabaseConfigured && supabase) {
    let token =
      useAuthStore.getState().session?.access_token ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('sb-access-token') : null);
    if (token) return token;
    try {
      const { data } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timed out')), GET_SESSION_TIMEOUT_MS)
        ),
      ]);
      return data?.session?.access_token ?? null;
    } catch (e) {
      console.warn('[api] getSession failed; using any cached token', e?.message || e);
      return typeof localStorage !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
    }
  }
  return typeof localStorage !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
}

/**
 * In Vite dev, default to same-origin `/api` so the dev-server proxy forwards to the API.
 * That avoids CORS when the app is opened as `127.0.0.1` while CLIENT_URL is `localhost` (or vice versa).
 * Set VITE_API_URL to the API **site origin** only, e.g. `https://api.example.com` or `https://example.com`
 * if the Express app serves `/api/*` on the same host. Do **not** append `/api` here — we add it once below.
 * (If you already used `…/api` in Vercel, we strip a single trailing `/api` so you do not get `/api/api/…`.)
 */
const viteApi = import.meta.env.VITE_API_URL?.toString().trim();
if (import.meta.env.PROD && !viteApi) {
  console.error(
    '[api] Missing VITE_API_URL. In Vercel → Settings → Environment Variables, add VITE_API_URL=https://your-deployed-api.example (no trailing slash), apply to Production, then Redeploy. Otherwise requests default to http://localhost:3001 and the browser blocks them.'
  );
}

/** HTTPS origin only — no path, no trailing `/api` (avoids `…/api/api` when env was pasted with `/api`). */
function normalizeApiSiteOrigin(raw) {
  const s = String(raw || '')
    .trim()
    .replace(/\/+$/, '');
  if (!s) return '';
  return s.replace(/\/api$/i, '');
}

const apiSiteOrigin =
  import.meta.env.DEV && !viteApi
    ? ''
    : normalizeApiSiteOrigin(viteApi || 'http://localhost:3001');

/** Same-origin `/api/` in Vite dev; otherwise `https://host/api/` (trailing slash helps URL resolution). */
const apiBaseURL =
  import.meta.env.DEV && !viteApi ? '/api/' : `${apiSiteOrigin.replace(/\/+$/, '')}/api/`;

/** Absolute API origin (no `/api` suffix) for unauthenticated `fetch` calls. */
export function getApiOrigin() {
  return (
    apiSiteOrigin || (typeof window !== 'undefined' ? window.location.origin : '')
  );
}

export const api = axios.create({
  baseURL: apiBaseURL,
  /** Safer URL joining with `baseURL` + paths that start with `/`. */
  allowAbsoluteUrls: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

/**
 * Paths like `/signatures` are resolved from the site root (→ 404 on static `/signatures`).
 * Always use paths relative to `baseURL` (`…/api/`) — strip a single leading `/` here as a safety net.
 */
api.interceptors.request.use((config) => {
  const u = config.url;
  if (typeof u === 'string' && u.startsWith('/') && !u.startsWith('//')) {
    config.url = u.replace(/^\/+/, '');
  }
  return config;
});

api.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const token = await resolveAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const reqUrl = err.config?.url || '';
    const isPublicLandingPreview =
      typeof reqUrl === 'string' &&
      (reqUrl.includes('landing/') || reqUrl.includes('/landing/'));
    const isPublicApi =
      typeof reqUrl === 'string' && (reqUrl.includes('public/') || reqUrl.includes('/public/'));
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const onAdminLogin = path === '/admin/login';
    const onMainLogin = path === '/login' || path === '/signup';
    if (status === 401 && !isPublicLandingPreview && !isPublicApi && !onAdminLogin && !onMainLogin) {
      const dest = path.startsWith('/admin') ? '/admin/login' : '/login';
      window.location.assign(dest);
    }
    if (status === 403 && data?.error === 'PLAN_FEATURE_REQUIRED') {
      useUpgradeModalStore.getState().showUpgradeModal({
        feature: data.feature,
        requiredPlan: data.required_plan,
        message: data.message,
      });
    }
    if (status === 403 && data?.error === 'PLAN_LIMIT_REACHED') {
      useUpgradeModalStore.getState().showUpgradeModal({
        feature: data.limit || data.feature,
        requiredPlan: data.required_plan,
        message: data.message,
      });
    }
    if (status === 413 && data?.error === 'FILE_TOO_LARGE') {
      useUpgradeModalStore.getState().showUpgradeModal({
        feature: 'media_upload_limit_mb',
        message: data.message,
      });
    }
    // if (status === 403 && data?.error === 'UPGRADE_REQUIRED') {
    //   window.dispatchEvent(
    //     new CustomEvent('signature-builder:upgrade-required', { detail: data })
    //   );
    // }
    return Promise.reject(err);
  }
);

export const signaturesAPI = {
  getAll: () => api.get('signatures'),
  getById: (id) => api.get(`signatures/${id}`),
  create: (data) => api.post('signatures', data),
  update: (id, data) => api.put(`signatures/${id}`, data),
  delete: (id) => api.delete(`signatures/${id}`),
  copy: (id) => api.post(`signatures/${id}/copy`),
  duplicate: (id) => api.post(`signatures/${id}/duplicate`),
};

export const templatesAPI = {
  getAll: (params) => api.get('templates', { params }),
  getById: (id) => api.get(`templates/${id}`),
};

export const palettesAPI = {
  getSystem: () => api.get('palettes/system'),
  getUser: () => api.get('palettes/user'),
  create: (data) => api.post('palettes/user', data),
  delete: (id) => api.delete(`palettes/user/${id}`),
};

export const bannersAPI = {
  getAll: (params) => api.get('banners', { params }),
};

/** Preview / playground — same auth as other API routes. */
export const htmlAPI = {
  generate: (body) => api.post('html/generate', body),
};

/** Marketing site — public; uses same HTML engine as the editor (no session required). */
export const landingPreviewAPI = {
  signatureHtmlBatch: (body) => api.post('landing/signature-html-batch', body),
};

/** Validate a signup ref without sending a Bearer token (avoids 401 redirect). */
export async function getPublicRegistrationLinkPreview(code) {
  const origin = getApiOrigin();
  const res = await fetch(`${origin}/api/public/registration-links/${encodeURIComponent(code)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { valid: false, ...data };
  return data;
}

/** Puppeteer PNG export — public route; returns { url, base64?, dataUrl? } */
export const signatureExportAPI = {
  generateImage: (html) => api.post('generate-signature', { html }),
};

export const uploadAPI = {
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('upload/photo', form);
  },
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('upload/logo', form);
  },
  /** Resized on server to 720×93 JPEG (`cover`, center) so the strip is always filled edge-to-edge. */
  uploadBannerImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('upload/banner-image', form);
  },
  /** Upload rendered signature (+ optional banner) PNGs; returns public URLs and Emailee-style HTML. */
  emaileeExport: (signatureBlob, bannerBlob = null) => {
    const form = new FormData();
    form.append('signature', signatureBlob, 'signature.png');
    if (bannerBlob) form.append('banner', bannerBlob, 'banner.png');
    return api.post('upload/emailee-export', form);
  },
};

export default api;
