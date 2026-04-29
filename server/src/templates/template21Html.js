/**
 * Layout 21 — 620×172 warm beige fashion rail (email-safe tables): left brand rail + vertical role,
 * arched photo on cream panel, serif name + company, grey divider, P/E/A contacts (vertically centered), tagline, bronze accent strip.
 */
export const T21_CARD_WIDTH_PX = 620;
export const T21_CARD_HEIGHT_PX = 172;
const T21_W = `${T21_CARD_WIDTH_PX}`;
const T21_H = `${T21_CARD_HEIGHT_PX}`;
const T21_LEFT_INNER = `${T21_CARD_HEIGHT_PX - 16}`;
const T21_ROLE_H = `${Math.max(70, T21_CARD_HEIGHT_PX - 72)}`;
const T21_PHOTO_H = '112';
const T21_DIV_H = '92';

export const TEMPLATE_21_MARKUP = `<!-- T21: ${T21_W}×${T21_H} — warm beige fashion rail -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T21_W}" style="width:${T21_W}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">
<tr>
<td width="52" valign="top" height="${T21_H}" bgcolor="{{t21_shell}}" style="width:52px;max-width:52px;height:${T21_H}px;background-color:{{t21_shell}};padding:8px 6px 8px 10px;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" height="${T21_LEFT_INNER}" style="height:${T21_LEFT_INNER}px;border-collapse:collapse;">
<tr><td valign="top" style="padding:0 0 4px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:10px;line-height:1.2;color:{{t21_ink}};">{{t21_brand_dot}}</td></tr>
<tr><td valign="middle" align="center" height="${T21_ROLE_H}" style="height:${T21_ROLE_H}px;padding:0;vertical-align:middle;text-align:center;">{{#if t21_has_vertical_role}}<span style="display:inline-block;max-height:${T21_ROLE_H}px;overflow:hidden;writing-mode:vertical-rl;-webkit-writing-mode:vertical-rl;-ms-writing-mode:tb-rl;text-orientation:mixed;transform:rotate(180deg);-webkit-transform:rotate(180deg);font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;font-size:8px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:{{t21_ink}};line-height:1.2;">{{t21_vertical_role}}</span>{{/if}}</td></tr>
<tr><td valign="bottom" align="center" style="padding:4px 0 0 0;text-align:center;line-height:0;font-size:0;">{{#if t21_has_cta}}<a href="{{{t21_cta_href}}}" style="text-decoration:none;">{{/if}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="26" height="26" bgcolor="{{t21_bronze}}" style="width:26px;height:26px;border-collapse:collapse;background-color:{{t21_bronze}};mso-line-height-rule:exactly;"><tr><td align="center" valign="middle" style="padding:0;line-height:0;font-size:0;"><img src="{{{t21_arrow_uri}}}" width="11" height="11" alt="" style="display:block;width:11px;height:11px;border:0;"></td></tr></table>{{#if t21_has_cta}}</a>{{/if}}</td></tr>
</table>
</td>
<td width="124" valign="bottom" align="center" height="${T21_H}" bgcolor="{{t21_shell}}" style="width:124px;max-width:124px;height:${T21_H}px;background-color:{{t21_shell}};padding:0 8px 8px 8px;vertical-align:bottom;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="108" style="width:108px;border-collapse:collapse;">
<tr><td bgcolor="{{t21_photo_inner}}" align="center" valign="bottom" style="background-color:{{t21_photo_inner}};border-radius:54px 54px 0 0;-webkit-border-radius:54px 54px 0 0;padding:0;line-height:0;font-size:0;overflow:hidden;mso-border-radius-alt:54px 54px 0 0;">{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="108" height="${T21_PHOTO_H}" style="display:block;width:108px;height:${T21_PHOTO_H}px;border:0;object-fit:cover;object-position:50% 15%;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="108" height="${T21_PHOTO_H}" style="width:108px;height:${T21_PHOTO_H}px;border-collapse:collapse;"><tr><td align="center" valign="middle" style="font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;font-weight:700;color:{{t21_ink}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}{{/if}}</td></tr>
</table>
</td>
<td width="212" valign="middle" height="${T21_H}" bgcolor="{{t21_shell}}" style="width:212px;max-width:212px;height:${T21_H}px;background-color:{{t21_shell}};padding:8px 10px 8px 6px;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr><td style="padding:0 0 2px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:23px;font-weight:700;line-height:1.05;color:{{t21_ink}};word-break:break-word;">{{name}}</td></tr>
{{#if has_company}}<tr><td style="padding:0;font-family:Georgia,'Times New Roman',Times,serif;font-size:14px;font-weight:400;line-height:1.2;color:{{t21_ink}};word-break:break-word;">{{company_name}}</td></tr>{{/if}}
</table>
</td>
<td width="18" valign="middle" align="center" height="${T21_H}" bgcolor="{{t21_shell}}" style="width:18px;height:${T21_H}px;background-color:{{t21_shell}};padding:0;vertical-align:middle;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="1" style="width:1px;border-collapse:collapse;"><tr><td width="1" bgcolor="{{t21_divider}}" style="width:1px;height:${T21_DIV_H}px;background-color:{{t21_divider}};font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr></table>
</td>
<td valign="middle" height="${T21_H}" bgcolor="{{t21_shell}}" style="height:${T21_H}px;background-color:{{t21_shell}};padding:0;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" height="${T21_H}" style="height:${T21_H}px;border-collapse:collapse;"><tr><td valign="middle" align="left" style="vertical-align:middle;padding:6px 12px 6px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
{{#if phone}}<tr><td style="padding:0 0 5px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="20" valign="top" style="width:20px;padding:0 8px 0 0;vertical-align:top;font-size:10px;font-weight:700;color:{{t21_ink}};font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">P</td><td valign="top" style="padding:0;font-size:10px;font-weight:400;line-height:1.35;color:{{t21_ink}};font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">{{#if t21_tel_href}}<a href="{{{t21_tel_href}}}" style="color:{{t21_ink}};text-decoration:none;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td></tr></table></td></tr>{{/if}}
{{#if email}}<tr><td style="padding:0 0 5px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="20" valign="top" style="width:20px;padding:0 8px 0 0;vertical-align:top;font-size:10px;font-weight:700;color:{{t21_ink}};font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">E</td><td valign="top" style="padding:0;font-size:10px;font-weight:400;line-height:1.35;color:{{t21_ink}};word-break:break-word;font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t21_ink}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr></table></td></tr>{{/if}}
{{#if has_address}}<tr><td style="padding:0 0 6px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td width="20" valign="top" style="width:20px;padding:0 8px 0 0;vertical-align:top;font-size:10px;font-weight:700;color:{{t21_ink}};font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">A</td><td valign="top" style="padding:0;font-size:10px;font-weight:400;line-height:1.4;color:{{t21_ink}};word-break:break-word;font-family:Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr></table></td></tr>{{/if}}
{{#if t21_has_tagline}}<tr><td style="padding:2px 0 0 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:9px;font-weight:400;line-height:1.4;color:{{t21_ink}};">{{t21_tagline_line1}}{{#if t21_tagline_line2}}<br>{{t21_tagline_line2}}{{/if}}</td></tr>{{/if}}
</table>
</td></tr></table>
</td>
<td width="14" height="${T21_H}" bgcolor="{{t21_bronze}}" style="width:14px;min-width:14px;max-width:14px;height:${T21_H}px;background-color:{{t21_bronze}};padding:0;font-size:0;line-height:0;">&nbsp;</td>
</tr>
</table>`;
