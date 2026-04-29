import { buildCtaBannerImageStyleString } from './ctaBannerImageStyle.js';

/**
 * Email-safe inline styles for blank image-strip `<img>`: fixed cell; full image visible (contain + center).
 * @param {Record<string, unknown>} _banner — reserved for API compatibility
 * @param {number} blankW — content width (px)
 * @param {number} blankH — strip height (px)
 * @returns {string} full `style="…"` body for the banner img
 */
export function buildBannerBlankImgStyleString(_banner, blankW, blankH) {
  const h = Math.max(1, Math.round(Number(blankH) || 93));
  const maxW = Math.max(1, Math.round(Number(blankW) || h));
  return buildCtaBannerImageStyleString({
    fluidWidth: true,
    heightPx: h,
    extra: ['min-width:100%', `max-width:${maxW}px`],
  });
}
