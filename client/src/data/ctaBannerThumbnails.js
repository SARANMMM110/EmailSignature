/**
 * Static HTML for Banners tab iframe thumbnails (no API / remote images).
 * Book-a-call matches server `banner_2` reference layout (see `bannerTemplates.js`).
 */

function wrapSrcDoc(inner) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;}</style></head><body>${inner}</body></html>`;
}

export function bookCallBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;border-radius:12px;overflow:hidden;min-height:77px;background-color:#1636b9;background-image:linear-gradient(135deg,#4f6cf7 0%,#1636b9 100%);box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<a href="https://" style="display:block;text-decoration:none;color:inherit;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;min-height:77px;">
<tr>
<td width="40%" valign="middle" style="width:40%;vertical-align:middle;padding:6px 4px 6px 10px;font-family:Arial,sans-serif;">
<table cellpadding="0" cellspacing="3" border="0" style="margin:0 0 2px 0;border-collapse:separate;"><tr>
<td style="width:3px;height:3px;border-radius:50%;background:rgba(130,208,255,0.55);">&nbsp;</td><td style="width:3px;height:3px;border-radius:50%;background:rgba(130,208,255,0.55);">&nbsp;</td><td style="width:3px;height:3px;border-radius:50%;background:rgba(130,208,255,0.55);">&nbsp;</td><td style="width:3px;height:3px;border-radius:50%;background:rgba(130,208,255,0.55);">&nbsp;</td>
</tr></table>
<p style="margin:0;padding:0;font-size:13px;font-weight:800;line-height:1.1;color:#ffffff;">Book your<br>free <span style="color:#ffd556;">strategy call</span></p>
<p style="margin:1px 0 0 0;padding:0;font-size:7px;line-height:1.2;color:rgba(255,255,255,0.88);">Get expert advice…</p>
</td>
<td width="24%" valign="middle" align="center" style="width:24%;vertical-align:middle;text-align:center;padding:4px 2px;">
<span style="display:inline-block;background:#ffd556;border-radius:6px;padding:3px 6px;font-size:7px;font-weight:800;color:#0c1d62;">BOOK NOW &#8594;</span>
</td>
<td width="36%" valign="middle" style="width:36%;vertical-align:middle;padding:4px 8px 4px 0;text-align:right;line-height:0;">
<span style="display:inline-block;border:1px solid rgba(91,164,255,0.85);border-radius:8px;padding:1px;"><span style="display:inline-block;width:88px;height:38px;border-radius:6px;background:#1e3a8a;opacity:0.95;"></span></span>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

export function downloadBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="background-color:#2563eb;padding:10px 14px;border-radius:10px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;">Download your free lead magnet (PDF)</td>
<td align="right"><span style="display:inline-block;background-color:#ffffff;color:#2563eb;font-family:Arial,sans-serif;font-size:11px;font-weight:800;padding:6px 14px;border-radius:18px;">Get it now</span></td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

export function needCallBannerThumbnailSrcDoc() {
  const stripH = 86;
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08);">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;min-height:${stripH}px;">
<tr>
<td width="52%" valign="top" style="width:52%;vertical-align:top;background:linear-gradient(135deg,#fbfcff 0%,#e8ecff 100%);padding:0;line-height:0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="100%" height="${stripH}" preserveAspectRatio="xMidYMid slice" style="display:block;height:${stripH}px;">
<g fill="#cbd5e9" opacity="0.9"><circle cx="10" cy="8" r="1.6"/><circle cx="17" cy="8" r="1.6"/><circle cx="24" cy="8" r="1.6"/><circle cx="10" cy="14" r="1.6"/><circle cx="17" cy="14" r="1.6"/><circle cx="24" cy="14" r="1.6"/></g>
<path d="M16 26 Q48 20 78 23 T104 19" fill="none" stroke="#1e40af" stroke-width="1.4" stroke-dasharray="3 2.5" opacity="0.75"/>
<ellipse cx="42" cy="42" rx="36" ry="14" fill="#a5b4fc" opacity="0.22"/>
<circle cx="92" cy="18" r="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
<circle cx="92" cy="18" r="6" fill="none" stroke="#3b82f6" stroke-width="1.4"/>
</svg>
</td>
<td width="48%" valign="middle" style="width:48%;background:linear-gradient(160deg,#0f172a 0%,#0a1120 55%,#070d18 100%);padding:10px 12px;vertical-align:middle;">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;line-height:1.1;color:#ffffff;">Turn subscribers<br>into <span style="color:#3b82f6">buyers.</span></p>
<p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:7px;font-weight:400;line-height:1.25;color:#cbd5e1;">Email marketing that engages…</p>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-top:6px;border-collapse:collapse;"><tr><td align="right" style="padding:0;"><span style="display:inline-block;border-radius:9999px;background:linear-gradient(90deg,#2563eb,#9333ea);padding:4px 10px;font-family:Arial,sans-serif;font-size:7px;font-weight:700;color:#ffffff;">Start free trial &#8594;</span></td></tr></table>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

export function blankImageBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;height:88px;background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;text-align:center;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#64748b;vertical-align:middle;">Your image</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Corporate navy + gold strip — mirrors server `banner_8` (simplified). */
export function boostImproveBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid rgba(11,29,54,0.2);">
<tr>
<td valign="middle" align="center" width="98" style="width:98px;background-color:#0B1D36;background-image:repeating-linear-gradient(152deg,rgba(255,255,255,0.06) 0px,rgba(255,255,255,0.06) 1px,transparent 1px,transparent 7px);border-right:3px solid #F4B93A;padding:8px 6px;">
<svg width="22" height="24" viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 4px;"><path d="M24 4 L44 44 H4 Z" fill="#F4B93A" stroke="#E8A820" stroke-width="1"/></svg>
<p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:8px;font-weight:800;color:#F4B93A;letter-spacing:0.05em;text-transform:uppercase;">BRAND</p>
</td>
<td valign="middle" width="218" style="width:218px;background-color:#ffffff;background-image:radial-gradient(circle at 1px 1px,rgba(11,29,54,0.07) 1px,transparent 0),linear-gradient(118deg,#ffffff 0%,#eef2f7 52%,#ffffff 100%);background-size:12px 12px,auto;padding:8px 10px;">
<p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:10px;font-weight:800;line-height:1.05;"><span style="color:#0B1D36;">Better</span><span style="color:#F4B93A;">Solutions.</span><br/><span style="color:#0B1D36;">Stronger</span><span style="color:#F4B93A;">Results.</span></p>
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:5px;border-collapse:collapse;"><tr>
<td style="width:2px;background:#F4B93A;font-size:0;">&nbsp;</td>
<td style="padding-left:6px;font-family:Montserrat,Arial,sans-serif;font-size:6px;color:#555555;line-height:1.25;">Smart solutions for every department.</td>
</tr></table>
</td>
<td valign="middle" width="154" style="width:154px;background-color:#0B1D36;background-image:repeating-linear-gradient(152deg,rgba(255,255,255,0.06) 0px,rgba(255,255,255,0.06) 1px,transparent 1px,transparent 7px);padding:7px 8px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>
<td width="28" style="width:28px;padding-right:5px;vertical-align:middle;line-height:0;"><svg width="26" height="26" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="16" fill="none" stroke="#F4B93A" stroke-width="1.6"/><path d="M22 12l5 10h-3l-1 8h-2l-1-8h-3z" fill="#ffffff"/></svg></td>
<td valign="middle" style="font-family:Montserrat,Arial,sans-serif;font-size:5px;color:#ffffff;line-height:1.3;">Explore smart solutions designed for impact. See how teams align strategy, execution, and measurement.</td>
</tr></table>
<p style="margin:6px 0 0;padding:0;"><span style="display:inline-block;background:#F4B93A;color:#0B1D36;font-family:Montserrat,Arial,sans-serif;font-size:6px;font-weight:800;padding:4px 8px;border-radius:3px;letter-spacing:0.06em;text-transform:uppercase;">EXPLORE NOW &#8594;</span></p>
<p style="margin:5px 0 0;padding:0;text-align:right;font-size:0;line-height:0;">
<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:#fff;margin-left:2px;"></span>
<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.35);margin-left:2px;"></span>
<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.35);margin-left:2px;"></span>
<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.35);margin-left:2px;"></span>
<span style="display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.35);margin-left:2px;"></span>
</p>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Online loan strip — mirrors server `banner_9` (simplified). */
export function onlineLoanBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;background-color:#f5f0e8;border-radius:4px;overflow:hidden;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td valign="middle" width="32%" style="width:32%;padding:6px 4px 6px 12px;vertical-align:middle;">
<p style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;color:#1a1a1a;line-height:1.15;letter-spacing:-0.2px;">Fast funding</p>
<p style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;color:#1a1a1a;line-height:1.15;letter-spacing:-0.2px;">for your next move</p>
</td>
<td valign="bottom" width="44%" align="center" style="width:44%;padding:0;line-height:0;vertical-align:bottom;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 95" width="160" height="84" preserveAspectRatio="xMidYMax meet" style="display:block;margin:0 auto;">
<ellipse cx="72" cy="18" rx="11" ry="12" fill="#f5c9a0"/><ellipse cx="72" cy="10" rx="11" ry="7" fill="#3b2314"/>
<path d="M58 34 Q72 30 86 34 L88 75 L56 75 Z" fill="#e8dcc8"/><path d="M102 36 Q118 30 134 36 L136 80 L100 80 Z" fill="#7d8c6e"/>
<ellipse cx="118" cy="18" rx="12" ry="13" fill="#d4956a"/>
</svg>
</td>
<td valign="top" width="24%" style="width:24%;padding:6px 12px 6px 4px;vertical-align:top;">
<table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;"><tr>
<td valign="middle" style="padding:0 3px 0 0;"><span style="display:inline-block;width:3px;height:10px;background:#c8a84b;border-radius:1px;font-size:0;line-height:0;">&nbsp;</span></td>
<td valign="middle" style="font-family:Arial,sans-serif;font-size:9px;font-weight:800;color:#444;letter-spacing:0.5px;text-transform:uppercase;">YOUR BRAND</td>
</tr></table>
<table cellpadding="0" cellspacing="0" border="0" align="right" style="margin-top:4px;border-collapse:collapse;"><tr><td>
<span style="display:inline-block;background:#1e3d2f;color:#fff;font-family:Arial,sans-serif;font-size:8px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;padding:4px 10px;border-radius:4px;">Get pre-approved</span>
</td></tr></table>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Leave a review card — mirrors server `banner_11` (simplified). */
export function leaveReviewBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#ffffff;border:1px solid #e8e8e8;border-radius:14px;">
<tr>
<td valign="middle" width="36%" style="width:36%;padding:10px 6px 10px 14px;vertical-align:middle;font-family:system-ui,Arial,sans-serif;">
<p style="margin:0 0 3px;font-size:13px;font-weight:800;color:#111;line-height:1.2;">Loved working with us?</p>
<p style="margin:0;font-size:10px;font-weight:400;color:#444;">Leave a quick Google review</p>
<p style="margin:6px 0 0;line-height:0;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:block;"><path d="M7 11V5.5a1.5 1.5 0 013 0V11" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/><path d="M10 10.5V4a1.5 1.5 0 013 0v6.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/></svg></p>
</td>
<td valign="bottom" width="48%" style="width:48%;padding:0;line-height:0;vertical-align:bottom;text-align:center;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80" style="display:block;margin:0 auto;">
<path d="M10 70 Q0 50 15 30 Q30 8 80 12 Q130 15 170 35 Q195 55 175 72 Q140 82 70 78 Q25 75 10 70Z" fill="#efefef"/>
<ellipse cx="118" cy="38" rx="8" ry="9" fill="#f5c9a0"/>
<path d="M98 52 Q118 45 138 52 L140 78 L96 78 Z" fill="#3db87a"/>
<path d="M130 8 L134 22 L148 22 L137 30 L141 44 L130 36 L119 44 L123 30 L112 22 L126 22 Z" fill="none" stroke="#222" stroke-width="1.6"/>
</svg>
</td>
<td valign="middle" align="center" width="16%" style="width:16%;padding:6px 12px 6px 4px;vertical-align:middle;">
<span style="display:inline-block;width:36px;height:36px;border-radius:50%;background:#111;line-height:36px;text-align:center;color:#fff;font-size:16px;font-weight:700;">&#8594;</span>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Dark grid SEO strip — mirrors server `banner_12` (simplified). */
export function seoWhitepaperBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#1a2530;border-radius:12px;">
<tr>
<td valign="middle" width="38%" style="width:38%;padding:10px 6px 10px 16px;vertical-align:middle;font-family:system-ui,Arial,sans-serif;">
<p style="margin:0;font-size:12px;font-weight:700;color:#fff;line-height:1.3;">SEO Whitepaper</p>
<p style="margin:2px 0 0;font-size:10px;font-weight:400;color:#8a9baa;">Free top 10 SEO tips PDF</p>
</td>
<td valign="middle" align="right" width="50%" style="width:50%;padding:0;line-height:0;vertical-align:middle;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48" width="180" height="48" style="display:block;margin-left:auto;">
<line x1="30" y1="0" x2="30" y2="48" stroke="#2e4050" stroke-width="1"/>
<line x1="60" y1="0" x2="60" y2="48" stroke="#2e4050" stroke-width="1"/>
<line x1="90" y1="0" x2="90" y2="48" stroke="#2e4050" stroke-width="1"/>
<line x1="120" y1="0" x2="120" y2="48" stroke="#2e4050" stroke-width="1"/>
<line x1="150" y1="0" x2="150" y2="48" stroke="#2e4050" stroke-width="1"/>
<line x1="0" y1="16" x2="180" y2="16" stroke="#2e4050" stroke-width="1"/>
<line x1="0" y1="32" x2="180" y2="32" stroke="#2e4050" stroke-width="1"/>
<rect x="4" y="4" width="20" height="10" rx="3" fill="none" stroke="#344d60" stroke-width="1"/>
<rect x="34" y="4" width="20" height="10" rx="3" fill="none" stroke="#344d60" stroke-width="1"/>
<rect x="64" y="20" width="20" height="10" rx="3" fill="none" stroke="#344d60" stroke-width="1"/>
</svg>
</td>
<td valign="middle" align="center" width="12%" style="width:12%;padding:6px 14px 6px 4px;vertical-align:middle;">
<span style="display:inline-block;width:32px;height:32px;border-radius:7px;background:#253545;border:1px solid #3a4e60;line-height:32px;text-align:center;color:#fff;font-size:14px;font-weight:700;">&#8594;</span>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Mint–teal gradient CTA — mirrors server `banner_13` (simplified). */
export function greenGradientCtaBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#4cd68a 0%,#2a9e72 40%,#1e7a5e 100%);">
<tr>
<td valign="middle" width="44" style="width:44px;padding:8px 4px 8px 14px;vertical-align:middle;line-height:0;">
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 44 44" style="display:block;">
<rect x="2" y="2" width="20" height="20" rx="2" fill="#ffffff"/>
<rect x="14" y="14" width="20" height="20" rx="2" fill="#ffffff"/>
<rect x="14" y="14" width="8" height="8" fill="#3ab878"/>
</svg>
</td>
<td valign="middle" style="padding:8px 6px;font-family:system-ui,Arial,sans-serif;font-size:12px;font-weight:600;color:#ffffff;line-height:1.3;">
A better<br/>future awaits
</td>
<td valign="middle" align="right" width="72" style="width:72px;padding:0 2px;line-height:0;vertical-align:middle;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56" width="72" height="40" style="display:block;margin-left:auto;opacity:0.55;">
<circle cx="78" cy="12" r="18" fill="#ffffff" opacity="0.12"/>
<circle cx="88" cy="44" r="10" fill="#ffffff" opacity="0.1"/>
<path d="M4 48 Q20 28 52 36 T96 20" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.2"/>
</svg>
</td>
<td valign="middle" style="padding:8px 14px 8px 6px;font-family:system-ui,Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;white-space:nowrap;">
Book a call <span style="font-weight:300;margin-left:3px;">&#8594;</span>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}
