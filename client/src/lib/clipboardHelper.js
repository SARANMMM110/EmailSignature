/**
 * Gmail/Outlook paste helpers:
 * - Dual PNG export: two `<table><tr><td><img></td></tr></table>` + `<br>` so each block selects independently.
 * - Fallback: single table + composite PNG, or full `generated_html` fragment when provided.
 */

import { recipientVisibleImageSrc } from './signatureImagePublicUrl.js';

function escapeAttrUrl(url) {
  return String(url || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function normalizeSignatureHref(raw) {
  let u = String(raw || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

function oneImageTable(imgInner) {
  return `<table cellpadding="0" cellspacing="0" border="0"><tr><td>${imgInner}</td></tr></table>`;
}

/**
 * Gmail-friendly: signature image table, `<br>`, CTA image table — no shared parent.
 */
export function buildDualImagePasteHtml(signatureImageUrl, bannerImageUrl, options = {}) {
  const { signatureLinkUrl = '', bannerLinkUrl = '' } = options;
  const sigSrc = recipientVisibleImageSrc(String(signatureImageUrl || '').trim());
  const banSrc = recipientVisibleImageSrc(String(bannerImageUrl || '').trim());
  const sigImg = `<img src="${escapeAttrUrl(sigSrc)}" width="600" border="0" alt="" style="display:block;border:none;">`;
  const banImg = `<img src="${escapeAttrUrl(banSrc)}" width="600" border="0" alt="" style="display:block;border:none;">`;
  const sigHref = normalizeSignatureHref(signatureLinkUrl);
  const banHref = normalizeSignatureHref(bannerLinkUrl);
  const sigInner =
    sigHref !== ''
      ? `<a href="${escapeAttrUrl(sigHref)}" style="text-decoration:none;border:none;" target="_blank" rel="noopener noreferrer">${sigImg}</a>`
      : sigImg;
  const banInner =
    banHref !== ''
      ? `<a href="${escapeAttrUrl(banHref)}" style="text-decoration:none;border:none;" target="_blank" rel="noopener noreferrer">${banImg}</a>`
      : banImg;
  return `${oneImageTable(sigInner)}<br>${oneImageTable(banInner)}`;
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
 * @param {string} imageUrl — signature PNG (or composite when no banner export)
 * @param {{ signatureLinkUrl?: string, bannerImageUrl?: string, bannerLinkUrl?: string, fragmentHtml?: string }} [options]
 */
export async function copySignatureImageToClipboard(imageUrl, options = {}) {
  const src = String(imageUrl || '').trim();
  if (!src) {
    throw new Error('No signature image URL — generate the export on the server first.');
  }
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is not supported in this browser (use HTTPS or localhost).');
  }
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Could not fetch signature image (${res.status}).`);
  }
  let blob = await res.blob();
  if (!blob.type.startsWith('image/')) {
    blob = new Blob([await blob.arrayBuffer()], { type: 'image/png' });
  }

  const bannerImg = String(options.bannerImageUrl || '').trim();
  const fragment = String(options.fragmentHtml || '').trim();
  const sigLink = normalizeSignatureHref(options.signatureLinkUrl);
  const banLink = normalizeSignatureHref(options.bannerLinkUrl);

  const dualHtml =
    bannerImg && src ? buildDualImagePasteHtml(src, bannerImg, { signatureLinkUrl: sigLink, bannerLinkUrl: banLink }) : '';

  let htmlForMime = '';
  if (dualHtml) {
    htmlForMime = dualHtml;
  } else if (fragment) {
    htmlForMime = fragment;
  } else if (sigLink) {
    htmlForMime = buildSignaturePasteHtml(src, sigLink);
  }

  if (htmlForMime) {
    const pngType = blob.type?.startsWith('image/') ? blob.type : 'image/png';
    const pngBlob =
      blob.type === pngType ? blob : new Blob([await blob.arrayBuffer()], { type: 'image/png' });
    const htmlBlob = new Blob([htmlForMime], { type: 'text/html' });

    const tryDual = async (usePromises) => {
      const item = usePromises
        ? new ClipboardItem({
            'text/html': Promise.resolve(htmlBlob),
            [pngType]: Promise.resolve(pngBlob),
          })
        : new ClipboardItem({
            'text/html': htmlBlob,
            [pngType]: pngBlob,
          });
      await navigator.clipboard.write([item]);
    };

    let ok = false;
    try {
      await tryDual(true);
      ok = true;
    } catch {
      try {
        await tryDual(false);
        ok = true;
      } catch (e2) {
        console.warn('[signature-export] Dual clipboard (promise + sync) failed:', e2);
      }
    }
    if (ok) {
      console.log('[signature-export] Clipboard: text/html +', pngType);
      return { success: true, linked: Boolean(sigLink || banLink) };
    }
    console.warn(
      '[signature-export] Rich clipboard unavailable — use “Copy HTML code” in a supported browser.'
    );
  }

  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  return { success: true, linked: false };
}

/**
 * @param {string} imageUrl
 * @param {string} [signatureLinkUrl]
 * @param {string} [fragmentHtml] — full generated HTML when not using image snippet
 * @param {string} [bannerImageUrl]
 * @param {string} [bannerLinkUrl]
 */
export async function copySignaturePasteHtml(
  imageUrl,
  signatureLinkUrl = '',
  fragmentHtml = '',
  bannerImageUrl = '',
  bannerLinkUrl = ''
) {
  const fragment = String(fragmentHtml || '').trim();
  const ban = String(bannerImageUrl || '').trim();
  const src = String(imageUrl || '').trim();

  let html = '';
  if (src && ban) {
    html = buildDualImagePasteHtml(src, ban, { signatureLinkUrl, bannerLinkUrl });
  } else if (fragment) {
    html = fragment;
  } else if (src) {
    html = buildSignaturePasteHtml(src, signatureLinkUrl);
  }

  if (!html) {
    throw new Error('No signature HTML or image URL — generate the signature first.');
  }
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard writeText is not available in this context (use HTTPS or localhost).');
  }
  await navigator.clipboard.writeText(html);
  return { success: true };
}
