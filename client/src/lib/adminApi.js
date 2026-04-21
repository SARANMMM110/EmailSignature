import axios from 'axios';
import { getApiOrigin } from './api.js';

const TOKEN_KEY = 'sb-admin-jwt';

const origin = getApiOrigin();

export const adminApi = axios.create({
  baseURL: `${origin}/api/admin`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
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
