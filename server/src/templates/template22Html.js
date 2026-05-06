/**
 * Layout 22 — **620px** total width with or without portrait (name column absorbs photo width when photo off).
 * Playfair name, Poppins contact/title; wide left gutter + opaque contact column so TL deco never masks copy.
 */
export const T22_OUTER_W_PX = 620;
/** Photo column width — only present when `showPhoto`. */
export const T22_PHOTO_COL_W_PX = 156;
/** Same as {@link T22_OUTER_W_PX} — no narrower “compact” strip; name column expands when photo is off. */
export const T22_COMPACT_W_PX = T22_OUTER_W_PX;
/** Name `<td>` width when portrait column is shown (photo slot on). */
export const T22_NAME_COL_W_WITH_PHOTO_PX = 148;
/** Name `<td>` width when portrait column omitted — fills gutter + contact + sep + former photo band. */
export const T22_NAME_COL_W_NO_PHOTO_PX =
  T22_OUTER_W_PX - 100 - 200 - 16;
export const T22_INNER_W_PX = T22_OUTER_W_PX;
export const T22_CARD_H_PX = 200;
const H = `${T22_CARD_H_PX}`;
const PH_W = '132';
const PH_H = '172';
/** Bottom wedge overlay — full column width; height matches overlay SVG aspect (82/170). */
const T22_OVERLAY_W = '156';
const T22_OVERLAY_H = '75';
/** Content columns: gutter + contacts + separator + name + portrait. Sum = {@link T22_OUTER_W_PX}. */
const COL_CONTACT = '200';
const COL_SEP = '16';
const COL_PHOTO = '156';
/** TL deco sits left of this; contact block is wide so separator/name clear copy. */
const GUTTER_LEFT = '100';

const T22_ROW_WRAP_OPEN =
  '<tr><td align="left" style="padding:0 0 4px 0;text-align:left;vertical-align:top;">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="margin:0;border-collapse:collapse;">';
const T22_ROW_WRAP_CLOSE = '</table></td></tr>';

/** Gold circular icon well — compact 26×26; glyph 14×14 centered. */
const T22_ICON_CELL_OPEN =
  '<td valign="top" style="width:34px;padding:1px 10px 0 0;vertical-align:top;line-height:0;font-size:0;">' +
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;">' +
  '<tr><td align="center" valign="middle" bgcolor="{{t22_gold}}" width="26" height="26" style="width:26px;height:26px;border-radius:13px;mso-line-height-rule:exactly;">';
const T22_ICON_CELL_CLOSE = '</td></tr></table></td>';

export const TEMPLATE_22_MARKUP = `<!-- T22: {{sig_t22_outer_width}}×${T22_CARD_H_PX} — optional logo (gutter) + contacts + separator + optional portrait -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="{{sig_t22_outer_width}}" style="width:{{sig_t22_outer_width}}px;min-width:{{sig_t22_outer_width}}px;max-width:{{sig_t22_outer_width}}px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Poppins',Inter,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">
<tr>
<td style="padding:0;background-color:{{t22_cream}};mso-line-height-rule:exactly;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="{{sig_t22_outer_width}}" style="width:{{sig_t22_outer_width}}px;min-width:{{sig_t22_outer_width}}px;max-width:{{sig_t22_outer_width}}px;border-collapse:collapse;table-layout:fixed;">
<tr>
<td width="{{sig_t22_outer_width}}" height="${H}" valign="top" bgcolor="{{t22_cream}}" background="{{{t22_deco_uri}}}" style="width:{{sig_t22_outer_width}}px;min-width:{{sig_t22_outer_width}}px;max-width:{{sig_t22_outer_width}}px;height:${H}px;padding:0;vertical-align:top;background-color:{{t22_cream}};background-image:url({{{t22_deco_uri}}});background-repeat:no-repeat;background-position:0 0;background-size:{{sig_t22_outer_width}}px ${H}px;mso-line-height-rule:exactly;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="{{sig_t22_outer_width}}" height="${H}" style="width:{{sig_t22_outer_width}}px;min-width:{{sig_t22_outer_width}}px;max-width:{{sig_t22_outer_width}}px;height:${H}px;border-collapse:collapse;table-layout:fixed;">
<tr>
<td width="${GUTTER_LEFT}" valign="middle" align="center" style="width:${GUTTER_LEFT}px;padding:0 6px;font-size:0;line-height:0;background-color:transparent;vertical-align:middle;text-align:center;">{{#if show_logo}}{{#if logo_url}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td align="center" style="padding:0;line-height:0;"><img src="{{{logo_url}}}" alt="" style="display:block;max-width:88px;max-height:96px;width:auto;height:auto;margin:0 auto;border:0;"></td></tr></table>{{else}}&#8203;{{/if}}{{else}}&#8203;{{/if}}</td>
<td width="${COL_CONTACT}" valign="middle" align="left" bgcolor="{{t22_cream}}" style="width:${COL_CONTACT}px;padding:0;vertical-align:middle;text-align:left;background-color:{{t22_cream}};font-family:'Poppins',Inter,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
<td valign="middle" style="padding:4px 4px 4px 0;vertical-align:middle;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;">
{{#if phone}}${T22_ROW_WRAP_OPEN}<tr>${T22_ICON_CELL_OPEN}{{#if t22_tel_href}}<a href="{{{t22_tel_href}}}" style="text-decoration:none;border:0;">{{/if}}<img src="{{{t22_icon_whatsapp}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;margin:0 auto;border:0;">{{#if t22_tel_href}}</a>{{/if}}${T22_ICON_CELL_CLOSE}<td valign="middle" style="padding:0 0 0 0;font-size:14px;font-weight:400;line-height:1.45;color:{{t22_contact}};mso-line-height-rule:exactly;text-align:left;white-space:nowrap;">{{#if t22_tel_href}}<a href="{{{t22_tel_href}}}" style="color:{{t22_contact}};text-decoration:none;white-space:nowrap;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td></tr>${T22_ROW_WRAP_CLOSE}{{/if}}
{{#if has_address}}${T22_ROW_WRAP_OPEN}<tr>${T22_ICON_CELL_OPEN}<img src="{{{t22_icon_pin}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;margin:0 auto;border:0;">${T22_ICON_CELL_CLOSE}<td valign="middle" style="padding:0 0 0 0;font-size:14px;font-weight:400;line-height:1.4;color:{{t22_contact}};mso-line-height-rule:exactly;word-break:break-word;text-align:left;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>${T22_ROW_WRAP_CLOSE}{{/if}}
{{#if email}}${T22_ROW_WRAP_OPEN}<tr>${T22_ICON_CELL_OPEN}{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="text-decoration:none;border:0;">{{/if}}<img src="{{{t22_icon_mail}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;margin:0 auto;border:0;">{{#if has_mailto}}</a>{{/if}}${T22_ICON_CELL_CLOSE}<td valign="middle" style="padding:0 0 0 0;font-size:14px;font-weight:400;line-height:1.45;color:{{t22_contact}};mso-line-height-rule:exactly;text-align:left;white-space:nowrap;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t22_contact}};text-decoration:none;white-space:nowrap;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr>${T22_ROW_WRAP_CLOSE}{{/if}}
{{#if has_website}}${T22_ROW_WRAP_OPEN}<tr>${T22_ICON_CELL_OPEN}<a href="{{{website_full}}}" style="text-decoration:none;border:0;line-height:0;"><img src="{{{t22_icon_globe}}}" width="14" height="14" alt="" style="display:block;width:14px;height:14px;margin:0 auto;border:0;"></a>${T22_ICON_CELL_CLOSE}<td valign="middle" style="padding:0 0 0 0;font-size:14px;font-weight:400;line-height:1.45;color:{{t22_contact}};mso-line-height-rule:exactly;text-align:left;white-space:nowrap;"><a href="{{{website_full}}}" style="color:{{t22_contact}};text-decoration:none;white-space:nowrap;">{{website}}</a></td></tr>${T22_ROW_WRAP_CLOSE}{{/if}}
</table>
</td>
</tr>
</table>
</td>
<td width="${COL_SEP}" valign="middle" align="center" style="width:${COL_SEP}px;padding:0;vertical-align:middle;text-align:center;">
<img src="{{{t22_sep_uri}}}" width="16" height="200" alt="" style="display:block;width:16px;height:200px;margin:0 auto;border:0;">
</td>
<td width="{{sig_t22_name_col_w}}" valign="middle" align="left" bgcolor="{{t22_cream}}" background="{{{t22_name_panel_uri}}}" style="width:{{sig_t22_name_col_w}}px;padding:0 8px 0 12px;vertical-align:middle;text-align:left;background-color:{{t22_cream}};background-image:url({{{t22_name_panel_uri}}});background-repeat:no-repeat;background-position:right center;background-size:cover;mso-line-height-rule:exactly;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;">
<tr><td align="left" style="padding:0;text-align:left;font-family:'Playfair Display',Georgia,'Times New Roman',Times,serif;font-size:24px;font-weight:700;line-height:1.12;color:{{t22_ink}};mso-line-height-rule:exactly;word-wrap:break-word;">{{t22_name_line1}}{{#if t22_has_name_line2}}<br>{{t22_name_line2}}{{/if}}</td></tr>
<tr><td align="left" style="padding:10px 0 0 0;text-align:left;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr><td bgcolor="{{t22_gold}}" width="56" height="4" style="width:56px;height:4px;font-size:0;line-height:0;border-radius:2px;mso-line-height-rule:exactly;">&#8203;</td></tr></table></td></tr>
{{#if t22_has_title_block}}<tr><td align="left" style="padding:12px 0 0 0;text-align:left;font-family:'Poppins',Inter,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;font-size:13px;font-weight:400;line-height:1.45;letter-spacing:4px;color:{{t22_title_soft}};mso-line-height-rule:exactly;">{{t22_title_line1}}{{#if t22_has_title_line2}}<br>{{t22_title_line2}}{{/if}}</td></tr>{{/if}}
</table>
</td>
{{#if sig_has_photo_column}}
<td width="${COL_PHOTO}" valign="bottom" align="right" bgcolor="transparent" style="width:${COL_PHOTO}px;padding:0;vertical-align:bottom;text-align:right;line-height:0;background-color:transparent;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="right" style="width:100%;border-collapse:collapse;">
<tr><td align="right" valign="bottom" style="padding:0;line-height:0;mso-line-height-rule:exactly;text-align:right;font-size:0;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="${PH_W}" height="${PH_H}" style="display:block;width:${PH_W}px;height:${PH_H}px;margin:0 0 0 auto;border:0;object-fit:cover;object-position:center bottom;"><img src="{{{t22_photo_bottom_uri}}}" alt="" role="presentation" width="${T22_OVERLAY_W}" height="${T22_OVERLAY_H}" style="display:block;width:${T22_OVERLAY_W}px;height:${T22_OVERLAY_H}px;margin:-54px 0 0 auto;border:0;line-height:0;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${PH_W}" height="${PH_H}" align="right" style="width:${PH_W}px;height:${PH_H}px;margin:0 0 0 auto;border-collapse:collapse;"><tr><td align="center" valign="middle" width="${PH_W}" height="${PH_H}" bgcolor="{{t22_photo_placeholder_bg}}" style="width:${PH_W}px;height:${PH_H}px;background-color:{{t22_photo_placeholder_bg}};font-family:'Poppins',Inter,system-ui,'Segoe UI',Roboto,Helvetica,Arial,{{font_family}},sans-serif;font-size:16px;font-weight:700;color:{{t22_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table><img src="{{{t22_photo_bottom_uri}}}" alt="" role="presentation" width="${T22_OVERLAY_W}" height="${T22_OVERLAY_H}" style="display:block;width:${T22_OVERLAY_W}px;height:${T22_OVERLAY_H}px;margin:-54px 0 0 auto;border:0;line-height:0;">{{/if}}{{/if}}
</td></tr>
</table>
</td>
{{/if}}
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
