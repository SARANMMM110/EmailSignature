/**
 * Layout 14 — shorter block: peach canvas, Archivo name + job, smaller orange portrait, contacts,
 * light layout graphics (top accent strip, dotted rule, footer bars), white footer strip.
 */
const T14_FONT = "'Archivo',Helvetica,Arial,sans-serif";

export const TEMPLATE_14_MARKUP = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T14_FONT};border:0;">
<tr>
<td width="600" valign="top" style="width:600px;vertical-align:top;padding:6px 0 0 0;border:0;{{t14_canvas_style}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td colspan="3" width="600" valign="top" style="width:600px;padding:0 22px 3px 22px;line-height:0;font-size:0;vertical-align:top;border:0;">
<img src="{{{t14_deco_topbar}}}" width="556" height="4" alt="" style="display:block;width:556px;max-width:100%;height:auto;border:0;">
</td>
</tr>
<tr>
<td width="220" valign="top" style="width:220px;max-width:220px;vertical-align:top;padding:6px 8px 0 20px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td style="padding:0;font-size:22px;font-weight:800;line-height:1.02;color:{{t14_text}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">{{name_line1}}</td>
</tr>
{{#if t14_has_name_line2}}<tr><td style="padding:1px 0 0 0;font-size:22px;font-weight:800;line-height:1.02;color:{{t14_text}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">{{name_line2}}</td></tr>{{/if}}
{{#if title}}<tr><td style="padding:5px 6px 0 0;font-size:10px;font-weight:500;line-height:1.34;color:{{t14_subtitle}};mso-line-height-rule:exactly;">{{#if t14_has_job_line2}}{{t14_job_line1}}<br>{{t14_job_line2}}{{else}}{{title}}{{/if}}</td></tr>{{/if}}
<tr><td style="padding:6px 6px 0 0;line-height:0;font-size:0;mso-line-height-rule:exactly;"><img src="{{{t14_deco_rule}}}" width="168" height="10" alt="" style="display:block;width:168px;max-width:100%;height:auto;border:0;"></td></tr>
</table>
</td>
<td width="138" valign="bottom" align="center" style="width:138px;max-width:138px;vertical-align:bottom;padding:6px 8px 0 8px;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td align="center" valign="bottom" bgcolor="{{t14_orange}}" style="width:102px;height:110px;vertical-align:bottom;background-color:{{t14_orange}};border-radius:20px;-webkit-border-radius:20px;padding:0;overflow:hidden;mso-line-height-rule:exactly;">
{{#if photo_url}}<img src="{{{photo_url}}}" width="94" height="110" alt="" style="display:block;width:94px;height:110px;margin:0 auto;border:0;object-fit:cover;object-position:center 34%;">{{else}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="94" height="110" style="width:94px;height:110px;border-collapse:collapse;"><tr><td width="94" height="110" align="center" valign="middle" bgcolor="{{t14_photo_placeholder_bg}}" style="width:94px;height:110px;background-color:{{t14_photo_placeholder_bg}};font-family:${T14_FONT};font-size:15px;font-weight:700;color:{{t14_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}
</td></tr></table>
</td>
<td width="242" valign="top" style="width:242px;max-width:242px;vertical-align:top;padding:6px 18px 0 12px;border-left:1px solid {{t14_divider_color}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
{{#if phone}}<tr><td width="18" valign="middle" style="width:18px;padding:0 8px 6px 0;vertical-align:middle;line-height:0;"><img src="{{{t14_icon_phone}}}" width="12" height="12" alt="" style="display:block;width:12px;height:12px;border:0;"></td><td valign="middle" style="padding:0 0 6px 0;font-size:10px;font-weight:500;line-height:1.28;color:{{t14_text}};mso-line-height-rule:exactly;">{{phone}}</td></tr>{{/if}}
{{#if email}}<tr><td width="18" valign="middle" style="width:18px;padding:0 8px 6px 0;vertical-align:middle;line-height:0;"><img src="{{{t14_icon_mail}}}" width="12" height="12" alt="" style="display:block;width:12px;height:12px;border:0;"></td><td valign="middle" style="padding:0 0 6px 0;font-size:10px;font-weight:500;line-height:1.28;color:{{t14_text}};mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t14_text}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr>{{/if}}
{{#if has_website}}<tr><td width="18" valign="middle" style="width:18px;padding:0 8px 6px 0;vertical-align:middle;line-height:0;"><img src="{{{t14_icon_globe}}}" width="12" height="12" alt="" style="display:block;width:12px;height:12px;border:0;"></td><td valign="middle" style="padding:0 0 6px 0;font-size:10px;font-weight:500;line-height:1.28;color:{{t14_text}};mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t14_text}};text-decoration:none;">{{website}}</a></td></tr>{{/if}}
{{#if has_address}}<tr><td width="18" valign="top" style="width:18px;padding:0 8px 0 0;vertical-align:top;line-height:0;"><img src="{{{t14_icon_pin}}}" width="12" height="12" alt="" style="display:block;width:12px;height:12px;border:0;"></td><td valign="top" style="padding:0;font-size:10px;font-weight:500;line-height:1.28;color:{{t14_text}};mso-line-height-rule:exactly;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>{{/if}}
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td width="600" valign="top" bgcolor="{{t14_footer_bg}}" style="width:600px;vertical-align:top;padding:0;margin:0;border:0;background-color:{{t14_footer_bg}};border-radius:0;-webkit-border-radius:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>
<td width="400" valign="middle" style="width:400px;max-width:400px;padding:6px 8px 6px 20px;vertical-align:middle;text-align:left;font-size:8px;font-weight:800;letter-spacing:0.22em;color:{{t14_text}};mso-line-height-rule:exactly;font-family:${T14_FONT};line-height:1.3;">LET&#8217;S GET IN TOUCH</td>
<td width="200" valign="middle" align="right" style="width:200px;max-width:200px;padding:4px 20px 4px 8px;vertical-align:middle;text-align:right;line-height:0;font-size:0;mso-line-height-rule:exactly;"><img src="{{{t14_deco_bars}}}" width="32" height="32" alt="" style="display:block;width:32px;height:32px;border:0;margin:0 0 0 auto;"></td>
</tr></table>
</td>
</tr>
</table>`;
