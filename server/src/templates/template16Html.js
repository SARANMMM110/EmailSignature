/**
 * Layout 16 — email-safe table: **white portrait rail** | **navy panel** with stacked name,
 * hairline, stroke-icon contacts (compact type). Outer width **600px**.
 */
const T16_FONT =
  "'Poppins','Montserrat','Open Sans',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const T16_WHITE_COL = '200';
const T16_NAVY_COL = '400';
const T16_RING_NAVY = '2';
const T16_RING_WHITE = '3';
const T16_PHOTO_INNER = '96';
const T16_CARD_R = '14';
const T16_MIN_H = '138';

export const TEMPLATE_16_MARKUP = `<!-- T16: outer {{sig_t16_outer_width}}px — white photo | navy name + rule + contacts -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="{{sig_t16_outer_width}}" style="width:{{sig_t16_outer_width}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T16_FONT};border:0;">
<tr>
{{#if sig_has_photo_column}}
<td width="${T16_WHITE_COL}" valign="middle" bgcolor="{{t16_white}}" style="width:${T16_WHITE_COL}px;max-width:${T16_WHITE_COL}px;min-height:${T16_MIN_H}px;vertical-align:middle;padding:18px 14px 18px 16px;border:0;background-color:{{t16_white}};border-radius:${T16_CARD_R}px 0 0 ${T16_CARD_R}px;-webkit-border-radius:${T16_CARD_R}px 0 0 ${T16_CARD_R}px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td align="center" valign="middle" style="padding:0;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" bgcolor="{{t16_navy}}" style="padding:${T16_RING_NAVY}px;background-color:{{t16_navy}};border-radius:50%;-webkit-border-radius:50%;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" style="padding:${T16_RING_WHITE}px;background-color:#ffffff;border-radius:50%;-webkit-border-radius:50%;line-height:0;font-size:0;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${T16_PHOTO_INNER}" height="${T16_PHOTO_INNER}" style="display:block;width:${T16_PHOTO_INNER}px;height:${T16_PHOTO_INNER}px;border-radius:50%;-webkit-border-radius:50%;border:0;object-fit:cover;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T16_PHOTO_INNER}" height="${T16_PHOTO_INNER}" style="width:${T16_PHOTO_INNER}px;height:${T16_PHOTO_INNER}px;border-collapse:collapse;"><tr><td width="${T16_PHOTO_INNER}" height="${T16_PHOTO_INNER}" align="center" valign="middle" bgcolor="{{t16_photo_placeholder_bg}}" style="width:${T16_PHOTO_INNER}px;height:${T16_PHOTO_INNER}px;border-radius:50%;-webkit-border-radius:50%;background-color:{{t16_photo_placeholder_bg}};font-size:24px;font-weight:700;color:{{t16_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}{{/if}}
</td></tr></table>
</td></tr></table>
</td></tr></table>
</td>
{{/if}}
<td width="{{#if sig_has_photo_column}}${T16_NAVY_COL}{{else}}{{sig_t16_outer_width}}{{/if}}" valign="middle" bgcolor="{{t16_navy}}" style="width:{{#if sig_has_photo_column}}${T16_NAVY_COL}{{else}}{{sig_t16_outer_width}}{{/if}}px;max-width:{{#if sig_has_photo_column}}${T16_NAVY_COL}{{else}}{{sig_t16_outer_width}}{{/if}}px;min-height:${T16_MIN_H}px;vertical-align:middle;padding:18px 20px 18px {{#if sig_has_photo_column}}12px{{else}}22px{{/if}};border:0;background-color:{{t16_navy}};border-radius:{{#if sig_has_photo_column}}0 ${T16_CARD_R}px ${T16_CARD_R}px 0{{else}}${T16_CARD_R}px{{/if}};-webkit-border-radius:{{#if sig_has_photo_column}}0 ${T16_CARD_R}px ${T16_CARD_R}px 0{{else}}${T16_CARD_R}px{{/if}};{{#if sig_center_compact}}text-align:center;{{/if}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;table-layout:fixed;">
{{#if show_logo}}{{#if logo_url}}
<tr><td colspan="2" align="right" valign="middle" style="padding:0 4px 12px 4px;line-height:0;font-size:0;border:0;"><img src="{{{logo_url}}}" alt="" height="28" style="display:block;border:0;max-height:30px;max-width:152px;width:auto;height:auto;margin-left:auto;"></td></tr>
{{/if}}{{/if}}
<tr>
<td width="38%" valign="middle" style="width:38%;max-width:38%;padding:4px 10px 4px 4px;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
{{#if name_line2}}
<tr><td style="padding:0;font-size:19px;font-weight:700;line-height:1.08;color:{{t16_name_color}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">{{name_line1}}</td></tr>
<tr><td style="padding:4px 0 0 0;font-size:19px;font-weight:700;line-height:1.08;color:{{t16_name_color}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">{{name_line2}}</td></tr>
{{else}}
{{#if name}}<tr><td style="padding:0;font-size:19px;font-weight:700;line-height:1.1;color:{{t16_name_color}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">{{name}}</td></tr>{{/if}}
{{/if}}
{{#if title}}<tr><td style="padding:9px 0 0 0;font-size:11px;font-weight:500;line-height:1.32;color:{{t16_title_color}};mso-line-height-rule:exactly;">{{title}}</td></tr>{{/if}}
</table>
</td>
<td valign="middle" style="vertical-align:middle;padding:4px 4px 4px 16px;border-left:1px solid {{t16_rule_soft}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
{{#if email}}<tr><td width="22" valign="middle" style="width:22px;padding:0 7px 4px 0;vertical-align:middle;line-height:0;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="text-decoration:none;border:0;line-height:0;display:block;">{{/if}}<img src="{{{t16_icon_mail}}}" width="11" height="11" alt="" style="display:block;width:11px;height:11px;border:0;">{{#if has_mailto}}</a>{{/if}}</td><td valign="middle" style="padding:0 0 4px 0;font-size:10px;font-weight:400;line-height:1.38;color:{{t16_contact_color}};mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t16_contact_color}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr>{{/if}}
{{#if phone}}<tr><td width="22" valign="middle" style="width:22px;padding:0 7px 4px 0;vertical-align:middle;line-height:0;">{{#if t16_tel_href}}<a href="{{{t16_tel_href}}}" style="text-decoration:none;display:block;line-height:0;">{{/if}}<img src="{{{t16_icon_phone}}}" width="11" height="11" alt="" style="display:block;width:11px;height:11px;border:0;margin:0 auto;">{{#if t16_tel_href}}</a>{{/if}}</td><td valign="middle" style="padding:0 0 4px 0;font-size:10px;font-weight:400;line-height:1.38;color:{{t16_contact_color}};mso-line-height-rule:exactly;">{{phone_line1}}{{#if phone_line2}}<br>{{phone_line2}}{{/if}}</td></tr>{{/if}}
{{#if has_website}}<tr><td width="22" valign="middle" style="width:22px;padding:0 7px 4px 0;vertical-align:middle;line-height:0;"><a href="{{{website_full}}}" style="text-decoration:none;border:0;line-height:0;display:block;"><img src="{{{t16_icon_globe}}}" width="11" height="11" alt="" style="display:block;width:11px;height:11px;border:0;"></a></td><td valign="middle" style="padding:0 0 4px 0;font-size:10px;font-weight:400;line-height:1.38;color:{{t16_contact_color}};mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t16_contact_color}};text-decoration:none;">{{website}}</a></td></tr>{{/if}}
{{#if has_address}}<tr><td width="22" valign="top" style="width:22px;padding:2px 7px 0 0;vertical-align:top;line-height:0;"><img src="{{{t16_icon_pin}}}" width="11" height="11" alt="" style="display:block;width:11px;height:11px;border:0;"></td><td valign="top" style="padding:0;font-size:10px;font-weight:400;line-height:1.4;color:{{t16_contact_color}};mso-line-height-rule:exactly;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>{{/if}}
</table>
</td>
</tr></table>
</td>
</tr>
</table>`;
