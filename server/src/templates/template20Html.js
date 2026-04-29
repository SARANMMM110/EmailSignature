/**
 * Layout 20 — 600×170 neon dark banner (email rail): radial field + hex mesh, swirl behind portrait,
 * Two-line condensed sans name, gradient role chip, deco SVG + swirl, portrait, stroke icons, optional logo.
 */
export const T20_CARD_WIDTH_PX = 600;
export const T20_CARD_HEIGHT_PX = 170;
const T20_W = `${T20_CARD_WIDTH_PX}`;
const T20_H = `${T20_CARD_HEIGHT_PX}`;
const T20_L = '206';
const T20_C = '188';
const T20_R = '206';
const T20_IMG_W = '150';
const T20_IMG_H = '158';
const T20_SWIRL_W = '400';
const T20_SWIRL_H = '252';
const T20_SWIRL_LEFT = '98';
const T20_SWIRL_TOP = '-44';
const T20_FONT =
  "Roboto,system-ui,-apple-system,'Segoe UI',Helvetica,Arial,{{font_family}},sans-serif";
const T20_NAME_FONT =
  "Inter,Roboto,system-ui,-apple-system,'Segoe UI',Helvetica,Arial,{{font_family}},sans-serif";

export const TEMPLATE_20_MARKUP = `<!-- T20: ${T20_W}px × ${T20_H}px — neon dark -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T20_W}" style="width:${T20_W}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T20_FONT};">
<tr>
<td align="center" valign="top" style="padding:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T20_W}" style="width:${T20_W}px;max-width:100%;border-collapse:collapse;">
<tr>
<td width="${T20_W}" height="${T20_H}" valign="top" bgcolor="{{t20_bg}}" background="{{{t20_field_uri}}}" style="width:${T20_W}px;height:${T20_H}px;max-width:100%;padding:0;vertical-align:top;border:0;border-radius:2px;background-color:{{t20_bg}};background-image:url({{{t20_field_uri}}});background-repeat:no-repeat;background-position:50% 50%;background-size:${T20_W}px ${T20_H}px;mso-border-radius-alt:2px;overflow:hidden;position:relative;">
<img src="{{{t20_deco_uri}}}" width="${T20_W}" height="${T20_H}" alt="" style="display:block;width:${T20_W}px;height:${T20_H}px;border:0;position:absolute;left:0;top:0;z-index:0;line-height:0;font-size:0;opacity:0.72;">
<img src="{{{t20_swirl_uri}}}" width="${T20_SWIRL_W}" height="${T20_SWIRL_H}" alt="" style="display:block;width:${T20_SWIRL_W}px;height:${T20_SWIRL_H}px;border:0;position:absolute;left:${T20_SWIRL_LEFT}px;top:${T20_SWIRL_TOP}px;z-index:0;line-height:0;font-size:0;opacity:0.95;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T20_W}" height="${T20_H}" style="width:${T20_W}px;height:${T20_H}px;border-collapse:collapse;table-layout:fixed;position:relative;z-index:1;">
<tr>
<td width="${T20_L}" valign="middle" height="${T20_H}" style="width:${T20_L}px;max-width:${T20_L}px;height:${T20_H}px;padding:10px 4px 10px 16px;vertical-align:middle;background-color:transparent;overflow:hidden;box-sizing:border-box;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:100%;border-collapse:collapse;">
{{#if t20_has_name}}<tr><td style="padding:0 0 10px 0;font-size:21px;font-weight:800;line-height:1.02;letter-spacing:0.015em;text-transform:uppercase;color:{{t20_name_color}};font-family:${T20_NAME_FONT};mso-line-height-rule:exactly;word-break:break-word;overflow-wrap:break-word;-webkit-font-smoothing:antialiased;">{{t20_name_line1_upper}}{{#if t20_has_name_line2}}<br>{{t20_name_line2_upper}}{{/if}}</td></tr>{{/if}}
{{#if t20_role_text}}<tr><td style="padding:0;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="{{t20_role_grad_start}}" style="border-collapse:collapse;background:linear-gradient(90deg,{{t20_role_grad_start}} 0%,{{t20_role_grad_end}} 100%);background-color:{{t20_role_grad_start}};border-radius:14px 4px 14px 4px;mso-border-radius-alt:10px;"><tr><td style="padding:4px 10px 4px 8px;font-size:9px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:{{t20_role_text_color}};mso-line-height-rule:exactly;word-break:break-word;overflow-wrap:break-word;">{{t20_role_text}}</td></tr></table>
</td></tr>{{/if}}
</table>
</td>
<td width="${T20_C}" valign="bottom" align="center" height="${T20_H}" style="width:${T20_C}px;max-width:${T20_C}px;height:${T20_H}px;padding:0 2px 0 2px;vertical-align:bottom;text-align:center;background-color:transparent;line-height:0;font-size:0;overflow:hidden;box-sizing:border-box;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${T20_IMG_W}" height="${T20_IMG_H}" style="display:block;width:${T20_IMG_W}px;height:${T20_IMG_H}px;max-width:100%;margin:0 auto;border:0;object-fit:contain;object-position:50% 100%;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T20_IMG_W}" height="${T20_IMG_H}" style="width:${T20_IMG_W}px;height:${T20_IMG_H}px;max-width:100%;margin:0 auto;border-collapse:collapse;"><tr><td width="${T20_IMG_W}" height="${T20_IMG_H}" align="center" valign="bottom" bgcolor="{{t20_photo_placeholder_bg}}" style="width:${T20_IMG_W}px;height:${T20_IMG_H}px;background-color:{{t20_photo_placeholder_bg}};font-size:20px;font-weight:800;letter-spacing:0.05em;color:{{t20_photo_placeholder_color}};mso-line-height-rule:exactly;vertical-align:middle;">{{name_initials}}</td></tr></table>{{/if}}{{/if}}
</td>
<td width="${T20_R}" valign="middle" height="${T20_H}" style="width:${T20_R}px;max-width:${T20_R}px;height:${T20_H}px;padding:10px 118px 8px 6px;vertical-align:middle;background-color:transparent;overflow:hidden;box-sizing:border-box;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:100%;border-collapse:collapse;font-size:11px;font-weight:400;line-height:1.32;color:{{t20_row_color}};mso-line-height-rule:exactly;table-layout:fixed;">
{{#if has_address}}<tr valign="top"><td width="22" valign="top" style="width:22px;max-width:22px;padding:0 8px 11px 0;vertical-align:top;line-height:0;font-size:0;"><img src="{{{t20_icon_pin}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;-webkit-filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));"></td><td valign="top" style="padding:0 0 11px 0;word-break:break-word;overflow-wrap:break-word;line-height:1.32;">{{t20_address_line1}}{{#if t20_has_address_line2}}<br>{{t20_address_line2}}{{/if}}</td></tr>{{/if}}
{{#if phone}}<tr valign="middle"><td width="22" valign="middle" style="width:22px;max-width:22px;padding:0 8px 11px 0;vertical-align:middle;line-height:0;font-size:0;">{{#if t20_tel_href}}<a href="{{{t20_tel_href}}}" style="text-decoration:none;border:0;line-height:0;">{{/if}}<img src="{{{t20_icon_phone}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;-webkit-filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));">{{#if t20_tel_href}}</a>{{/if}}</td><td valign="middle" style="padding:0 0 11px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-break:keep-all;">{{#if t20_tel_href}}<a href="{{{t20_tel_href}}}" style="color:{{t20_row_color}};text-decoration:none;white-space:nowrap;">{{phone}}</a>{{else}}<span style="white-space:nowrap;">{{phone}}</span>{{/if}}</td></tr>{{/if}}
{{#if email}}<tr valign="middle"><td width="22" valign="middle" style="width:22px;max-width:22px;padding:0 8px 11px 0;vertical-align:middle;line-height:0;font-size:0;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="text-decoration:none;border:0;line-height:0;">{{/if}}<img src="{{{t20_icon_mail}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;-webkit-filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));">{{#if has_mailto}}</a>{{/if}}</td><td valign="middle" style="padding:0 0 11px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-break:keep-all;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t20_row_color}};text-decoration:none;white-space:nowrap;">{{email}}</a>{{else}}<span style="white-space:nowrap;">{{email}}</span>{{/if}}</td></tr>{{/if}}
{{#if has_website}}<tr valign="middle"><td width="22" valign="middle" style="width:22px;max-width:22px;padding:0 8px 6px 0;vertical-align:middle;line-height:0;font-size:0;"><a href="{{{website_full}}}" style="text-decoration:none;border:0;line-height:0;"><img src="{{{t20_icon_globe}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;-webkit-filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));filter:drop-shadow(0 0 3px rgba({{t20_glow_rgb}},0.45));"></a></td><td valign="middle" style="padding:0 0 6px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-break:keep-all;"><a href="{{{website_full}}}" style="color:{{t20_row_color}};text-decoration:none;white-space:nowrap;">{{website}}</a></td></tr>{{/if}}
</table>
</td>
</tr>
</table>
{{#if logo_url}}<img src="{{{logo_url}}}" alt="" height="28" style="display:block;border:0;position:absolute;right:6px;bottom:4px;z-index:2;line-height:0;font-size:0;max-height:30px;max-width:108px;width:auto;height:28px;">{{/if}}
</td>
</tr>
</table>
</td>
</tr>
</table>`;
