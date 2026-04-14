/**
 * Static HTML for Banners tab iframe thumbnails (no API / remote images).
 * Book-a-call matches server `banner_2` gradient + layout (see `bannerTemplates.js`).
 */

function wrapSrcDoc(inner) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;}</style></head><body>${inner}</body></html>`;
}

export function bookCallBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;border-radius:14px;overflow:hidden;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#74b695;background-image:linear-gradient(90deg,#a8d8c0 0%,#74b695 100%);">
<tr>
<td valign="middle" style="padding:14px 8px 14px 18px;font-family:Montserrat,Arial,sans-serif;font-size:14px;font-weight:500;color:#1a1a1a;line-height:1.2;">Book a call today</td>
<td valign="middle" width="32" style="width:32px;text-align:center;font-family:Montserrat,Arial,sans-serif;font-size:20px;color:#0d2d1e;line-height:1;">&#8594;</td>
<td valign="middle" align="right" style="padding:10px 14px 10px 6px;line-height:0;"><span style="display:inline-block;width:76px;height:50px;border-radius:10px;background:#2d4a3a;opacity:0.9;"></span></td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

export function downloadBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="background-color:#2563eb;padding:10px 14px;border-radius:10px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;">Download my Resume</td>
<td align="right"><span style="display:inline-block;background-color:#ffffff;color:#2563eb;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:5px 12px;border-radius:18px;">Download</span></td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

export function needCallBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="background-color:#1e3a5f;padding:12px 14px;border-radius:7px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;">Need a call?</td>
<td align="right"><span style="display:inline-block;background-color:#3d4cff;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:6px 12px;border-radius:5px;border:1px solid #8fa4ff;">Pick a slot now</span></td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}
