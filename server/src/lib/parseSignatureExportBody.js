/**
 * Extract HTML for Puppeteer export from POST /api/generate-signature JSON body.
 * Accepts plain `html` or base64 `htmlB64` (client default — fewer WAF false positives).
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
