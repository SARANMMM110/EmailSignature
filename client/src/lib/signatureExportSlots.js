import { signatureExportAPI } from './api.js';
import { splitSignatureAndBannerHtml } from './splitSignatureBannerHtml.js';
import { wrapHtmlFragmentForPuppeteerExport } from './wrapSignatureExportFragment.js';

/**
 * Rasterize signature + CTA strip(s) for Gmail-style paste: one PNG per block when possible.
 *
 * @param {string} fullHtml — full generated fragment from `/html/generate`
 * @param {number} railPx
 * @param {{ signatureId?: string }} [opts]
 * @returns {Promise<{ sigUrl: string, bannerUrls: string[], mode: 'multi-slot' | 'dual' | 'composite' | 'error' }>}
 */
export async function generateSplitSignatureBannerPngUrls(fullHtml, railPx, opts = {}) {
  const signatureId = String(opts.signatureId || '').trim();
  const exportOpts = (slot) => (signatureId ? { signatureId, slot } : {});

  const { signatureHtml, bannerHtml, bannerSlotHtmls } = splitSignatureAndBannerHtml(String(fullHtml || ''));
  const slots = (bannerSlotHtmls || []).map((s) => String(s || '').trim()).filter(Boolean);
  const sig = String(signatureHtml || '').trim();
  const ban = String(bannerHtml || '').trim();

  if (sig && slots.length >= 2) {
    const sigDoc = wrapHtmlFragmentForPuppeteerExport(sig, railPx);
    const slotDocs = slots.map((s) => wrapHtmlFragmentForPuppeteerExport(s, railPx));
    const urls = [];
    const sigRes = await signatureExportAPI.generateImage(sigDoc, exportOpts('signature'));
    urls.push(String(sigRes.data?.url || '').trim());
    for (let i = 0; i < slotDocs.length; i++) {
      const r = await signatureExportAPI.generateImage(slotDocs[i], exportOpts(`banner-${i}`));
      urls.push(String(r.data?.url || '').trim());
    }
    const sigUrl = urls[0];
    const bannerUrls = urls.slice(1);
    if (sigUrl && bannerUrls.length === slots.length && bannerUrls.every(Boolean)) {
      return { sigUrl, bannerUrls, mode: 'multi-slot' };
    }
    return { sigUrl: '', bannerUrls: [], mode: 'error' };
  }

  if (sig && ban) {
    const sigDoc = wrapHtmlFragmentForPuppeteerExport(sig, railPx);
    const banDoc = wrapHtmlFragmentForPuppeteerExport(ban, railPx);
    const sigRes = await signatureExportAPI.generateImage(sigDoc, exportOpts('signature'));
    const banRes = await signatureExportAPI.generateImage(banDoc, exportOpts('banner-0'));
    const sigUrl = String(sigRes.data?.url || '').trim();
    const banUrl = String(banRes.data?.url || '').trim();
    if (sigUrl && banUrl) {
      return { sigUrl, bannerUrls: [banUrl], mode: 'dual' };
    }
    return { sigUrl: '', bannerUrls: [], mode: 'error' };
  }

  const { data } = await signatureExportAPI.generateImage(fullHtml, exportOpts('composite'));
  const url = String(data?.url || '').trim();
  return { sigUrl: url, bannerUrls: [], mode: 'composite' };
}
