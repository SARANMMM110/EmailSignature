/**
 * Layout 19 — 600×210 periwinkle creative card: deck mesh + swirl, sage headline, stroke icons + 2×2 contacts, doodles + framed portrait; right column uses soft shapes (no grid).
 */
export const T19_CARD_WIDTH_PX = 600;
export const T19_CARD_HEIGHT_PX = 210;
const T19_W = `${T19_CARD_WIDTH_PX}`;
const T19_H = `${T19_CARD_HEIGHT_PX}`;
const T19_INNER_W = `${T19_CARD_WIDTH_PX}`;
const T19_INNER_H = `${T19_CARD_HEIGHT_PX}`;
const T19_LEFT = '368';
const T19_RIGHT = '226';
const T19_PHOTO_W = '132';
const T19_PHOTO_H = '168';
const T19_FONT =
  "Inter,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif";
const T19_ICON = '14';
const T19_ICON_COL = '26';

export const TEMPLATE_19_MARKUP = `<!-- T19: ${T19_W}px × ${T19_H}px — periwinkle + sage card -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T19_W}" style="width:${T19_W}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T19_FONT};">
<tr>
<td align="center" valign="top" style="padding:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T19_W}" style="width:${T19_W}px;max-width:100%;border-collapse:collapse;">
<tr>
<td width="${T19_W}" height="${T19_H}" valign="top" bgcolor="{{t19_bg}}" background="{{{t19_deck_uri}}}" style="width:${T19_W}px;height:${T19_H}px;max-width:100%;padding:0;vertical-align:top;border:0;border-radius:24px;background-color:{{t19_bg}};background-image:url({{{t19_deck_uri}}});background-repeat:no-repeat;background-position:0 0;background-size:${T19_W}px ${T19_H}px;mso-border-radius-alt:24px;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T19_INNER_W}" height="${T19_INNER_H}" style="width:${T19_INNER_W}px;height:${T19_INNER_H}px;border-collapse:collapse;position:relative;z-index:1;">
<tr>
<td width="${T19_LEFT}" valign="top" height="${T19_INNER_H}" style="width:${T19_LEFT}px;max-width:${T19_LEFT}px;height:${T19_INNER_H}px;padding:16px 10px 18px 22px;vertical-align:top;background-color:transparent;background-image:url({{{t19_swirl_uri}}});background-repeat:no-repeat;background-position:-8% 50%;background-size:118% auto;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:0 0 8px 0;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td style="padding:0 12px 0 0;line-height:0;vertical-align:middle;"><img src="{{{t19_saturn_uri}}}" width="34" height="34" alt="" style="display:block;width:34px;height:34px;border:0;"></td>
<td style="padding:0;line-height:0;vertical-align:middle;"><img src="{{{t19_puzzle_uri}}}" width="38" height="30" alt="" style="display:block;width:38px;height:30px;border:0;"></td>
</tr></table>
</td></tr>
<tr><td style="padding:0 0 4px 0;font-size:28px;font-weight:800;line-height:1.05;letter-spacing:-0.03em;color:{{t19_sage}};mso-line-height-rule:exactly;">{{name}}</td></tr>
{{#if title}}<tr><td style="padding:0 0 12px 0;font-size:16px;font-weight:700;line-height:1.2;color:{{t19_ink}};mso-line-height-rule:exactly;">{{title}}</td></tr>{{/if}}
<tr><td style="padding:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:340px;border-collapse:collapse;font-size:11.5px;font-weight:400;line-height:1.35;color:{{t19_ink}};mso-line-height-rule:exactly;">
{{#if t19_has_contact_row1}}<tr valign="top">
<td width="50%" valign="top" style="width:50%;max-width:168px;padding:0 12px 8px 0;vertical-align:top;">
{{#if has_address}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T19_ICON_COL}" valign="top" style="width:${T19_ICON_COL}px;min-width:${T19_ICON_COL}px;padding:2px 10px 0 0;vertical-align:top;line-height:0;font-size:0;"><img src="{{{t19_icon_pin}}}" width="${T19_ICON}" height="${T19_ICON}" alt="" style="display:block;width:${T19_ICON}px;height:${T19_ICON}px;max-width:${T19_ICON}px;border:0;"></td><td valign="top" style="padding:0;font-size:11.5px;font-weight:400;line-height:1.35;color:{{t19_ink}};mso-line-height-rule:exactly;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr></table>{{else}}<span style="font-size:11.5px;line-height:1.35;">&#8203;</span>{{/if}}
</td>
<td width="50%" valign="top" style="width:50%;padding:0 0 8px 0;vertical-align:top;">
{{#if email}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T19_ICON_COL}" valign="middle" style="width:${T19_ICON_COL}px;min-width:${T19_ICON_COL}px;padding:1px 10px 0 0;vertical-align:middle;line-height:0;font-size:0;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="text-decoration:none;border:0;line-height:0;">{{/if}}<img src="{{{t19_icon_mail}}}" width="${T19_ICON}" height="${T19_ICON}" alt="" style="display:block;width:${T19_ICON}px;height:${T19_ICON}px;max-width:${T19_ICON}px;border:0;">{{#if has_mailto}}</a>{{/if}}</td><td valign="middle" style="padding:0;font-size:11.5px;font-weight:400;line-height:1.35;color:{{t19_ink}};mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t19_ink}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr></table>{{else}}<span style="font-size:11.5px;line-height:1.35;">&#8203;</span>{{/if}}
</td>
</tr>{{/if}}
{{#if t19_has_contact_row2}}<tr valign="middle">
<td width="50%" valign="middle" style="width:50%;max-width:168px;padding:0 12px 0 0;vertical-align:middle;">
{{#if phone}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T19_ICON_COL}" valign="middle" style="width:${T19_ICON_COL}px;min-width:${T19_ICON_COL}px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;">{{#if t19_tel_href}}<a href="{{{t19_tel_href}}}" style="text-decoration:none;border:0;line-height:0;">{{/if}}<img src="{{{t19_icon_phone}}}" width="${T19_ICON}" height="${T19_ICON}" alt="" style="display:block;width:${T19_ICON}px;height:${T19_ICON}px;max-width:${T19_ICON}px;border:0;">{{#if t19_tel_href}}</a>{{/if}}</td><td valign="middle" style="padding:0;font-size:11.5px;font-weight:400;line-height:1.35;color:{{t19_ink}};mso-line-height-rule:exactly;">{{#if t19_tel_href}}<a href="{{{t19_tel_href}}}" style="color:{{t19_ink}};text-decoration:none;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td></tr></table>{{else}}<span style="font-size:11.5px;line-height:1.35;">&#8203;</span>{{/if}}
</td>
<td width="50%" valign="middle" style="width:50%;padding:0;vertical-align:middle;">
{{#if has_website}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T19_ICON_COL}" valign="middle" style="width:${T19_ICON_COL}px;min-width:${T19_ICON_COL}px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;"><a href="{{{website_full}}}" style="text-decoration:none;border:0;line-height:0;"><img src="{{{t19_icon_globe}}}" width="${T19_ICON}" height="${T19_ICON}" alt="" style="display:block;width:${T19_ICON}px;height:${T19_ICON}px;max-width:${T19_ICON}px;border:0;"></a></td><td valign="middle" style="padding:0;font-size:11.5px;font-weight:400;line-height:1.35;color:{{t19_ink}};mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t19_ink}};text-decoration:none;">{{website}}</a></td></tr></table>{{else}}<span style="font-size:11.5px;line-height:1.35;">&#8203;</span>{{/if}}
</td>
</tr>{{/if}}
</table>
</td></tr>
</table>
</td>
<td width="${T19_RIGHT}" valign="bottom" align="center" height="${T19_INNER_H}" style="width:${T19_RIGHT}px;max-width:${T19_RIGHT}px;height:${T19_INNER_H}px;padding:0 14px 12px 0;vertical-align:bottom;text-align:center;line-height:0;font-size:0;background-color:transparent;background-image:url({{{t19_right_panel_uri}}});background-repeat:no-repeat;background-position:right top;background-size:${T19_RIGHT}px ${T19_INNER_H}px;position:relative;">
<img src="{{{t19_scribble_uri}}}" width="160" height="96" alt="" style="display:block;width:160px;height:96px;border:0;position:absolute;left:4px;top:8px;z-index:2;">
<img src="{{{t19_sparkle_uri}}}" width="22" height="22" alt="" style="display:block;width:22px;height:22px;border:0;position:absolute;right:10px;top:10px;z-index:3;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:collapse;position:relative;z-index:4;box-shadow:6px 10px 18px rgba(25,30,80,0.32);">
<tr><td style="padding:7px;line-height:0;background-color:{{t19_frame_ring}};border-radius:18px;border:2px solid rgba(255,255,255,0.35);mso-border-radius-alt:18px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:{{t19_sage}};border-radius:12px;mso-border-radius-alt:12px;">
<tr><td style="padding:6px;line-height:0;font-size:0;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${T19_PHOTO_W}" height="${T19_PHOTO_H}" style="display:block;width:${T19_PHOTO_W}px;height:${T19_PHOTO_H}px;border:0;border-radius:12px;object-fit:cover;object-position:50% 20%;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T19_PHOTO_W}" height="${T19_PHOTO_H}" style="width:${T19_PHOTO_W}px;height:${T19_PHOTO_H}px;border-collapse:collapse;"><tr><td width="${T19_PHOTO_W}" height="${T19_PHOTO_H}" align="center" valign="middle" bgcolor="{{t19_photo_placeholder_bg}}" style="width:${T19_PHOTO_W}px;height:${T19_PHOTO_H}px;background-color:{{t19_photo_placeholder_bg}};font-size:26px;font-weight:700;letter-spacing:0.04em;color:{{t19_photo_placeholder_color}};mso-line-height-rule:exactly;vertical-align:middle;border-radius:12px;">{{name_initials}}</td></tr></table>{{/if}}{{/if}}
</td></tr>
</table>
</td></tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
