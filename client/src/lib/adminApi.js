import axios from 'axios';
import { getApiOrigin } from './api.js';

const TOKEN_KEY = 'sb-admin-jwt';

function resolveAdminBaseURL() {
  const origin = getApiOrigin().replace(/\/+$/, '');
  return origin ? `${origin}/api/admin` : '/api/admin';
}

export const adminApi = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

/** Resolve base URL per request so we never call `getApiOrigin()` during module init (avoids api ↔ adminApi cycles). */
adminApi.interceptors.request.use((config) => {
  config.baseURL = resolveAdminBaseURL();
  return config;
});

adminApi.interceptors.request.use((config) => {
  if (typeof sessionStorage !== 'undefined') {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
    }
  }
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err.response?.status;
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (status === 401) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(TOKEN_KEY);
      }
      if (!path.startsWith('/admin/login')) {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(err);
  }
);

export function setAdminToken(token) {
  if (typeof sessionStorage !== 'undefined' && token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function getAdminToken() {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

/** Admin panel — agency tier tokens and agencies (JWT via `adminApi`). */
export const adminAgencyAPI = {
  getTokens: () => adminApi.get('agency-tokens'),
  createToken: (data) => adminApi.post('agency-tokens', data),
  deactivateToken: (id) => adminApi.delete(`agency-tokens/${id}`),
  deleteTokenPermanent: (id) => adminApi.delete(`agency-tokens/${id}/permanent`),

  getAllAgencies: () => adminApi.get('agencies'),
  getAgency: (id) => adminApi.get(`agencies/${id}`),
  deactivateAgency: (id) => adminApi.patch(`agencies/${id}`, { is_active: false }),
};
