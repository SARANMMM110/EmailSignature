import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';
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
 * Set VITE_API_URL to override (e.g. point at a remote API).
 */
const viteApi = import.meta.env.VITE_API_URL?.toString().trim();
const base =
  import.meta.env.DEV && !viteApi
    ? ''
    : (viteApi || 'http://localhost:3001').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${base}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
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
    const isPublicLandingPreview = typeof reqUrl === 'string' && reqUrl.includes('/landing/');
    if (status === 401 && !isPublicLandingPreview && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
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
  getAll: () => api.get('/signatures'),
  getById: (id) => api.get(`/signatures/${id}`),
  create: (data) => api.post('/signatures', data),
  update: (id, data) => api.put(`/signatures/${id}`, data),
  delete: (id) => api.delete(`/signatures/${id}`),
  copy: (id) => api.post(`/signatures/${id}/copy`),
  duplicate: (id) => api.post(`/signatures/${id}/duplicate`),
};

export const templatesAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
};

export const palettesAPI = {
  getSystem: () => api.get('/palettes/system'),
  getUser: () => api.get('/palettes/user'),
  create: (data) => api.post('/palettes/user', data),
  delete: (id) => api.delete(`/palettes/user/${id}`),
};

export const bannersAPI = {
  getAll: (params) => api.get('/banners', { params }),
};

/** Preview / playground — same auth as other API routes. */
export const htmlAPI = {
  generate: (body) => api.post('/html/generate', body),
};

/** Marketing site — public; uses same HTML engine as the editor (no session required). */
export const landingPreviewAPI = {
  signatureHtmlBatch: (body) => api.post('/landing/signature-html-batch', body),
};

/** Puppeteer PNG export — public route; returns { url, base64?, dataUrl? } */
export const signatureExportAPI = {
  generateImage: (html) => api.post('/generate-signature', { html }),
};

export const uploadAPI = {
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/photo', form);
  },
  uploadLogo: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/logo', form);
  },
  /** Upload rendered signature (+ optional banner) PNGs; returns public URLs and Emailee-style HTML. */
  emaileeExport: (signatureBlob, bannerBlob = null) => {
    const form = new FormData();
    form.append('signature', signatureBlob, 'signature.png');
    if (bannerBlob) form.append('banner', bannerBlob, 'banner.png');
    return api.post('/upload/emailee-export', form);
  },
};

export default api;
