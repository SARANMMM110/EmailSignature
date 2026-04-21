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

export function blankImageBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;height:88px;background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;text-align:center;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#64748b;vertical-align:middle;">Your image</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Mindscope-style strip — mirrors server `banner_5` (simplified for iframe scale). */
export function mindscopeBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;min-height:88px;background-color:#0f2d6b;background-image:linear-gradient(110deg,#0a1628 0%,#0d2145 40%,#0f2d6b 70%,#1a3a80 100%);">
<tr>
<td valign="middle" align="center" width="18%" style="width:18%;background-color:#0a1628;background-image:radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px);background-size:12px 12px;border-right:1px solid rgba(255,255,255,0.1);padding:6px 4px;">
<p style="margin:0;font-family:Arial,sans-serif;font-weight:800;font-size:8px;color:#fff;letter-spacing:0.06em;text-transform:uppercase;line-height:1.1;text-align:center;">MINDSCOPE</p>
</td>
<td valign="middle" style="padding:8px 10px;font-family:Arial,sans-serif;">
<p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#fff;line-height:1.2;">ATS &amp; Recruiting CRM</p>
<p style="margin:0;font-size:11px;font-weight:800;color:#fff;line-height:1.15;">Make Hiring <span style="color:#f9e000;">Easy!</span></p>
</td>
<td valign="middle" align="center" style="white-space:nowrap;padding:0 8px 0 4px;">
<span style="display:inline-block;border:2px solid #2ecc71;border-radius:4px;padding:4px 10px;font-family:Arial,sans-serif;font-weight:700;font-size:10px;color:#2ecc71;">Try For Free!</span>
</td>
<td valign="bottom" width="14%" style="width:14%;background-image:linear-gradient(160deg,#1a3a80 0%,#2a5298 100%);padding:0 4px 4px 0;">
<table cellpadding="0" cellspacing="0" border="0" align="right" style="width:40px;background:#fff;border-radius:2px;padding:3px 4px;box-shadow:0 1px 4px rgba(0,0,0,0.25);">
<tr><td style="height:2px;background:#dde3ee;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding-top:2px;height:2px;width:70%;background:#dde3ee;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding-top:2px;height:2px;background:#dde3ee;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding-top:4px;height:4px;background:#2ecc71;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Mailchimp-inspired strip — mirrors server `banner_6` (simplified for iframe scale). */
export function mailchimpCampaignBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;min-height:58px;">
<tr>
<td width="56%" valign="top" style="width:56%;vertical-align:top;padding:0;background:linear-gradient(180deg,#f9b56a 0%,#c05020 100%);line-height:0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="100%" height="58" preserveAspectRatio="xMidYMid slice" style="display:block;height:58px;">
<rect width="120" height="40" fill="#e8813a"/>
<polygon points="30,40 60,8 90,40" fill="#d96030"/><polygon points="60,8 90,40 60,40" fill="#8c3410"/>
<ellipse cx="22" cy="32" rx="10" ry="5" fill="#4a2608"/>
</svg>
</td>
<td width="44%" valign="middle" style="width:44%;background-color:#1c1c1c;padding:8px 10px;vertical-align:middle;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>
<td valign="middle" style="font-family:Arial,sans-serif;font-size:9px;font-weight:600;color:#ffffff;line-height:1.25;padding-right:6px;">Leading email marketing solution.</td>
<td valign="middle" align="right" style="white-space:nowrap;"><span style="display:inline-block;background:#ffe01b;border-radius:2px;padding:4px 8px;font-family:Arial,sans-serif;font-size:8px;font-weight:700;color:#1c1c1c;">Get Started</span></td>
<td valign="middle" width="28" style="width:28px;padding-left:4px;line-height:0;"><span style="display:inline-block;width:22px;height:24px;border-radius:50%;background:#ffe01b;"></span></td>
</tr></table>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** “Explore your world” strip — mirrors server `banner_7` (simplified). */
export function exploreWorldBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:2px solid #e8d94a;background-color:#1a2355;">
<tr>
<td width="18%" valign="middle" style="width:18%;background-color:#111b42;border-right:2px solid #e8d94a;padding:6px 8px;">
<p style="margin:0;font-family:Arial,sans-serif;font-size:7px;color:#fff;letter-spacing:0.06em;text-transform:lowercase;">explore</p>
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:Arial,sans-serif;font-size:16px;font-weight:900;color:#fff;line-height:1;">log</td>
<td style="padding-left:2px;line-height:0;"><svg width="16" height="16" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><ellipse cx="13" cy="13" rx="11" ry="11" fill="#e8d94a" transform="rotate(-35 13 13)"/><ellipse cx="13" cy="13" rx="6" ry="10" fill="#111b42" transform="rotate(-35 13 13)"/></svg></td>
</tr></table>
</td>
<td valign="middle" style="padding:6px 10px;">
<p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#fff;">Explore Your</p>
<p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#e8d94a;line-height:1;">WORLD</p>
</td>
<td valign="middle" align="center" style="padding:6px 8px;">
<span style="display:inline-block;background:#e8d94a;border-radius:2px;padding:4px 10px;font-family:Arial,sans-serif;font-size:9px;font-weight:800;color:#1a2355;">Learn More</span>
<p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:7px;color:#c8d8ff;">www.example.com</p>
</td>
<td width="14%" valign="bottom" style="width:14%;vertical-align:bottom;line-height:0;text-align:right;padding:0 4px 0 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 120" width="44" height="58" style="display:block;"><ellipse cx="46" cy="36" rx="14" ry="15" fill="#f5c5a0"/><ellipse cx="46" cy="22" rx="20" ry="6" fill="#c8a020"/></svg>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Wellness “Boost and Improve” strip — mirrors server `banner_8` (simplified). */
export function boostImproveBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td valign="middle" align="center" width="62" style="width:62px;background-color:#1e2d1e;padding:5px 4px;">
<svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
<path d="M16 2 C16 2 28 8 28 20 C28 28 22 30 16 30 C10 30 4 28 4 20 C4 8 16 2 16 2Z" fill="#7ab82a"/>
<line x1="16" y1="30" x2="16" y2="14" stroke="#aad060" stroke-width="1.5" stroke-linecap="round"/>
</svg>
<p style="margin:1px 0 0;font-family:Montserrat,Arial,sans-serif;font-size:6px;font-weight:600;color:#aac88a;letter-spacing:0.08em;text-transform:uppercase;line-height:1;">Mighty</p>
<p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:10px;font-weight:800;color:#ffffff;letter-spacing:0.04em;text-transform:uppercase;line-height:1;">LOGO</p>
</td>
<td valign="bottom" width="244" style="width:244px;padding:0;line-height:0;background:linear-gradient(105deg,#e8f0d8 0%,#d4e8b0 45%,#b8d888 100%);overflow:hidden;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 72" width="244" height="72" preserveAspectRatio="xMidYMax meet" style="display:block;">
<defs><linearGradient id="b8thumbG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#e8f2d5"/><stop offset="100%" stop-color="#c0dc90"/></linearGradient></defs>
<rect width="244" height="72" fill="url(#b8thumbG)"/>
<rect x="0" y="58" width="244" height="14" fill="#b0cc80" opacity="0.5"/>
<path d="M18 16 L22 62 L44 62 L48 16 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.75)" stroke-width="0.6"/>
<path d="M22 38 L23 62 L41 62 L42 38 Z" fill="#70c020" opacity="0.75"/>
<path d="M58 24 L62 62 L80 62 L84 24 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.75)" stroke-width="0.6"/>
<path d="M62 45 L63 62 L79 62 L80 45 Z" fill="#b0d8f0" opacity="0.75"/>
<path d="M92 14 L96 62 L120 62 L124 14 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.75)" stroke-width="0.6"/>
<path d="M96 34 L98 62 L118 62 L120 34 Z" fill="#70c020" opacity="0.72"/>
<ellipse cx="158" cy="58" rx="16" ry="11" fill="#f5e040"/>
<ellipse cx="195" cy="54" rx="14" ry="10" fill="#e8c060"/>
</svg>
</td>
<td valign="middle" width="164" style="width:164px;background-color:#7ab82a;padding:6px 10px 8px 12px;vertical-align:middle;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>
<td style="vertical-align:top;">
<p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:11px;font-weight:800;color:#1a2e0a;line-height:1.1;">Boost and Improve</p>
<p style="margin:3px 0 5px;font-family:Montserrat,Arial,sans-serif;font-size:8px;font-weight:500;color:#2a4a10;">Your Immune System</p>
<span style="display:inline-block;background-color:#1e2d1e;border-radius:2px;padding:4px 9px;font-family:Montserrat,Arial,sans-serif;font-size:7px;font-weight:700;color:#ffffff;letter-spacing:0.06em;text-transform:uppercase;">Click Here</span>
</td></tr>
<tr><td align="right" style="padding-top:6px;font-size:0;line-height:0;">
<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#ffffff;margin-left:3px;"></span>
<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);margin-left:3px;"></span>
<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);margin-left:3px;"></span>
<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);margin-left:3px;"></span>
<span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);margin-left:3px;"></span>
</td></tr></table>
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
<p style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;color:#1a1a1a;line-height:1.15;letter-spacing:-0.2px;">Online půjčka pro</p>
<p style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;color:#1a1a1a;line-height:1.15;letter-spacing:-0.2px;">každého</p>
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
<td valign="middle" style="font-family:Arial,sans-serif;font-size:9px;font-weight:800;color:#444;letter-spacing:0.5px;text-transform:uppercase;">REVOLIO</td>
</tr></table>
<table cellpadding="0" cellspacing="0" border="0" align="right" style="margin-top:4px;border-collapse:collapse;"><tr><td>
<span style="display:inline-block;background:#1e3d2f;color:#fff;font-family:Arial,sans-serif;font-size:8px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;padding:4px 10px;border-radius:4px;">CHCI PŮJČIT</span>
</td></tr></table>
</td>
</tr>
</table>
</td></tr>
</table>`;
  return wrapSrcDoc(inner);
}

/** Business / city skyline strip — mirrors server `banner_10` (simplified). */
export function businessCityBannerThumbnailSrcDoc() {
  const inner = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;">
<tr><td style="padding:0;background-color:#1a1a2e;border-radius:4px;overflow:hidden;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td valign="middle" width="42%" style="width:42%;background-color:#ffffff;padding:8px 10px 8px 12px;vertical-align:middle;">
<p style="margin:0;font-family:Arial,sans-serif;font-size:6px;font-weight:700;color:#1a1a2e;letter-spacing:0.12em;text-transform:uppercase;">BUSINESS</p>
<p style="margin:1px 0 0;font-family:Arial,sans-serif;font-size:11px;font-weight:900;color:#d4a400;text-transform:uppercase;line-height:1;">BANNER</p>
<p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:900;color:#1a1a2e;text-transform:uppercase;line-height:1;">DESIGN</p>
<p style="margin:4px 0 5px;font-family:Arial,sans-serif;font-size:6px;color:#555;line-height:1.35;max-width:160px;">Lorem ipsum dolor sit amet…</p>
<span style="display:inline-block;background-color:#1a1a2e;color:#fff;font-family:Arial,sans-serif;font-size:6px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 8px;border-radius:2px;">LEARN MORE</span>
</td>
<td valign="bottom" width="58%" style="width:58%;padding:0;line-height:0;vertical-align:bottom;background:linear-gradient(160deg,#5a6e80 0%,#6b7f8e 55%,#4a5a68 100%);">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td valign="bottom" style="padding:0 0 2px 4px;line-height:0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 56" width="200" height="56" preserveAspectRatio="xMaxYMax meet" style="display:block;">
<rect x="20" y="28" width="14" height="28" fill="#2a3540" opacity="0.85"/>
<rect x="38" y="18" width="18" height="38" fill="#1a2530"/>
<rect x="60" y="24" width="16" height="32" fill="#2a3848"/>
<rect x="82" y="8" width="22" height="48" fill="#1a2530"/>
<rect x="108" y="20" width="20" height="36" fill="#2a3848"/>
<rect x="132" y="14" width="24" height="42" fill="#1a2530"/>
<rect x="160" y="22" width="18" height="34" fill="#2a3848"/>
<rect x="182" y="26" width="16" height="30" fill="#1a2530"/>
</svg>
</td>
<td valign="top" align="right" style="padding:6px 8px 0 4px;vertical-align:top;">
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#1a1a2e;border-radius:3px;"><tr><td style="padding:4px 6px;text-align:center;">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" style="display:block;margin:0 auto;">
<polygon points="11,2 20,7 20,15 11,20 2,15 2,7" fill="none" stroke="#f0b400" stroke-width="1.5"/>
<circle cx="11" cy="11" r="3" fill="#f0b400"/>
</svg>
<p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:5px;font-weight:700;color:#fff;letter-spacing:0.1em;text-transform:uppercase;">COMPANY</p>
</td></tr></table>
</td>
</tr></table>
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
<p style="margin:0 0 3px;font-size:13px;font-weight:800;color:#111;line-height:1.2;">Leave us a review</p>
<p style="margin:0;font-size:10px;font-weight:400;color:#444;">on Trustpilot</p>
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
