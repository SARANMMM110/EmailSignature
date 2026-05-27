/**
 * Extract HTML for Puppeteer export from POST /api/generate-signature JSON body.
 * Accepts plain `html` or base64 `htmlB64`.
 */
export function htmlFromGenerateSignatureBody(body) {
  const b64 = body?.htmlB64;
  if (typeof b64 === 'string' && b64.trim()) {
    try {
      return Buffer.from(b64.trim(), 'base64').toString('utf8').trim();
    } catch {
      return '';
    }
  }
  return typeof body?.html === 'string' ? body.html.trim() : '';
}

/**
 * Parse raw request bytes before global `express.json()` runs.
 * Handles text/html, base64 text/plain (WAF-safe), and WAF-mangled JSON.
 */
export function htmlFromRawGenerateSignatureRequest(buf, contentType, encodingHeader) {
  const raw = Buffer.isBuffer(buf) ? buf.toString('utf8') : String(buf || '');
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const ct = String(contentType || '').toLowerCase();
  const enc = String(encodingHeader || '').toLowerCase();

  if (ct.includes('text/plain') && (enc === 'base64' || /^[A-Za-z0-9+/=\s]+$/.test(trimmed))) {
    try {
      const b64 = trimmed.replace(/\s+/g, '');
      return Buffer.from(b64, 'base64').toString('utf8').trim();
    } catch {
      return '';
    }
  }

  if (ct.includes('text/html')) {
    return trimmed;
  }

  // WAF often strips `"` from JSON: {"html":"<table>..."} → {html:<table>...}
  const wafHtml = /^\{\s*html\s*:(.+)\}\s*$/s.exec(trimmed);
  if (wafHtml) return wafHtml[1].trim();

  const wafB64 = /^\{\s*htmlB64\s*:\s*([A-Za-z0-9+/=]+)\s*\}\s*$/s.exec(trimmed);
  if (wafB64) {
    try {
      return Buffer.from(wafB64[1], 'base64').toString('utf8').trim();
    } catch {
      return '';
    }
  }

  if (trimmed.startsWith('<')) return trimmed;

  try {
    const parsed = JSON.parse(trimmed);
    return htmlFromGenerateSignatureBody(parsed);
  } catch {
    return '';
  }
}
