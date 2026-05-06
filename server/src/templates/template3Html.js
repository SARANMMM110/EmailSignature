/**
 * Layout 3 — 620px-wide card (photo on): layered diamond-field background (palette-driven SVG),
 * left rail: optional logo (top row), website + address + socials (bottom row, aligned with phone/email);
 * center: portrait (rowspan); right: single column (`rowspan="2"`) name → title → phone → email, top-aligned.
 *
 * **Card** = {@link T3_CARD_WIDTH_PX}px; **inner grid** = {@link T3_INNER_GRID_W_PX}px (equals
 * `card − 2×{@link T3_SHELL_H_PAD_PX}`) in every context — with or without the photo column.
 * Photo layout columns: **195 + 202 + 195**; no-photo: **296 + 296** (same total inner width).
 *
 * Tokens from `buildTemplate3DecorDataUris` + standard `contextFromEditorPayload` fields.
 */
const T3_FONT = "'Montserrat', 'Poppins', 'Segoe UI', Tahoma, Arial, sans-serif";

/** Keeps long emails/URLs/names inside fixed columns (email clients). */
const T3_WRAP = 'word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;max-width:100%;';

/** Name: wrap inside rail (long tokens may break); `overflow:hidden` on `<td>` clips any stray overflow in strict clients. */
const T3_NAME_WRAP =
  'word-wrap:break-word;overflow-wrap:anywhere;word-break:break-word;max-width:100%;';

/** Horizontal padding on shell `<td>` (`8px 14px … 14px`). */
export const T3_SHELL_H_PAD_PX = 14;
/** Full-bleed shell width (matches {@link sig_t3_card_width}). */
export const T3_CARD_WIDTH_PX = 620;
/** Inner table width — always `card − 2×{@link T3_SHELL_H_PAD_PX}` ({@link sig_t3_inner_grid_width}). */
export const T3_INNER_GRID_W_PX = T3_CARD_WIDTH_PX - T3_SHELL_H_PAD_PX * 2;

/** Photo layout columns inside inner grid: 195 + 202 + 195 = {@link T3_INNER_GRID_W_PX}. */
const T3_SIDE_COL_W_PX = 195;
/** No-photo: two columns fill inner grid — **296 + 296**. */
const T3_COMPACT_COL_W_PX = T3_INNER_GRID_W_PX / 2;

/** Reference height for diamond SVG viewBox; actual cell grows with portrait. */
export const T3_CARD_HEIGHT_PX = 216;
/** Center column width (px) — only when {@link sig_has_photo_column}. */
export const T3_PHOTO_COL_W_PX = 202;
/** Portrait image box — matches {@link TEMPLATE_3_MARKUP} img width / max-height when photo on. */
export const T3_PHOTO_IMG_W_PX = 168;
export const T3_PHOTO_IMG_MAX_H_PX = 180;

/** Fixed gutter for stroke icons (cell holds 24px box + breathing room). */
const T3_ICON_GUTTER_PX = 32;

/** Nudge website/address (left) and phone/email (right) downward vs name/title. */
const T3_CONTACT_SECTION_DOWN_PX = 12;
/** Exported for {@link sig_t3_no_logo_r1_spacer_h} math in htmlGenerator. */
export const T3_LEFT_RAIL_ROW2_PAD_TOP_PX = 4 + T3_CONTACT_SECTION_DOWN_PX;
export const T3_RIGHT_PHONE_ROW_PAD_TOP_PX = 8 + T3_CONTACT_SECTION_DOWN_PX;
/** Outer td padding-top/bottom delta vs right rail (5px top + 4px bottom vs 5px top on right inner start). */
export const T3_NO_LOGO_SPACER_PAD_ADJ_PX = 4;

/** Right rail padding (photo layout): inset name/title from center diamonds (`padding-left` faces the portrait column). */
const T3_RIGHT_RAIL_PAD_L = 16;
const T3_RIGHT_RAIL_PAD_R = 14;
/** Usable inner width inside right rail `<td>` after horizontal padding. */
const T3_RIGHT_RAIL_INNER_W_PX = T3_SIDE_COL_W_PX - T3_RIGHT_RAIL_PAD_L - T3_RIGHT_RAIL_PAD_R;
/** Phone/email label cell (icon row): inner minus icon gutter and gap before icon. */
const T3_RIGHT_CONTACT_TEXT_W_PX = T3_RIGHT_RAIL_INNER_W_PX - T3_ICON_GUTTER_PX - 8;
const T3_COMPACT_RAIL_INNER_W_PX = T3_COMPACT_COL_W_PX - T3_RIGHT_RAIL_PAD_L - T3_RIGHT_RAIL_PAD_R;
const T3_COMPACT_CONTACT_TEXT_W_PX = T3_COMPACT_RAIL_INNER_W_PX - T3_ICON_GUTTER_PX - 8;

/**
 * Name: exactly **two** semantic lines (`line1` + `<br>` + optional `line2`); wrap allowed within each so nothing spills past the rail.
 * Slightly smaller type keeps long names inside the **195px** side columns without clipping.
 */
const T3_NAME_CELL_BASE =
  'padding:0 0 3px 0;font-size:17px;font-weight:800;letter-spacing:0.01em;line-height:1.2;mso-line-height-rule:exactly;text-align:right;width:100%;max-width:100%;overflow:hidden;';

const T3_LOGO_RAIL_OPEN = `<td width="${T3_SIDE_COL_W_PX}" valign="top" style="width:${T3_SIDE_COL_W_PX}px;max-width:${T3_SIDE_COL_W_PX}px;vertical-align:top;padding:5px 8px 4px 10px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
{{#unless show_logo}}{{#if sig_t3_no_logo_r1_spacer_h}}<tr><td style="padding:0;line-height:0;font-size:0;height:{{sig_t3_no_logo_r1_spacer_h}}px;mso-line-height-rule:exactly;overflow:hidden;">&nbsp;</td></tr>{{/if}}{{/unless}}
{{#if show_logo}}<tr><td align="center" style="padding:0 0 8px 0;line-height:0;">
{{#if logo_url}}
<img src="{{{logo_url}}}" alt="" height="30" style="display:block;border:0;max-height:34px;width:auto;max-width:132px;margin:0 auto;">
{{else}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td style="padding:0 0 6px 0;line-height:0;text-align:center;">
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" style="display:block;margin:0 auto;"><path d="M3,22 L3,11 L10,15 L18,4 L26,15 L33,11 L33,22 Z" fill="{{t3_ink}}"/><circle cx="18" cy="2" r="1.5" fill="{{t3_ink}}"/><circle cx="3" cy="10" r="1.3" fill="{{t3_ink}}"/><circle cx="33" cy="10" r="1.3" fill="{{t3_ink}}"/></svg>
</td></tr>
{{#if company_name}}<tr><td style="padding:0;font-size:15px;font-weight:800;color:{{t3_ink}};letter-spacing:2px;line-height:1.15;text-align:center;text-transform:uppercase;mso-line-height-rule:exactly;${T3_WRAP}">{{t3_company_upper}}</td></tr>{{/if}}
{{#if has_t3_tagline_field}}<tr><td style="padding:5px 0 0 0;font-size:7px;letter-spacing:2px;color:{{t3_ink}};text-align:center;text-transform:uppercase;mso-line-height-rule:exactly;${T3_WRAP}">{{t3_tagline_display}}</td></tr>{{/if}}
</table>
{{/if}}
</td></tr>{{/if}}
</table>
</td>`;

const T3_LOGO_RAIL_OPEN_COMPACT = `<td width="${T3_COMPACT_COL_W_PX}" valign="top" style="width:${T3_COMPACT_COL_W_PX}px;max-width:${T3_COMPACT_COL_W_PX}px;vertical-align:top;padding:5px 8px 4px 10px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
{{#unless show_logo}}{{#if sig_t3_no_logo_r1_spacer_h}}<tr><td style="padding:0;line-height:0;font-size:0;height:{{sig_t3_no_logo_r1_spacer_h}}px;mso-line-height-rule:exactly;overflow:hidden;">&nbsp;</td></tr>{{/if}}{{/unless}}
{{#if show_logo}}<tr><td align="center" style="padding:0 0 8px 0;line-height:0;">
{{#if logo_url}}
<img src="{{{logo_url}}}" alt="" height="30" style="display:block;border:0;max-height:34px;width:auto;max-width:156px;margin:0 auto;">
{{else}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td style="padding:0 0 6px 0;line-height:0;text-align:center;">
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" style="display:block;margin:0 auto;"><path d="M3,22 L3,11 L10,15 L18,4 L26,15 L33,11 L33,22 Z" fill="{{t3_ink}}"/><circle cx="18" cy="2" r="1.5" fill="{{t3_ink}}"/><circle cx="3" cy="10" r="1.3" fill="{{t3_ink}}"/><circle cx="33" cy="10" r="1.3" fill="{{t3_ink}}"/></svg>
</td></tr>
{{#if company_name}}<tr><td style="padding:0;font-size:15px;font-weight:800;color:{{t3_ink}};letter-spacing:2px;line-height:1.15;text-align:center;text-transform:uppercase;mso-line-height-rule:exactly;${T3_WRAP}">{{t3_company_upper}}</td></tr>{{/if}}
{{#if has_t3_tagline_field}}<tr><td style="padding:5px 0 0 0;font-size:7px;letter-spacing:2px;color:{{t3_ink}};text-align:center;text-transform:uppercase;mso-line-height-rule:exactly;${T3_WRAP}">{{t3_tagline_display}}</td></tr>{{/if}}
</table>
{{/if}}
</td></tr>{{/if}}
</table>
</td>`;

export const TEMPLATE_3_MARKUP = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="{{sig_t3_card_width}}" style="width:{{sig_t3_card_width}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T3_FONT};border:0;overflow:hidden;">
<tr>
<td width="{{sig_t3_card_width}}" valign="top" background="{{{t3_diamond_bg}}}" style="width:{{sig_t3_card_width}}px;max-width:{{sig_t3_card_width}}px;vertical-align:top;padding:8px 14px 11px 14px;border:0;background-color:{{t3_card_wash}};background-image:url({{{t3_diamond_bg}}});background-repeat:no-repeat;background-position:0 0;background-size:100% 100%;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="{{sig_t3_inner_grid_width}}" style="width:{{sig_t3_inner_grid_width}}px;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:0 auto;overflow:hidden;">
{{#if sig_has_photo_column}}
<tr>
${T3_LOGO_RAIL_OPEN}
<td width="${T3_PHOTO_COL_W_PX}" rowspan="2" valign="bottom" align="center" style="width:${T3_PHOTO_COL_W_PX}px;max-width:${T3_PHOTO_COL_W_PX}px;vertical-align:bottom;text-align:center;padding:4px 4px 0 4px;line-height:0;">
{{#if photo_url}}
<img src="{{{photo_url}}}" alt="" width="${T3_PHOTO_IMG_W_PX}" style="display:block;width:${T3_PHOTO_IMG_W_PX}px;height:auto;max-height:${T3_PHOTO_IMG_MAX_H_PX}px;border:0;margin:0 auto;object-fit:contain;object-position:bottom center;-webkit-filter:grayscale(100%);filter:grayscale(100%);">
{{else}}{{#if show_photo}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td width="84" height="84" align="center" valign="middle" bgcolor="#e8eef8" style="width:84px;height:84px;background-color:#e8eef8;font-family:${T3_FONT};font-size:17px;font-weight:800;color:{{t3_ink}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>
{{/if}}{{/if}}
</td>
<td rowspan="2" width="${T3_SIDE_COL_W_PX}" valign="top" style="width:${T3_SIDE_COL_W_PX}px;max-width:${T3_SIDE_COL_W_PX}px;vertical-align:top;padding:5px ${T3_RIGHT_RAIL_PAD_R}px 6px ${T3_RIGHT_RAIL_PAD_L}px;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;">
{{#if name}}<tr><td align="right" width="100%" style="${T3_NAME_CELL_BASE}color:{{t3_ink}};${T3_NAME_WRAP}">{{t3_name_line1}}{{#if t3_has_name_line2}}<br>{{t3_name_line2}}{{/if}}</td></tr>{{/if}}
{{#if title}}<tr><td align="right" width="100%" style="padding:2px 0 6px 0;font-size:10px;font-weight:600;color:{{t3_ink}};letter-spacing:1.2px;line-height:1.35;mso-line-height-rule:exactly;text-align:right;width:100%;max-width:100%;overflow:hidden;${T3_WRAP}">{{t13_title_upper}}</td></tr>{{/if}}
{{#if phone}}<tr><td align="right" style="padding:${T3_RIGHT_PHONE_ROW_PAD_TOP_PX}px 0 4px 0;line-height:0;width:100%;max-width:100%;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="right" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 0 auto;"><tr>
<td width="${T3_RIGHT_CONTACT_TEXT_W_PX}" align="right" valign="top" style="width:${T3_RIGHT_CONTACT_TEXT_W_PX}px;max-width:${T3_RIGHT_CONTACT_TEXT_W_PX}px;padding:0 8px 0 0;font-size:11px;color:{{company_muted}};line-height:1.35;mso-line-height-rule:exactly;text-align:right;vertical-align:top;${T3_WRAP}">{{#if t16_tel_href}}<a href="{{{t16_tel_href}}}" style="color:{{company_muted}};text-decoration:none;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td>
<td width="${T3_ICON_GUTTER_PX}" valign="top" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_phone}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
</tr></table>
</td></tr>{{/if}}
{{#if email}}<tr><td align="right" style="padding:2px 0 0 0;line-height:0;width:100%;max-width:100%;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="right" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 0 auto;"><tr>
<td width="${T3_RIGHT_CONTACT_TEXT_W_PX}" align="right" valign="top" style="width:${T3_RIGHT_CONTACT_TEXT_W_PX}px;max-width:${T3_RIGHT_CONTACT_TEXT_W_PX}px;padding:0 8px 0 0;font-size:10px;line-height:1.4;mso-line-height-rule:exactly;text-align:right;vertical-align:top;${T3_WRAP}">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{company_muted}};text-decoration:none;">{{email}}</a>{{else}}<span style="color:{{company_muted}};">{{email}}</span>{{/if}}</td>
<td width="${T3_ICON_GUTTER_PX}" valign="top" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_mail}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
</tr></table>
</td></tr>{{/if}}
</table>
</td>
</tr>
<tr>
<td width="${T3_SIDE_COL_W_PX}" valign="top" style="width:${T3_SIDE_COL_W_PX}px;max-width:${T3_SIDE_COL_W_PX}px;vertical-align:top;padding:${T3_LEFT_RAIL_ROW2_PAD_TOP_PX}px 8px 6px 10px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
{{#if has_website}}<tr><td align="left" style="padding:0 0 5px 0;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr>
<td width="${T3_ICON_GUTTER_PX}" valign="middle" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_globe}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
<td align="left" valign="middle" style="padding:0 0 0 8px;font-size:11px;line-height:1.35;mso-line-height-rule:exactly;${T3_WRAP}"><a href="{{{website_full}}}" style="color:{{company_muted}};text-decoration:none;">{{website}}</a></td>
</tr></table>
</td></tr>{{/if}}
{{#if has_address}}<tr><td align="left" style="padding:0 0 6px 0;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr>
<td width="${T3_ICON_GUTTER_PX}" valign="top" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_pin}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
<td align="left" valign="top" style="padding:0 0 0 8px;font-size:11px;color:{{company_muted}};line-height:1.42;mso-line-height-rule:exactly;${T3_WRAP}">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr></table>
</td></tr>{{/if}}
{{#if has_socials}}<tr><td align="left" style="padding:3px 0 0 0;vertical-align:bottom;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr>
{{#if has_facebook}}<td style="padding:0 5px 0 0;line-height:0;"><a href="{{{facebook_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_facebook}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
{{#if has_twitter}}<td style="padding:0 5px 0 0;line-height:0;"><a href="{{{twitter_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_twitter}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
{{#if has_instagram}}<td style="padding:0 5px 0 0;line-height:0;"><a href="{{{instagram_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_instagram}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
{{#if has_linkedin}}<td style="padding:0;line-height:0;"><a href="{{{linkedin_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_linkedin}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
</tr></table>
</td></tr>{{/if}}
</table>
</td>
</tr>
{{else}}
<tr>
${T3_LOGO_RAIL_OPEN_COMPACT}
<td rowspan="2" width="${T3_COMPACT_COL_W_PX}" valign="top" style="width:${T3_COMPACT_COL_W_PX}px;max-width:${T3_COMPACT_COL_W_PX}px;vertical-align:top;padding:5px ${T3_RIGHT_RAIL_PAD_R}px 6px ${T3_RIGHT_RAIL_PAD_L}px;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;">
{{#if name}}<tr><td align="right" width="100%" style="${T3_NAME_CELL_BASE}color:{{t3_ink}};${T3_NAME_WRAP}">{{t3_name_line1}}{{#if t3_has_name_line2}}<br>{{t3_name_line2}}{{/if}}</td></tr>{{/if}}
{{#if title}}<tr><td align="right" width="100%" style="padding:2px 0 6px 0;font-size:10px;font-weight:600;color:{{t3_ink}};letter-spacing:1.2px;line-height:1.35;mso-line-height-rule:exactly;text-align:right;width:100%;max-width:100%;overflow:hidden;${T3_WRAP}">{{t13_title_upper}}</td></tr>{{/if}}
{{#if phone}}<tr><td align="right" style="padding:${T3_RIGHT_PHONE_ROW_PAD_TOP_PX}px 0 4px 0;line-height:0;width:100%;max-width:100%;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="right" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 0 auto;"><tr>
<td width="${T3_COMPACT_CONTACT_TEXT_W_PX}" align="right" valign="top" style="width:${T3_COMPACT_CONTACT_TEXT_W_PX}px;max-width:${T3_COMPACT_CONTACT_TEXT_W_PX}px;padding:0 8px 0 0;font-size:11px;color:{{company_muted}};line-height:1.35;mso-line-height-rule:exactly;text-align:right;vertical-align:top;${T3_WRAP}">{{#if t16_tel_href}}<a href="{{{t16_tel_href}}}" style="color:{{company_muted}};text-decoration:none;">{{phone}}</a>{{else}}{{phone}}{{/if}}</td>
<td width="${T3_ICON_GUTTER_PX}" valign="top" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_phone}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
</tr></table>
</td></tr>{{/if}}
{{#if email}}<tr><td align="right" style="padding:2px 0 0 0;line-height:0;width:100%;max-width:100%;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="right" style="width:100%;max-width:100%;table-layout:fixed;border-collapse:collapse;margin:0 0 0 auto;"><tr>
<td width="${T3_COMPACT_CONTACT_TEXT_W_PX}" align="right" valign="top" style="width:${T3_COMPACT_CONTACT_TEXT_W_PX}px;max-width:${T3_COMPACT_CONTACT_TEXT_W_PX}px;padding:0 8px 0 0;font-size:10px;line-height:1.4;mso-line-height-rule:exactly;text-align:right;vertical-align:top;${T3_WRAP}">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{company_muted}};text-decoration:none;">{{email}}</a>{{else}}<span style="color:{{company_muted}};">{{email}}</span>{{/if}}</td>
<td width="${T3_ICON_GUTTER_PX}" valign="top" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_mail}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
</tr></table>
</td></tr>{{/if}}
</table>
</td>
</tr>
<tr>
<td width="${T3_COMPACT_COL_W_PX}" valign="top" style="width:${T3_COMPACT_COL_W_PX}px;max-width:${T3_COMPACT_COL_W_PX}px;vertical-align:top;padding:${T3_LEFT_RAIL_ROW2_PAD_TOP_PX}px 8px 6px 10px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
{{#if has_website}}<tr><td align="left" style="padding:0 0 5px 0;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr>
<td width="${T3_ICON_GUTTER_PX}" valign="middle" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_globe}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
<td align="left" valign="middle" style="padding:0 0 0 8px;font-size:11px;line-height:1.35;mso-line-height-rule:exactly;${T3_WRAP}"><a href="{{{website_full}}}" style="color:{{company_muted}};text-decoration:none;">{{website}}</a></td>
</tr></table>
</td></tr>{{/if}}
{{#if has_address}}<tr><td align="left" style="padding:0 0 6px 0;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr>
<td width="${T3_ICON_GUTTER_PX}" valign="top" style="width:${T3_ICON_GUTTER_PX}px;min-width:${T3_ICON_GUTTER_PX}px;max-width:${T3_ICON_GUTTER_PX}px;padding:0;line-height:0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" style="background-color:{{t3_icon_cell}};border-radius:4px;"><tr><td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;padding:0;line-height:0;"><img src="{{{t3_icon_pin}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td></tr></table></td>
<td align="left" valign="top" style="padding:0 0 0 8px;font-size:11px;color:{{company_muted}};line-height:1.42;mso-line-height-rule:exactly;${T3_WRAP}">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr></table>
</td></tr>{{/if}}
{{#if has_socials}}<tr><td align="left" style="padding:3px 0 0 0;vertical-align:bottom;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;"><tr>
{{#if has_facebook}}<td style="padding:0 5px 0 0;line-height:0;"><a href="{{{facebook_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_facebook}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
{{#if has_twitter}}<td style="padding:0 5px 0 0;line-height:0;"><a href="{{{twitter_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_twitter}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
{{#if has_instagram}}<td style="padding:0 5px 0 0;line-height:0;"><a href="{{{instagram_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_instagram}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
{{#if has_linkedin}}<td style="padding:0;line-height:0;"><a href="{{{linkedin_url}}}" style="text-decoration:none;"><img src="{{{t3_soc_linkedin}}}" width="24" height="24" alt="" style="display:block;border:0;"></a></td>{{/if}}
</tr></table>
</td></tr>{{/if}}
</table>
</td>
</tr>
{{/if}}
</table>
</td>
</tr>
</table>`;
