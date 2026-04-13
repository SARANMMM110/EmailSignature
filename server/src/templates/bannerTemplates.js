/**
 * CTA banner strips — inline CSS, table layout. Compiled with Handlebars + banner_link, colors.
 */

export const BANNER_TEMPLATES = {
  /** Webinar CTA — dark charcoal card, left copy + white pill button, right ascending bar graphic. */
  banner_1: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:12px;overflow:hidden;background-color:{{banner_bg_mid}};background-image:linear-gradient(148deg,{{banner_bg_start}} 0%,{{banner_bg_mid}} 45%,{{banner_bg_end}} 100%);">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td width="64%" valign="middle" style="width:64%;min-height:{{banner_min_height}}px;padding:12px 8px 12px 14px;vertical-align:middle;">
<p style="margin:0;padding:0;color:{{banner_headline_color}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:15px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;">{{{banner_headline}}}</p>
<p style="margin:4px 0 0;padding:0;color:{{banner_subline_color}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:10px;font-weight:400;line-height:1.35;">{{{banner_subline}}}</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:9px 0 0 0;"><tr><td style="padding:0;">
<a href="{{{banner_link}}}" style="display:inline-block;background-color:{{banner_cta_bg}};color:{{banner_cta_text}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:10px;font-weight:600;text-decoration:none;padding:6px 14px;border-radius:999px;line-height:1.2;mso-padding-alt:6px 14px;">{{{banner_text}}}</a>
</td></tr></table>
</td>
<td width="36%" valign="bottom" align="right" style="width:36%;min-height:{{banner_min_height}}px;padding:0 6px 0 0;vertical-align:bottom;line-height:0;text-align:right;font-size:0;">
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="65" viewBox="0 0 132 108" fill="none" aria-hidden="true" style="display:block;margin:0 0 0 auto;max-width:100%;height:auto;">
<rect x="74" y="82" width="14" height="26" rx="4" fill="{{banner_bar_1}}" fill-opacity="0.5"/>
<rect x="85" y="70" width="14" height="38" rx="4" fill="{{banner_bar_2}}" fill-opacity="0.52"/>
<rect x="96" y="56" width="14" height="52" rx="4" fill="{{banner_bar_3}}" fill-opacity="0.54"/>
<rect x="107" y="40" width="14" height="68" rx="4" fill="{{banner_bar_4}}" fill-opacity="0.56"/>
<rect x="118" y="22" width="14" height="86" rx="4" fill="{{banner_bar_5}}" fill-opacity="0.58"/>
</svg>
</td>
</tr>
</table>
</td>
</tr>
</table>`,

  /** Compact resume / download strip (previous banner_1). */
  banner_2: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="background-color:{{color_1}};padding:10px 16px;border-radius:10px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td width="60%" style="color:#ffffff;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:12px;font-weight:700;">Download my Resume</td>
<td width="40%" align="right"><a href="{{{banner_link}}}" style="background-color:#ffffff;color:{{color_1}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:5px 12px;border-radius:18px;display:inline-block;">Download</a></td>
</tr>
</table>
</td></tr>
</table>`,

  banner_3: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="background-color:{{color_3}};padding:10px 16px;border-radius:7px;">
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
<tr>
<td width="55%" style="color:{{color_1}};font-family:Arial,sans-serif;font-size:12px;font-weight:700;">Book a call today</td>
<td width="45%" align="right"><a href="{{{banner_link}}}" style="color:{{color_1}};font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-decoration:none;">Schedule now</a></td>
</tr>
</table>
</td></tr>
</table>`,

  banner_4: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="470" style="width:470px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="background-color:{{color_1}};padding:12px 16px;border-radius:7px;">
<table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
<tr>
<td width="50%"><p style="margin:0;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;">Need a call?</p></td>
<td width="50%" align="right"><a href="{{{banner_link}}}" style="background-color:#3d4cff;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:6px 13px;border-radius:5px;display:inline-block;border:1px solid #8fa4ff;">Pick a slot now</a></td>
</tr>
</table>
</td></tr>
</table>`,
};

/**
 * Map editor preset_id / banner id string → BANNER_TEMPLATES key.
 * Order: specific matches before generic "call".
 */
export function resolveBannerKey(banner) {
  if (!banner) return null;
  const id = String(banner.id || banner.preset_id || '').toLowerCase();
  if (id.includes('webinar')) return 'banner_1';
  if (id.includes('download') || id.includes('resume')) return 'banner_2';
  if (id.includes('need')) return 'banner_4';
  if (id.includes('book') || id.includes('call')) return 'banner_3';
  return 'banner_3';
}
