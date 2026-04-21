/**
 * Layout 18 — ~521×210 card: CSS linear-gradient + full-bleed SVG mesh `<img>` + Builder edge strips, name headline, sage brand,
 * grey role/contacts (address|email row, then phone|website row), sage SVG contact icons, portrait right (email-safe tables).
 */
export const T18_CARD_HEIGHT_PX = 210;
const T18_W = '521';
const T18_H = `${T18_CARD_HEIGHT_PX}`;
const T18_CONTENT = '340';
const T18_PHOTO = '181';
/** Uniform contact icon size (viewBox 12 → crisp at 14px in clients). */
const T18_ICON = '14';
const T18_ICON_COL = '30';
const T18_FONT =
  "Inter,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif";

/** Builder edge strips (reference layout). */
const T18_BORDER_TOP_H = '3';
const T18_BORDER_RIGHT_W = '2';

export const TEMPLATE_18_MARKUP = `<!-- T18: ${T18_W}px × ${T18_H}px — Zubrilka-style card -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T18_W}" style="width:${T18_W}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T18_FONT};">
<tr>
<td align="center" valign="top" style="padding:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T18_W}" style="width:${T18_W}px;max-width:100%;border-collapse:collapse;border-radius:18px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);mso-border-radius-alt:18px;">
<tr>
<td width="${T18_W}" height="${T18_H}" valign="top" style="width:${T18_W}px;height:${T18_H}px;max-width:100%;padding:0;vertical-align:top;position:relative;overflow:hidden;background-color:{{t18_bg_solid}};background-image:{{{t18_bg_css_grad}}};background-size:100% 100%;background-repeat:no-repeat;border-radius:18px;mso-border-radius-alt:18px;">
<img src="{{{t18_bg_layer_uri}}}" width="${T18_W}" height="${T18_H}" alt="" style="display:block;width:${T18_W}px;height:${T18_H}px;border:0;position:absolute;left:0;top:0;z-index:0;line-height:0;font-size:0;">
<img src="{{{t18_border_top_url}}}" width="${T18_W}" height="${T18_BORDER_TOP_H}" alt="" style="display:block;width:${T18_W}px;height:${T18_BORDER_TOP_H}px;border:0;position:absolute;left:0;top:0;z-index:2;">
<img src="{{{t18_border_right_url}}}" width="${T18_BORDER_RIGHT_W}" height="${T18_H}" alt="" style="display:block;width:${T18_BORDER_RIGHT_W}px;height:${T18_H}px;border:0;position:absolute;top:0;right:0;z-index:2;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T18_W}" height="${T18_H}" style="width:${T18_W}px;height:${T18_H}px;border-collapse:collapse;position:relative;z-index:3;">
<tr>
<td width="${T18_CONTENT}" valign="top" style="width:${T18_CONTENT}px;max-width:${T18_CONTENT}px;padding:22px 12px 22px 24px;vertical-align:top;background-color:transparent;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:0 0 8px 0;font-size:18px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;color:{{t18_brand}};mso-line-height-rule:exactly;">{{t18_brand_line}}</td></tr>
{{#if title}}<tr><td style="padding:0 0 22px 0;font-size:21px;font-weight:400;line-height:1.12;letter-spacing:-0.02em;color:{{t18_role}};mso-line-height-rule:exactly;">{{title}}</td></tr>{{/if}}
<tr><td style="padding:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
{{#if t18_has_contact_row1}}<tr valign="top">
<td width="50%" valign="top" style="width:50%;max-width:172px;padding:0 14px 14px 0;vertical-align:top;">
{{#if has_address}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T18_ICON_COL}" valign="top" style="width:${T18_ICON_COL}px;min-width:${T18_ICON_COL}px;padding:3px 10px 0 0;vertical-align:top;line-height:0;font-size:0;"><img src="{{{t18_icon_pin}}}" width="${T18_ICON}" height="${T18_ICON}" alt="" style="display:block;width:${T18_ICON}px;height:${T18_ICON}px;max-width:${T18_ICON}px;border:0;line-height:0;"></td><td valign="top" style="padding:0;font-size:11px;font-weight:400;line-height:1.45;color:{{t18_addr}};mso-line-height-rule:exactly;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr></table>{{else}}<span style="font-size:11px;line-height:1.45;">&#8203;</span>{{/if}}
</td>
<td width="50%" valign="top" style="width:50%;padding:0 0 14px 0;vertical-align:top;">
{{#if email}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T18_ICON_COL}" valign="middle" style="width:${T18_ICON_COL}px;min-width:${T18_ICON_COL}px;padding:2px 10px 0 0;vertical-align:middle;line-height:0;font-size:0;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="text-decoration:none;border:0;line-height:0;">{{/if}}<img src="{{{t18_icon_mail}}}" width="${T18_ICON}" height="${T18_ICON}" alt="" style="display:block;width:${T18_ICON}px;height:${T18_ICON}px;max-width:${T18_ICON}px;border:0;">{{#if has_mailto}}</a>{{/if}}</td><td valign="middle" style="padding:0;font-size:11px;font-weight:400;line-height:1.45;color:{{t18_email}};mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t18_email}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr></table>{{else}}<span style="font-size:11px;line-height:1.45;">&#8203;</span>{{/if}}
</td>
</tr>{{/if}}
{{#if t18_has_contact_row2}}<tr valign="middle">
<td width="50%" valign="middle" style="width:50%;max-width:172px;padding:0 14px 0 0;vertical-align:middle;">
{{#if phone}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T18_ICON_COL}" valign="middle" style="width:${T18_ICON_COL}px;min-width:${T18_ICON_COL}px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;">{{#if t18_tel_href}}<a href="{{{t18_tel_href}}}" style="text-decoration:none;border:0;line-height:0;">{{/if}}<img src="{{{t18_icon_phone}}}" width="${T18_ICON}" height="${T18_ICON}" alt="" style="display:block;width:${T18_ICON}px;height:${T18_ICON}px;max-width:${T18_ICON}px;border:0;">{{#if t18_tel_href}}</a>{{/if}}</td><td valign="middle" style="padding:0;font-size:11px;font-weight:400;line-height:1.45;color:{{t18_phone}};mso-line-height-rule:exactly;">{{#if t18_tel_href}}<a href="{{{t18_tel_href}}}" style="color:{{t18_phone}};text-decoration:none;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td></tr></table>{{else}}<span style="font-size:11px;line-height:1.45;">&#8203;</span>{{/if}}
</td>
<td width="50%" valign="middle" style="width:50%;padding:0;vertical-align:middle;">
{{#if has_website}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td width="${T18_ICON_COL}" valign="middle" style="width:${T18_ICON_COL}px;min-width:${T18_ICON_COL}px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;"><a href="{{{website_full}}}" style="text-decoration:none;border:0;line-height:0;"><img src="{{{t18_icon_globe}}}" width="${T18_ICON}" height="${T18_ICON}" alt="" style="display:block;width:${T18_ICON}px;height:${T18_ICON}px;max-width:${T18_ICON}px;border:0;"></a></td><td valign="middle" style="padding:0;font-size:11px;font-weight:400;line-height:1.45;color:{{t18_web}};mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t18_web}};text-decoration:none;">{{website}}</a></td></tr></table>{{else}}<span style="font-size:11px;line-height:1.45;">&#8203;</span>{{/if}}
</td>
</tr>{{/if}}
</table>
</td></tr>
</table>
</td>
<td width="${T18_PHOTO}" valign="bottom" align="right" height="${T18_H}" style="width:${T18_PHOTO}px;max-width:${T18_PHOTO}px;height:${T18_H}px;padding:0;vertical-align:bottom;text-align:right;line-height:0;font-size:0;background-color:transparent;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${T18_PHOTO}" height="${T18_H}" style="display:block;width:${T18_PHOTO}px;height:${T18_H}px;border:0;object-fit:cover;object-position:50% 100%;">{{else}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T18_PHOTO}" height="${T18_H}" style="width:${T18_PHOTO}px;height:${T18_H}px;border-collapse:collapse;"><tr><td width="${T18_PHOTO}" height="${T18_H}" align="center" valign="bottom" bgcolor="{{t18_photo_placeholder_bg}}" style="width:${T18_PHOTO}px;height:${T18_H}px;background-color:{{t18_photo_placeholder_bg}};font-size:28px;font-weight:700;letter-spacing:0.04em;color:{{t18_photo_placeholder_color}};mso-line-height-rule:exactly;padding:0 0 14px 0;vertical-align:bottom;">{{name_initials}}</td></tr></table>{{/if}}
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
