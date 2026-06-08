/** Keep in sync with server `blankBannerDimensions.js`. */
export const BLANK_BANNER_REF_W_PX = 720;
export const BLANK_BANNER_REF_H_PX = Math.round((BLANK_BANNER_REF_W_PX * 72) / 560);

export function blankBannerStripHeightPx(stripWidthPx, imageWidthPx, imageHeightPx) {
  const w = Math.max(1, Math.round(Number(stripWidthPx) || 1));
  const iw = Math.round(Number(imageWidthPx) || 0);
  const ih = Math.round(Number(imageHeightPx) || 0);
  if (iw > 0 && ih > 0) {
    return Math.max(24, Math.round((w * ih) / iw));
  }
  return Math.max(48, Math.round((w * BLANK_BANNER_REF_H_PX) / BLANK_BANNER_REF_W_PX));
}

export function readPrimaryBlankImageDimensions(bannerConfig) {
  const w = Number(bannerConfig?.banner_image_width);
  const h = Number(bannerConfig?.banner_image_height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return { width: Math.round(w), height: Math.round(h) };
  }
  return { width: 0, height: 0 };
}

export function readSecondaryBlankImageDimensions(bannerConfig) {
  const w = Number(bannerConfig?.secondary_banner_image_width);
  const h = Number(bannerConfig?.secondary_banner_image_height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return { width: Math.round(w), height: Math.round(h) };
  }
  return { width: 0, height: 0 };
}
