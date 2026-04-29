/**
 * Layout 16 — email-safe table: 45% navy pill / seam portrait / 55% white.
 * Outer width **600px**; low vertical profile; no tagline / social row.
 */
const T16_FONT =
  "'Poppins','Montserrat','Open Sans',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const T16_OUTER = '600';
const T16_LEFT = '270';
const T16_RIGHT = '330';
const T16_PHOTO_COL = '47';
const T16_PHOTO_SHIFT = '0';
const T16_RING_NAVY = '2';
const T16_RING_WHITE = '3';
const T16_PHOTO_INNER = '84';
const T16_MAIN = String(Number(T16_RIGHT) - Number(T16_PHOTO_COL));
const T16_PILL_R = '56';
const T16_MIN_H = '112';
const T16_DOTS_W = '32';
const T16_DOTS_H = '24';
const T16_DECO_W = '92';
const T16_DECO_H = '56';

export const TEMPLATE_16_MARKUP = `<!-- T16: outer ${T16_OUTER}px — 45% / seam portrait / 55% -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T16_OUTER}" style="width:${T16_OUTER}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T16_FONT};border:0;">
<tr>
<td width="${T16_LEFT}" valign="middle" bgcolor="{{t16_navy}}" style="width:${T16_LEFT}px;max-width:${T16_LEFT}px;min-height:${T16_MIN_H}px;vertical-align:middle;padding:0;border:0;border-radius:0 ${T16_PILL_R}px ${T16_PILL_R}px 0;-webkit-border-radius:0 ${T16_PILL_R}px ${T16_PILL_R}px 0;{{t16_left_cell_style}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:6px 10px 6px 11px;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
{{#if show_logo}}
{{#if logo_url}}
<tr><td align="center" style="padding:0 0 2px 0;line-height:0;font-size:0;"><img src="{{{logo_url}}}" alt="" width="108" height="32" style="display:block;max-width:108px;max-height:36px;width:108px;height:auto;border:0;object-fit:contain;"></td></tr>
{{else}}
<tr><td align="center" style="padding:0 0 2px 0;line-height:0;font-size:0;"><img src="{{{t16_hex_uri}}}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border:0;margin:0 auto;"></td></tr>
<tr><td align="center" style="padding:0;font-size:13px;font-weight:700;line-height:1.05;letter-spacing:0.09em;color:#ffffff;mso-line-height-rule:exactly;">{{t16_lockup_upper}}</td></tr>
{{/if}}
{{else}}
<tr><td align="center" style="padding:0 0 2px 0;line-height:0;font-size:0;"><img src="{{{t16_hex_uri}}}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border:0;margin:0 auto;"></td></tr>
<tr><td align="center" style="padding:0;font-size:13px;font-weight:700;line-height:1.05;letter-spacing:0.09em;color:#ffffff;mso-line-height-rule:exactly;">{{t16_lockup_upper}}</td></tr>
{{/if}}
</table>
</td></tr>
</table>
</td>
<td width="${T16_RIGHT}" valign="middle" bgcolor="{{t16_white}}" style="width:${T16_RIGHT}px;max-width:${T16_RIGHT}px;vertical-align:middle;padding:0;border:0;background-color:{{t16_white}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;table-layout:fixed;">
<tr>
<td width="${T16_PHOTO_COL}" align="right" valign="middle" style="width:${T16_PHOTO_COL}px;max-width:${T16_PHOTO_COL}px;padding:0;vertical-align:middle;line-height:0;font-size:0;border:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin-left:-${T16_PHOTO_SHIFT}px;mso-margin-left-alt:-${T16_PHOTO_SHIFT}px;">
<tr><td align="center" valign="middle" style="padding:0;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" bgcolor="{{t16_navy}}" style="padding:${T16_RING_NAVY}px;background-color:{{t16_navy}};border-radius:50%;-webkit-border-radius:50%;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" valign="middle" style="padding:${T16_RING_WHITE}px;background-color:#ffffff;border-radius:50%;-webkit-border-radius:50%;line-height:0;font-size:0;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${T16_PHOTO_INNER}" height="${T16_PHOTO_INNER}" style="display:block;width:${T16_PHOTO_INNER}px;height:${T16_PHOTO_INNER}px;border-radius:50%;-webkit-border-radius:50%;border:0;object-fit:cover;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${T16_PHOTO_INNER}" height="${T16_PHOTO_INNER}" style="width:${T16_PHOTO_INNER}px;height:${T16_PHOTO_INNER}px;border-collapse:collapse;"><tr><td width="${T16_PHOTO_INNER}" height="${T16_PHOTO_INNER}" align="center" valign="middle" bgcolor="{{t16_photo_placeholder_bg}}" style="width:${T16_PHOTO_INNER}px;height:${T16_PHOTO_INNER}px;border-radius:50%;-webkit-border-radius:50%;background-color:{{t16_photo_placeholder_bg}};font-size:24px;font-weight:700;color:{{t16_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}{{/if}}
</td></tr></table>
</td></tr></table>
</td></tr>
</table>
</td>
<td width="${T16_MAIN}" valign="middle" style="width:${T16_MAIN}px;max-width:${T16_MAIN}px;padding:6px 10px 8px 4px;vertical-align:middle;border:0;background-color:{{t16_white}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:0;line-height:0;font-size:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td width="28%" valign="top" style="width:28%;padding:0;line-height:0;font-size:0;">&nbsp;</td>
<td width="44%" align="center" valign="top" style="width:44%;padding:0;line-height:0;font-size:0;vertical-align:top;"><img src="{{{t16_dots_tr}}}" width="${T16_DOTS_W}" height="${T16_DOTS_H}" alt="" style="display:block;width:${T16_DOTS_W}px;height:${T16_DOTS_H}px;border:0;margin:0 auto;"></td>
<td width="28%" align="right" valign="top" style="width:28%;padding:0;line-height:0;font-size:0;vertical-align:top;"><img src="{{{t16_deco_tr}}}" width="${T16_DECO_W}" height="${T16_DECO_H}" alt="" style="display:block;width:${T16_DECO_W}px;height:${T16_DECO_H}px;border:0;opacity:0.9;"></td>
</tr></table>
</td></tr>
<tr><td style="padding:0;font-size:17px;font-weight:700;line-height:1.05;color:{{t16_name_color}};letter-spacing:-0.02em;mso-line-height-rule:exactly;text-align:left;">{{name}}</td></tr>
{{#if title}}<tr><td style="padding:0 0 6px 0;font-size:11px;font-weight:400;line-height:1.28;color:{{t16_title_color}};mso-line-height-rule:exactly;text-align:left;">{{title}}</td></tr>{{/if}}
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin-top:0;">
{{#if phone}}<tr><td width="28" valign="top" style="width:28px;padding:0 6px 3px 0;vertical-align:top;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:{{t16_navy}};border-radius:50%;-webkit-border-radius:50%;"><tr><td width="18" height="18" align="center" valign="middle" style="width:18px;height:18px;padding:0;line-height:0;">{{#if t16_tel_href}}<a href="{{{t16_tel_href}}}" style="text-decoration:none;display:block;line-height:0;">{{/if}}<img src="{{{t16_icon_phone}}}" width="8" height="8" alt="" style="display:block;width:8px;height:8px;border:0;margin:0 auto;">{{#if t16_tel_href}}</a>{{/if}}</td></tr></table>
</td><td valign="top" style="padding:0 0 3px 0;font-size:9px;font-weight:400;line-height:1.3;color:{{t16_contact_color}};mso-line-height-rule:exactly;text-align:left;">{{phone_line1}}{{#if phone_line2}}<br>{{phone_line2}}{{/if}}</td></tr>{{/if}}
{{#if has_t16_web_mail}}<tr><td width="28" valign="top" style="width:28px;padding:0 6px 3px 0;vertical-align:top;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:{{t16_navy}};border-radius:50%;-webkit-border-radius:50%;"><tr><td width="18" height="18" align="center" valign="middle" style="width:18px;height:18px;padding:0;line-height:0;"><img src="{{{t16_icon_globe}}}" width="8" height="8" alt="" style="display:block;width:8px;height:8px;border:0;margin:0 auto;"></td></tr></table>
</td><td valign="top" style="padding:0 0 3px 0;font-size:9px;font-weight:400;line-height:1.3;color:{{t16_contact_color}};mso-line-height-rule:exactly;text-align:left;">{{#if has_website}}<a href="{{{website_full}}}" style="color:{{t16_contact_color}};text-decoration:none;">{{website}}</a>{{/if}}{{#if email}}{{#if has_website}}<br>{{/if}}{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t16_contact_color}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}{{/if}}</td></tr>{{/if}}
{{#if has_address}}<tr><td width="28" valign="top" style="width:28px;padding:0 6px 0 0;vertical-align:top;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:{{t16_navy}};border-radius:50%;-webkit-border-radius:50%;"><tr><td width="18" height="18" align="center" valign="middle" style="width:18px;height:18px;padding:0;line-height:0;"><img src="{{{t16_icon_pin}}}" width="8" height="8" alt="" style="display:block;width:8px;height:8px;border:0;margin:0 auto;"></td></tr></table>
</td><td valign="top" style="padding:0;font-size:9px;font-weight:400;line-height:1.3;color:{{t16_contact_color}};mso-line-height-rule:exactly;text-align:left;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>{{/if}}
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin-top:2px;">
<tr><td align="right" valign="bottom" style="padding:0;line-height:0;font-size:0;vertical-align:bottom;"><img src="{{{t16_dots_br}}}" width="${T16_DOTS_W}" height="${T16_DOTS_H}" alt="" style="display:block;width:${T16_DOTS_W}px;height:${T16_DOTS_H}px;border:0;margin:0 0 0 auto;"></td></tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
