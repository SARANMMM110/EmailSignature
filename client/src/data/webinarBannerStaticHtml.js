/**
 * Client copy of server `banner_1` (webinar) for Banners tab thumbnail.
 * Keep structure in sync with `server/src/templates/bannerTemplates.js` banner_1;
 * colors come from `webinarBannerStyleVars` (same rules as `htmlGenerator.js`).
 */
import { webinarBannerStyleVars } from '../lib/webinarBannerTheme.js';
import { buildEmailTheme } from '../lib/emailTheme.js';

const DEMO = {
  brand: 'Acme Studio',
  headline: 'Book more clients without the hustle',
  subline: 'Free 15-minute fit call — we reply the same business day.',
  cta: 'Book free strategy call',
  minHeight: 96,
};

const BANNER_W = 470;

export function buildWebinarBannerInnerHtml(vars, copy = DEMO) {
  const brand = copy.brand ?? DEMO.brand;
  const h = copy.headline ?? DEMO.headline;
  const s = copy.subline ?? DEMO.subline;
  const c = copy.cta ?? DEMO.cta;
  const mh = copy.minHeight ?? DEMO.minHeight;
  const bh = vars.banner_b1_blobs_h || '118';
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="${BANNER_W}" style="width:${BANNER_W}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:16px;-webkit-border-radius:16px;overflow:hidden;mso-border-radius-alt:16px;position:relative;background-color:${vars.banner_surface_bg};min-height:${mh}px;">
<svg xmlns="http://www.w3.org/2000/svg" width="${BANNER_W}" height="${bh}" viewBox="-200 0 760 140" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" style="display:block;position:absolute;right:0;top:0;left:auto;width:${BANNER_W}px;height:${bh}px;z-index:0;">
<g transform="translate(28,0)">
<path d="M 320 -10 C 310 10, 270 5, 275 35 C 280 60, 320 55, 315 80 C 308 110, 270 105, 280 125 C 290 145, 340 135, 360 110 C 380 85, 360 70, 375 50 C 392 28, 420 35, 415 10 C 410 -10, 330 -30, 320 -10 Z" fill="${vars.banner_blob_peach}" opacity="0.6"/>
<path d="M 355 -20 C 340 5, 360 30, 390 25 C 420 20, 445 -5, 460 20 C 475 45, 450 70, 420 75 C 395 80, 375 65, 370 85 C 364 108, 390 125, 420 120 C 455 114, 480 90, 500 65 C 520 40, 510 5, 490 -15 C 468 -38, 375 -48, 355 -20 Z" fill="${vars.banner_blob_orange}" opacity="0.95"/>
</g>
</svg>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;position:relative;z-index:1;">
<tr>
<td valign="middle" width="99%" style="width:99%;max-width:100%;padding:14px 6px 14px 18px;vertical-align:middle;font-family:Arial, Helvetica, Roboto, system-ui, sans-serif;mso-line-height-rule:exactly;">
<p style="margin:0 0 4px;padding:0;color:${vars.banner_brand_color};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;line-height:1.2;">${brand}</p>
<p style="margin:0 0 6px;padding:0;color:${vars.banner_headline_color};font-size:19px;font-weight:800;line-height:1.2;mso-line-height-rule:exactly;">${h}</p>
<p style="margin:0;padding:0;color:${vars.banner_subline_color};font-size:11px;font-weight:400;line-height:1.45;mso-line-height-rule:exactly;">${s}</p>
</td>
<td valign="middle" align="right" width="1%" style="width:1%;white-space:nowrap;padding:14px 18px 14px 8px;vertical-align:middle;text-align:right;font-family:Arial, Helvetica, Roboto, system-ui, sans-serif;mso-line-height-rule:exactly;">
<a href="https://" style="display:inline-block;border:2px solid ${vars.banner_cta_border};border-radius:50px;-webkit-border-radius:50px;padding:8px 18px;font-size:12px;font-weight:800;color:${vars.banner_cta_text};text-decoration:none;line-height:1.2;mso-line-height-rule:exactly;background-color:${vars.banner_cta_pill_bg};box-shadow:0 1px 2px rgba(15,23,42,0.08);">${c}</a>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
}

/** Full minimal document for iframe srcDoc (no remote resources). */
export function webinarBannerThumbnailSrcDoc(color1, color2, color3, color4, copy) {
  const theme = buildEmailTheme({ primary: color1, secondary: color2, accent: color3, text: color4 });
  const vars = webinarBannerStyleVars(color1, color2, color3, color4, BANNER_W, theme);
  const inner = buildWebinarBannerInnerHtml(vars, copy);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;}</style></head><body>${inner}</body></html>`;
}
