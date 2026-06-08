import { buildCtaBannerImageStyleString } from './ctaBannerImageStyle.js';

/**
 * Email-safe inline styles for blank image-strip `<img>` — width spans rail; height matches {@link blankBannerStripHeightPx}.
 */
export function buildBannerBlankImgStyleString(_banner, blankW, blankH) {
  const h = Math.max(1, Math.round(Number(blankH) || 93));
  const maxW = Math.max(1, Math.round(Number(blankW) || h));
  return buildCtaBannerImageStyleString({
    fluidWidth: true,
    heightPx: h,
    extra: [`max-width:${maxW}px`],
  });
}
