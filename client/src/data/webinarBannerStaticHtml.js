/**
 * Client copy of server `banner_1` (webinar) for Banners tab thumbnail.
 * Keep structure in sync with `server/src/templates/bannerTemplates.js` banner_1;
 * colors come from `webinarBannerStyleVars` (same rules as `htmlGenerator.js`).
 */
import { webinarBannerStyleVars } from '../lib/webinarBannerTheme.js';

const DEMO = {
  headline: 'Email Marketing 101 Webinar',
  subline: 'Only 10 seats available!',
  cta: 'Book my seat',
  minHeight: 88,
};

export function buildWebinarBannerInnerHtml(vars, copy = DEMO) {
  const h = copy.headline ?? DEMO.headline;
  const s = copy.subline ?? DEMO.subline;
  const c = copy.cta ?? DEMO.cta;
  const mh = copy.minHeight ?? DEMO.minHeight;
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:12px;overflow:hidden;background-color:${vars.banner_bg_mid};background-image:linear-gradient(148deg,${vars.banner_bg_start} 0%,${vars.banner_bg_mid} 45%,${vars.banner_bg_end} 100%);">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td width="64%" valign="middle" style="width:64%;min-height:${mh}px;padding:12px 8px 12px 14px;vertical-align:middle;">
<p style="margin:0;padding:0;color:${vars.banner_headline_color};font-family:Arial, Helvetica, Roboto, system-ui, sans-serif;font-size:15px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;">${h}</p>
<p style="margin:4px 0 0;padding:0;color:${vars.banner_subline_color};font-family:Arial, Helvetica, Roboto, system-ui, sans-serif;font-size:10px;font-weight:400;line-height:1.35;">${s}</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:9px 0 0 0;"><tr><td style="padding:0;">
<a href="https://" style="display:inline-block;background-color:${vars.banner_cta_bg};color:${vars.banner_cta_text};font-family:Arial, Helvetica, Roboto, system-ui, sans-serif;font-size:10px;font-weight:600;text-decoration:none;padding:6px 14px;border-radius:999px;line-height:1.2;">${c}</a>
</td></tr></table>
</td>
<td width="36%" valign="bottom" align="right" style="width:36%;min-height:${mh}px;padding:0 6px 0 0;vertical-align:bottom;line-height:0;text-align:right;font-size:0;">
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="65" viewBox="0 0 132 108" fill="none" aria-hidden="true" style="display:block;margin:0 0 0 auto;max-width:100%;height:auto;">
<rect x="74" y="82" width="14" height="26" rx="4" fill="${vars.banner_bar_1}" fill-opacity="0.5"/>
<rect x="85" y="70" width="14" height="38" rx="4" fill="${vars.banner_bar_2}" fill-opacity="0.52"/>
<rect x="96" y="56" width="14" height="52" rx="4" fill="${vars.banner_bar_3}" fill-opacity="0.54"/>
<rect x="107" y="40" width="14" height="68" rx="4" fill="${vars.banner_bar_4}" fill-opacity="0.56"/>
<rect x="118" y="22" width="14" height="86" rx="4" fill="${vars.banner_bar_5}" fill-opacity="0.58"/>
</svg>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
}

/** Full minimal document for iframe srcDoc (no remote resources). */
export function webinarBannerThumbnailSrcDoc(color1, color2, color3, color4, copy) {
  const vars = webinarBannerStyleVars(color1, color2, color3, color4);
  const inner = buildWebinarBannerInnerHtml(vars, copy);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;}</style></head><body>${inner}</body></html>`;
}
