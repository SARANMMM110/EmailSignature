/**
 * Gmail/Outlook paste helpers:
 * - Dual PNG export: two `<table><tr><td><img></td></tr></table>` + `<br>` so each block selects independently.
 * - “Copy to clipboard” writes **text/html only** (no `image/png` alongside) when paste HTML is available.
 * - When a hosted export URL exists, paste HTML uses **`<img src=…>`** tables, not the live layout fragment,
 *   so Gmail does not treat the signature as editable text or duplicate complex blocks.
 * - Clipboard tries **HTML MIME only** first (no paired `text/plain`), which avoids some Gmail double-inserts.
 */

import { recipientVisibleImageSrc } from './signatureImagePublicUrl.js';

function escapeAttrUrl(url) {
  return String(url || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** Same idea as server `httpUrlStringIsPlausible` — block prose / `%20` junk used as “URLs”. */
function hrefLooksPlausible(uStr) {
  try {
    const u = new URL(String(uStr || '').trim());
    let host = u.hostname;
    try {
      host = decodeURIComponent(host.replace(/\+/g, ' '));
    } catch {
      return false;
    }
    if (/[\s\r\n\t\u00a0<>"'`]/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export function normalizeSignatureHref(raw) {
  let u = String(raw || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return hrefLooksPlausible(u) ? u : '';
}

function oneImageTable(imgInner) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" contenteditable="false"><tr><td contenteditable="false" style="padding:0;margin:0;border:0;">${imgInner}</td></tr></table>`;
}

/**
 * Gmail-friendly: one `<table>…</table>` per block joined with `<br>` so each image (and its own `<a href>`)
 * pastes as a separate clickable region — signature + one or more CTA strips.
 *
 * @param {Array<{ imageUrl: string, linkUrl?: string }>} blocks
 */
export function buildStackedSignatureBannerPasteHtml(blocks) {
  const list = Array.isArray(blocks) ? blocks : [];
  const parts = [];
  for (const b of list) {
    const imageUrl = String(b?.imageUrl || '').trim();
    if (!imageUrl) continue;
    const linkUrl = normalizeSignatureHref(b?.linkUrl || '');
    const sigSrc = recipientVisibleImageSrc(imageUrl);
    const img = `<img src="${escapeAttrUrl(sigSrc)}" width="600" border="0" alt="" style="display:block;border:none;">`;
    const inner =
      linkUrl !== ''
        ? `<a href="${escapeAttrUrl(linkUrl)}" style="text-decoration:none;border:none;" target="_blank" rel="noopener noreferrer">${img}</a>`
        : img;
    parts.push(oneImageTable(inner));
  }
  return parts.join('<br>');
}

/**
 * Gmail-friendly: signature image table, `<br>`, CTA image table — no shared parent.
 */
export function buildDualImagePasteHtml(signatureImageUrl, bannerImageUrl, options = {}) {
  const { signatureLinkUrl = '', bannerLinkUrl = '' } = options;
  return buildStackedSignatureBannerPasteHtml([
    { imageUrl: signatureImageUrl, linkUrl: signatureLinkUrl },
    { imageUrl: bannerImageUrl, linkUrl: bannerLinkUrl },
  ]);
}

/**
 * Single composite export PNG in one table (+ optional link on the image).
 */
export function buildSignaturePasteHtml(imageUrl, signatureLinkUrl = '') {
  const src = String(imageUrl || '').trim();
  if (!src) {
    throw new Error('Missing image URL for signature paste HTML.');
  }
  const href = normalizeSignatureHref(signatureLinkUrl);
  const imgSrcForEmail = recipientVisibleImageSrc(src);
  const img = `<img src="${escapeAttrUrl(imgSrcForEmail)}" width="600" border="0" alt="" style="display:block;border:none;">`;
  const inner =
    href !== ''
      ? `<a href="${escapeAttrUrl(href)}" style="text-decoration:none;border:none;" target="_blank" rel="noopener noreferrer">${img}</a>`
      : img;
  return oneImageTable(inner);
}

/**
 * When `fetch(imageUrl)` fails (common with storage URLs that omit CORS for anonymous reads),
 * pasting HTML tables still works in Gmail/Outlook because the client loads images by URL.
 */
async function writeClipboardHtmlOnly(htmlString) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard is not available in this browser (use HTTPS or localhost).');
  }
  const html = String(htmlString || '').trim();
  if (!html) throw new Error('No HTML to copy.');
  const htmlBlob = new Blob([html], { type: 'text/html' });
  const plain = 'Email signature (HTML). Paste into your signature box with Ctrl+V or Cmd+V.';
  const plainBlob = new Blob([plain], { type: 'text/plain' });

  const tryHtmlOnly = async (usePromises) => {
    const item = usePromises
      ? new ClipboardItem({ 'text/html': Promise.resolve(htmlBlob) })
      : new ClipboardItem({ 'text/html': htmlBlob });
    await navigator.clipboard.write([item]);
  };
  const tryHtmlAndPlain = async (usePromises) => {
    const item = usePromises
      ? new ClipboardItem({
          'text/html': Promise.resolve(htmlBlob),
          'text/plain': Promise.resolve(plainBlob),
        })
      : new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': plainBlob,
        });
    await navigator.clipboard.write([item]);
  };

  for (const usePromises of [true, false]) {
    try {
      await tryHtmlOnly(usePromises);
      return;
    } catch {
      /* continue */
    }
  }
  for (const usePromises of [true, false]) {
    try {
      await tryHtmlAndPlain(usePromises);
      return;
    } catch {
      /* continue */
    }
  }
  throw new Error('Could not write HTML to the clipboard.');
}

async function fetchSignatureImageBlob(imageUrl) {
  const res = await fetch(String(imageUrl || '').trim(), {
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Could not fetch signature image (${res.status}).`);
  }
  let blob = await res.blob();
  if (!blob.type.startsWith('image/')) {
    blob = new Blob([await blob.arrayBuffer()], { type: 'image/png' });
  }
  return blob;
}

/**
 * @param {string} imageUrl — signature PNG (or composite when no banner export)
 * @param {{ signatureLinkUrl?: string, bannerImageUrl?: string, bannerLinkUrl?: string, fragmentHtml?: string, bannerSlotPairs?: { imageUrl: string, linkUrl?: string }[] }} [options]
 * @returns {Promise<{ success: true, linked: boolean, mode: 'html' | 'image' }>}
 */
export async function copySignatureImageToClipboard(imageUrl, options = {}) {
  const src = String(imageUrl || '').trim();
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard copy is not supported in this browser (use HTTPS or localhost).');
  }

  const bannerImg = String(options.bannerImageUrl || '').trim();
  const fragment = String(options.fragmentHtml || '').trim();
  const sigLink = normalizeSignatureHref(options.signatureLinkUrl);
  const banLink = normalizeSignatureHref(options.bannerLinkUrl);
  const slotPairs = Array.isArray(options.bannerSlotPairs)
    ? options.bannerSlotPairs.filter((p) => String(p?.imageUrl || '').trim())
    : [];

  let dualHtml = '';
  if (slotPairs.length > 0 && src) {
    dualHtml = buildStackedSignatureBannerPasteHtml([
      { imageUrl: src, linkUrl: sigLink },
      ...slotPairs.map((p) => ({
        imageUrl: String(p.imageUrl || '').trim(),
        linkUrl: normalizeSignatureHref(p.linkUrl || ''),
      })),
    ]);
  } else if (bannerImg && src) {
    dualHtml = buildDualImagePasteHtml(src, bannerImg, { signatureLinkUrl: sigLink, bannerLinkUrl: banLink });
  }

  // Prefer rasterized <img> paste when we have export URLs — full `fragment` is live HTML in Gmail
  // (editable text, spellcheck, and some clients duplicate complex blocks on paste).
  let htmlForMime = '';
  if (dualHtml) {
    htmlForMime = dualHtml;
  } else if (src) {
    htmlForMime = buildSignaturePasteHtml(src, sigLink);
  } else if (fragment) {
    htmlForMime = fragment;
  }

  if (String(htmlForMime || '').trim()) {
    await writeClipboardHtmlOnly(htmlForMime.trim());
    const anySlotLink = slotPairs.some((p) => normalizeSignatureHref(p?.linkUrl || ''));
    return { success: true, linked: Boolean(sigLink || banLink || anySlotLink), mode: 'html' };
  }

  if (!src) {
    throw new Error('No signature image URL — generate the export on the server first.');
  }

  try {
    const blob = await fetchSignatureImageBlob(src);
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return { success: true, linked: false, mode: 'image' };
  } catch (fetchErr) {
    console.warn('[signature-export] Image fetch failed (often CORS on storage):', fetchErr);
    throw new Error(
      'Could not read the signature PNG in this browser (often blocked when the image host does not allow cross-origin access). Use “Copy HTML code” instead, or open this app over HTTPS.'
    );
  }
}

/**
 * @param {string} imageUrl
 * @param {string} [signatureLinkUrl]
 * @param {string} [fragmentHtml] — full generated HTML when not using image snippet
 * @param {string} [bannerImageUrl]
 * @param {string} [bannerLinkUrl]
 * @param {Array<{ imageUrl: string, linkUrl?: string }>} [extraBannerSlots] — additional CTA PNGs + links (second strip, …)
 */
export async function copySignaturePasteHtml(
  imageUrl,
  signatureLinkUrl = '',
  fragmentHtml = '',
  bannerImageUrl = '',
  bannerLinkUrl = '',
  extraBannerSlots = null
) {
  const fragment = String(fragmentHtml || '').trim();
  const ban = String(bannerImageUrl || '').trim();
  const src = String(imageUrl || '').trim();
  const extras = Array.isArray(extraBannerSlots) ? extraBannerSlots : [];

  const bannerBlocks = [];
  if (ban) bannerBlocks.push({ imageUrl: ban, linkUrl: bannerLinkUrl });
  for (const ex of extras) {
    const u = String(ex?.imageUrl || '').trim();
    if (u) bannerBlocks.push({ imageUrl: u, linkUrl: ex?.linkUrl || '' });
  }

  let html = '';
  if (src && bannerBlocks.length > 0) {
    html = buildStackedSignatureBannerPasteHtml([
      { imageUrl: src, linkUrl: signatureLinkUrl },
      ...bannerBlocks,
    ]);
  } else if (fragment) {
    html = fragment;
  } else if (src) {
    html = buildSignaturePasteHtml(src, signatureLinkUrl);
  }

  if (!html) {
    throw new Error('No signature HTML or image URL — generate the signature first.');
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(html);
      return { success: true };
    } catch (e) {
      console.warn('[signature-export] writeText failed, trying HTML clipboard item:', e);
    }
  }
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    await writeClipboardHtmlOnly(html);
    return { success: true };
  }
  throw new Error('Clipboard is not available in this context (use HTTPS or localhost).');
}
