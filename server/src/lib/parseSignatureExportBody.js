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
 * Handles text/html bodies and WAF-mangled JSON (`{html:<table>...}` with quotes stripped).
 */
export function htmlFromRawGenerateSignatureRequest(buf, contentType) {
  const raw = Buffer.isBuffer(buf) ? buf.toString('utf8') : String(buf || '');
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const ct = String(contentType || '').toLowerCase();

  if (ct.includes('text/html') || ct.includes('text/plain')) {
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
