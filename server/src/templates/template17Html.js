/**
 * Layout 17 — 600px white card + lime footer bar (Blue Rayhan–style reference, email-safe tables).
 * Designation (job title) appears only under the name; left rail is blank; top row is ticks only; no “Hello!”.
 * Photo: lime frame; badge overlaps bottom-right of frame (reference layout).
 * Deco: rail spine SVG, top-right header cluster, footer band wave above lime bar.
 */
const T17_FONT = "'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif";
const T17_OUTER = '600';
const T17_SIDEBAR = '20';
const T17_MAIN = '580';
const T17_PHOTO = '80';
const T17_BADGE = '50';
/** Photo cell inner width: image + 2px border each side */
const T17_PHOTO_FRAME = '84';
/** Negative margin pulls badge up over bottom-right of frame */
const T17_BADGE_LIFT = '28';
/** Photo column width (frame + badge hang) */
const T17_PHOTO_COL = '126';

export const TEMPLATE_17_MARKUP = `<!-- T17: outer ${T17_OUTER}px — slim rail + card + lime bar -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T17_OUTER}" style="width:${T17_OUTER}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T17_FONT};">
<tr>
<td colspan="2" style="padding:0;margin:0;border:1px solid #e0e0e0;background-color:#ffffff;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td width="${T17_SIDEBAR}" valign="middle" align="center" style="width:${T17_SIDEBAR}px;max-width:${T17_SIDEBAR}px;vertical-align:middle;border-right:1px solid #ebebeb;padding:8px 0;font-size:0;line-height:0;text-align:center;"><img src="{{{t17_rail_spine_uri}}}" width="12" height="96" alt="" style="display:block;width:12px;height:96px;margin:0 auto;border:0;"></td>
<td width="${T17_MAIN}" valign="middle" style="width:${T17_MAIN}px;max-width:${T17_MAIN}px;vertical-align:middle;padding:14px 16px 24px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td colspan="3" style="padding:0;line-height:0;font-size:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td valign="top" style="padding:0 0 8px 6px;line-height:0;font-size:0;vertical-align:top;">
<img src="{{{t17_top_lines_uri}}}" width="22" height="12" alt="" style="display:block;width:22px;height:12px;border:0;">
</td>
<td valign="top" align="right" width="120" style="width:120px;max-width:120px;padding:0 6px 8px 0;line-height:0;font-size:0;vertical-align:top;text-align:right;">
<img src="{{{t17_header_cluster_uri}}}" width="108" height="36" alt="" style="display:block;width:108px;height:36px;margin-left:auto;border:0;">
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td width="${T17_PHOTO_COL}" valign="middle" align="center" style="width:${T17_PHOTO_COL}px;max-width:${T17_PHOTO_COL}px;padding:8px 0 0 0;vertical-align:middle;line-height:0;font-size:0;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T17_PHOTO_FRAME}" align="center" style="width:${T17_PHOTO_FRAME}px;border-collapse:collapse;margin:0 auto;">
<tr><td align="center" valign="top" style="padding:0;line-height:0;font-size:0;text-align:center;position:relative;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;position:relative;z-index:1;"><tr><td style="padding:0;border:2px solid {{t17_lime}};line-height:0;font-size:0;background-color:#e5e5e5;position:relative;z-index:1;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${T17_PHOTO}" height="${T17_PHOTO}" style="display:block;width:${T17_PHOTO}px;height:${T17_PHOTO}px;border:0;object-fit:cover;position:relative;z-index:1;">{{else}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T17_PHOTO}" height="${T17_PHOTO}" style="width:${T17_PHOTO}px;height:${T17_PHOTO}px;border-collapse:collapse;position:relative;z-index:1;"><tr><td width="${T17_PHOTO}" height="${T17_PHOTO}" align="center" valign="middle" bgcolor="{{t17_photo_placeholder_bg}}" style="width:${T17_PHOTO}px;height:${T17_PHOTO}px;background-color:{{t17_photo_placeholder_bg}};font-size:19px;font-weight:800;color:{{t17_photo_placeholder_color}};mso-line-height-rule:exactly;font-family:${T17_FONT};">{{name_initials}}</td></tr></table>{{/if}}
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin-top:-${T17_BADGE_LIFT}px;margin-right:-5px;margin-left:auto;margin-bottom:0;mso-margin-top-alt:-${T17_BADGE_LIFT}px;mso-margin-right-alt:-5px;position:relative;z-index:4;"><tr><td style="padding:0;line-height:0;font-size:0;position:relative;z-index:4;">
<img src="{{{t17_badge_uri}}}" width="${T17_BADGE}" height="${T17_BADGE}" alt="" style="display:block;width:${T17_BADGE}px;height:${T17_BADGE}px;border:0;position:relative;z-index:4;">
</td></tr></table>
</td></tr>
</table>
</td>
<td width="46%" valign="middle" style="width:46%;max-width:248px;padding:8px 14px 0 18px;vertical-align:middle;border-right:1px solid #e0e0e0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:6px 0 0 0;font-size:22px;font-weight:800;line-height:1.08;color:{{t17_name_ink}};text-transform:uppercase;letter-spacing:0.6px;mso-line-height-rule:exactly;font-family:${T17_FONT};">{{t3_name_first_upper}}</td></tr>
{{#if t3_has_name_last}}<tr><td style="padding:2px 0 0 0;font-size:22px;font-weight:800;line-height:1.08;color:{{t17_lime}};text-transform:uppercase;letter-spacing:0.6px;mso-line-height-rule:exactly;font-family:${T17_FONT};">{{t3_name_last_upper}}</td></tr>{{/if}}
<tr><td style="padding:10px 0 0 0;border-top:1px solid #cccccc;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td valign="middle" style="padding:4px 6px 0 0;font-size:11px;font-weight:500;color:{{t17_body_text}};letter-spacing:0.2px;mso-line-height-rule:exactly;font-family:${T17_FONT};line-height:1.3;">{{#if title}}{{title}}{{else}}&nbsp;{{/if}}</td>
<td valign="middle" style="padding:4px 0 0 0;line-height:0;font-size:0;"><img src="{{{t17_title_arrow_uri}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;"></td>
</tr></table>
</td></tr>
</table>
</td>
<td width="54%" valign="middle" style="width:54%;padding:8px 0 0 18px;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
{{#if has_address}}<tr><td width="18" valign="middle" style="width:18px;padding:0 6px 8px 0;vertical-align:middle;line-height:0;"><img src="{{{t17_icon_pin}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;"></td><td valign="middle" style="padding:0 0 8px 0;font-size:11px;font-weight:400;color:{{t17_body_text}};line-height:1.38;mso-line-height-rule:exactly;font-family:${T17_FONT};">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>{{/if}}
{{#if phone}}<tr><td width="18" valign="middle" style="width:18px;padding:0 6px 8px 0;vertical-align:middle;line-height:0;">{{#if t17_tel_href}}<a href="{{{t17_tel_href}}}" style="text-decoration:none;border:0;">{{/if}}<img src="{{{t17_icon_phone}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;">{{#if t17_tel_href}}</a>{{/if}}</td><td valign="middle" style="padding:0 0 8px 0;font-size:11px;font-weight:400;color:{{t17_body_text}};line-height:1.38;mso-line-height-rule:exactly;font-family:${T17_FONT};">{{#if t17_tel_href}}<a href="{{{t17_tel_href}}}" style="color:{{t17_body_text}};text-decoration:none;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td></tr>{{/if}}
{{#if email}}<tr><td width="18" valign="middle" style="width:18px;padding:0 6px 8px 0;vertical-align:middle;line-height:0;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="text-decoration:none;border:0;">{{/if}}<img src="{{{t17_icon_mail}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;">{{#if has_mailto}}</a>{{/if}}</td><td valign="middle" style="padding:0 0 8px 0;font-size:11px;font-weight:400;color:{{t17_body_text}};line-height:1.38;mso-line-height-rule:exactly;font-family:${T17_FONT};">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t17_body_text}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr>{{/if}}
{{#if has_website}}<tr><td width="18" valign="middle" style="width:18px;padding:0 6px 0 0;vertical-align:middle;line-height:0;"><a href="{{{website_full}}}" style="text-decoration:none;border:0;"><img src="{{{t17_icon_globe}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;border:0;"></a></td><td valign="middle" style="padding:0;font-size:11px;font-weight:400;line-height:1.38;mso-line-height-rule:exactly;font-family:${T17_FONT};"><a href="{{{website_full}}}" style="color:{{t17_body_text}};text-decoration:none;">{{website}}</a></td></tr>{{/if}}
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0 0 0;line-height:0;font-size:0;text-align:center;">
<img src="{{{t17_footer_band_uri}}}" width="560" height="18" alt="" style="display:block;width:100%;max-width:560px;height:18px;margin:0 auto;border:0;">
</td></tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td colspan="2" height="12" bgcolor="{{t17_footer_lime}}" style="height:12px;line-height:12px;font-size:0;background-color:{{t17_footer_lime}};padding:0;margin:0;border:0;">&#160;</td>
</tr>
</table>`;
