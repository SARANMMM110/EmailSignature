/**
 * Vite injects `import.meta.env`. Kept local to avoid circular imports with api.js.
 */
function viteMetaEnv() {
  try {
    const e = import.meta?.env;
    if (e && typeof e === 'object') return e;
  } catch {
    /* ignore */
  }
  return { DEV: true, PROD: false, VITE_API_URL: undefined };
}

const env = viteMetaEnv();
const viteApi = String(env.VITE_API_URL ?? '')
  .trim()
  .replace(/\/api$/i, '')
  .replace(/\/+$/, '');

/** Same-origin `/api/generate-signature` in dev + typical prod; absolute origin when cross-origin API is configured. */
export function generateSignaturePostUrl() {
  if (typeof window === 'undefined') return '/api/generate-signature';
  if (env.DEV && !viteApi) return '/api/generate-signature';
  if (env.PROD) return `${window.location.origin.replace(/\/$/, '')}/api/generate-signature`;
  if (viteApi && /^https?:\/\//i.test(viteApi)) {
    return `${viteApi}/api/generate-signature`;
  }
  return `${window.location.origin.replace(/\/$/, '')}/api/generate-signature`;
}

/** POST raw HTML via fetch (not axios) so default `application/json` cannot override Content-Type. */
export async function postGenerateSignature(html, { accessToken } = {}) {
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    Accept: 'application/json',
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(generateSignaturePostUrl(), {
    method: 'POST',
    headers,
    body: String(html ?? ''),
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data.message || data.error || `Request failed with status code ${res.status}`
    );
    err.response = { status: res.status, data };
    throw err;
  }
  return { data };
}
