/** UTF-8 → base64 for POST /api/generate-signature (avoids WAF mangling HTML in JSON). */
export function signatureExportRequestBody(html) {
  const s = String(html ?? '').trim();
  if (!s) return { html: '' };
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return { htmlB64: btoa(binary) };
}
