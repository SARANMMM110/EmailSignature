/**
 * Layout 13 — reference card: large “I’M”, yellow photo rail, bold white name,
 * solid yellow arrowhead (tip up-left) beside first name line, yellow job title, white contact rows.
 * Tokens from `buildTemplate13PaletteContext` + standard `contextFromEditorPayload` fields.
 *
 * Typography: Archivo (Google Fonts) + system sans fallbacks for email clients that strip web fonts.
 */
const T13_FONT = "'Archivo',Helvetica,Arial,sans-serif";

export const TEMPLATE_13_MARKUP = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T13_FONT};border:0;">
<tr>
<td width="600" valign="top" bgcolor="{{t13_shell_bg}}" style="width:600px;vertical-align:top;padding:0;border:0;border-radius:18px;-webkit-border-radius:18px;overflow:hidden;background-color:{{t13_shell_bg}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;font-family:${T13_FONT};">
<tr>
<td width="56" valign="top" style="width:56px;max-width:56px;vertical-align:top;padding:20px 0 20px 20px;">
<div style="font-size:16px;font-weight:700;letter-spacing:0.12em;color:{{t13_text}};line-height:1;mso-line-height-rule:exactly;">I&#8217;M</div>
</td>
<td width="118" valign="bottom" align="center" style="width:118px;max-width:118px;vertical-align:bottom;padding:0 4px 0 0;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td align="center" valign="bottom" bgcolor="{{t13_accent}}" style="padding:0;width:104px;vertical-align:bottom;background-color:{{t13_accent}};border-radius:16px 16px 0 0;-webkit-border-radius:16px 16px 0 0;">
{{#if photo_url}}<img src="{{{photo_url}}}" width="104" height="158" alt="" style="display:block;width:104px;height:158px;border:0;object-fit:cover;object-position:center top;">{{else}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="104" height="158" style="width:104px;height:158px;border-collapse:collapse;"><tr><td width="104" height="158" align="center" valign="middle" bgcolor="{{t13_photo_placeholder_bg}}" style="width:104px;height:158px;background-color:{{t13_photo_placeholder_bg}};font-family:${T13_FONT};font-size:18px;font-weight:700;color:{{t13_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}
</td></tr></table>
</td>
<td width="220" valign="middle" style="width:220px;max-width:220px;vertical-align:middle;padding:12px 8px 12px 4px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td valign="top" style="padding:0;line-height:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td style="padding:0;font-size:24px;font-weight:800;line-height:26px;color:{{t13_text}};letter-spacing:0.03em;text-transform:uppercase;mso-line-height-rule:exactly;">{{t13_name_line1_upper}}</td>
<td width="20" valign="top" style="width:20px;padding:5px 0 0 4px;line-height:0;vertical-align:top;"><img src="{{{t13_cursor}}}" width="16" height="16" alt="" style="display:block;width:16px;height:16px;border:0;"></td>
</tr>
{{#if t13_has_name_second_line}}<tr><td colspan="2" style="padding:3px 0 0 0;font-size:24px;font-weight:800;line-height:26px;color:{{t13_text}};letter-spacing:0.03em;text-transform:uppercase;mso-line-height-rule:exactly;">{{t13_name_line2_upper}}</td></tr>{{/if}}
</table>
</td>
</tr>
{{#if title}}<tr><td style="padding:10px 0 0 0;font-size:10px;font-weight:800;line-height:13px;color:{{t13_accent}};letter-spacing:0.14em;text-transform:uppercase;mso-line-height-rule:exactly;">{{t13_title_upper}}</td></tr>{{/if}}
</table>
</td>
<td width="206" valign="middle" style="width:206px;max-width:206px;vertical-align:middle;padding:14px 22px 14px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
{{#if has_address}}<tr><td width="22" valign="top" style="width:22px;padding:0 10px 18px 0;vertical-align:top;line-height:0;"><img src="{{{t13_icon_pin}}}" width="13" height="13" alt="" style="display:block;width:13px;height:13px;border:0;"></td><td valign="top" style="padding:0 0 18px 0;font-size:9px;font-weight:600;line-height:13px;color:{{t13_text}};letter-spacing:0.06em;text-transform:uppercase;mso-line-height-rule:exactly;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>{{/if}}
{{#if email}}<tr><td width="22" valign="middle" style="width:22px;padding:0 10px 18px 0;vertical-align:middle;line-height:0;"><img src="{{{t13_icon_mail}}}" width="13" height="13" alt="" style="display:block;width:13px;height:13px;border:0;"></td><td valign="middle" style="padding:0 0 18px 0;font-size:9px;font-weight:600;line-height:13px;color:{{t13_text}};letter-spacing:0.06em;text-transform:uppercase;mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t13_text}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr>{{/if}}
{{#if has_website}}<tr><td width="22" valign="middle" style="width:22px;padding:0 10px 18px 0;vertical-align:middle;line-height:0;"><img src="{{{t13_icon_globe}}}" width="13" height="13" alt="" style="display:block;width:13px;height:13px;border:0;"></td><td valign="middle" style="padding:0 0 18px 0;font-size:9px;font-weight:600;line-height:13px;color:{{t13_text}};letter-spacing:0.06em;text-transform:uppercase;mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t13_text}};text-decoration:none;">{{website}}</a></td></tr>{{/if}}
{{#if phone}}<tr><td width="22" valign="middle" style="width:22px;padding:0 10px 0 0;vertical-align:middle;line-height:0;"><img src="{{{t13_icon_phone}}}" width="13" height="13" alt="" style="display:block;width:13px;height:13px;border:0;"></td><td valign="middle" style="padding:0;font-size:9px;font-weight:600;line-height:13px;color:{{t13_text}};letter-spacing:0.06em;text-transform:uppercase;mso-line-height-rule:exactly;">{{phone}}</td></tr>{{/if}}
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
