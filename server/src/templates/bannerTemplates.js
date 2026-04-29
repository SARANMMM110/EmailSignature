/**
 * CTA banner strips — inline CSS, table layout. Compiled with Handlebars + banner_link, colors.
 */

import { ONLINE_LOAN_PEOPLE_SVG, REVOLIO_MARK_SVG } from './revolioOnlineLoanBannerAssets.js';
import {
  CITY_BUSINESS_CURVE_SVG,
  CITY_BUSINESS_LOGO_HEX_SVG,
  CITY_BUSINESS_SKYLINE_SVG,
} from './cityBusinessBannerAssets.js';
import {
  REVIEW_ARROW_CIRCLE_SVG,
  REVIEW_STAR_SCENE_SVG_AFTER_WIDTH,
  REVIEW_STAR_SCENE_SVG_BODY,
  REVIEW_STAR_SCENE_SVG_OPEN,
  REVIEW_WAVE_HAND_SVG,
} from './reviewInviteBannerAssets.js';
import {
  SEO_DARK_GRID_ARROW_SVG,
  SEO_DARK_GRID_SVG_AFTER_WIDTH,
  SEO_DARK_GRID_SVG_BODY,
  SEO_DARK_GRID_SVG_OPEN,
} from './seoDarkGridBannerAssets.js';
import { BANNER_SLUG_TO_UUID } from '../lib/templateIds.js';
import {
  GREEN_GRADIENT_DECOR_SVG_AFTER_WIDTH,
  GREEN_GRADIENT_DECOR_SVG_BODY,
  GREEN_GRADIENT_DECOR_SVG_OPEN,
  GREEN_GRADIENT_LOGO_SVG,
} from './greenGradientCtaBannerAssets.js';
export const BANNER_TEMPLATES = {
  /** Webinar / CTA banner 1 — warm surface, palette-tinted blob graphic (right), brand + headline + subtext, bold pill CTA. */
  banner_1: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:16px;-webkit-border-radius:16px;overflow:hidden;mso-border-radius-alt:16px;position:relative;background-color:{{banner_surface_bg}};min-height:{{banner_min_height}}px;">
<img src="{{{banner_b1_blobs_uri}}}" width="{{banner_rail_w_px}}" height="{{banner_b1_blobs_h}}" alt="" role="presentation" style="display:block;border:0;line-height:0;font-size:0;width:{{banner_rail_w_px}}px;height:{{banner_b1_blobs_h}}px;position:absolute;right:0;top:0;left:auto;z-index:0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;position:relative;z-index:1;">
<tr>
<td valign="middle" align="left" width="{{#if banner_has_cta}}99%{{else}}100%{{/if}}" style="width:{{#if banner_has_cta}}99%{{else}}100%{{/if}};max-width:100%;padding:11px 6px 11px 16px;vertical-align:middle;text-align:left;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;mso-line-height-rule:exactly;">
<p style="margin:0 0 3px;padding:0;color:{{banner_brand_color}};font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;line-height:1.2;">{{banner_brand_label}}</p>
<p style="margin:0 0 5px;padding:0;color:{{banner_headline_color}};font-size:17px;font-weight:800;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_headline_html}}}</p>
<p style="margin:0;padding:0;color:{{banner_subline_color}};font-size:10px;font-weight:400;line-height:1.45;mso-line-height-rule:exactly;">{{{banner_subline_html}}}</p>
</td>
{{#if banner_has_cta}}<td valign="middle" align="right" width="1%" style="width:1%;white-space:nowrap;padding:11px 16px 11px 8px;vertical-align:middle;text-align:right;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;mso-line-height-rule:exactly;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:2px solid {{banner_cta_border}};border-radius:50px;-webkit-border-radius:50px;padding:8px 18px;font-size:12px;font-weight:800;color:{{banner_cta_text}};text-decoration:none;line-height:1.2;mso-line-height-rule:exactly;background-color:{{banner_cta_pill_bg}};mso-padding-alt:8px 18px;box-shadow:0 1px 2px rgba(15,23,42,0.08);">{{{banner_text}}}</a>
</td>{{/if}}
</tr>
</table>
</td>
</tr>
</table>`,

  /**
   * Book-a-call CTA — `banner_b2_row_h` = compact strip height (banner 1 text row scale, ~92px @ 560px rail).
   * Three columns: copy (left), yellow pill CTA (center), doodle + photo (right) so the middle is not empty.
   * {@link compileBannerInnerHtml} sets `banner_b2_*` + `banner_b2_image`.
   */
  banner_2: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:{{banner_b2_radius}}px;-webkit-border-radius:{{banner_b2_radius}}px;overflow:hidden;mso-border-radius-alt:{{banner_b2_radius}}px;background-color:{{banner_b2_grad_end}};background-image:linear-gradient(135deg,{{banner_b2_grad_start}} 0%,{{banner_b2_grad_end}} 100%);box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b2_row_h}}px;mso-line-height-rule:exactly;">
<tr>
<td width="40%" valign="middle" style="width:40%;max-width:40%;vertical-align:middle;padding:{{banner_b2_pad_t}}px {{banner_b2_pad_l}}px {{banner_b2_pad_t}}px {{banner_b2_pad_l}}px;overflow:hidden;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:0 0 2px 0;">
<table cellpadding="0" cellspacing="{{banner_b2_dot_gap}}" border="0" role="presentation" style="border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="width:{{banner_b2_dot}}px;height:{{banner_b2_dot}}px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b2_dot_fill}};">&nbsp;</td>
<td style="width:{{banner_b2_dot}}px;height:{{banner_b2_dot}}px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b2_dot_fill}};">&nbsp;</td>
<td style="width:{{banner_b2_dot}}px;height:{{banner_b2_dot}}px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b2_dot_fill}};">&nbsp;</td>
<td style="width:{{banner_b2_dot}}px;height:{{banner_b2_dot}}px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b2_dot_fill}};">&nbsp;</td>
</tr>
</table>
</td></tr>
<tr><td style="padding:0;">
<p style="margin:0;padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b2_fs_title}}px;line-height:1.12;font-weight:800;letter-spacing:-0.25px;color:{{banner_b2_title_line_color}};mso-line-height-rule:exactly;">{{{banner_b2_title_white_html}}} <span style="color:{{banner_b2_title_accent}};">{{{banner_b2_title_yellow}}}</span></p>
<p style="margin:{{banner_b2_gap_sub}}px 0 0 0;padding:0;max-width:520px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b2_fs_sub}}px;line-height:1.22;font-weight:400;color:{{banner_b2_subtitle_color}};mso-line-height-rule:exactly;">{{{banner_b2_subtitle_html}}}</p>
</td></tr>
</table>
</td>
<td width="24%" valign="middle" align="center" style="width:24%;max-width:24%;min-width:108px;vertical-align:middle;text-align:center;padding:{{banner_b2_pad_t}}px 4px;mso-line-height-rule:exactly;">
<table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="border-collapse:collapse;margin:0 auto;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td align="center" style="background-color:{{banner_b2_btn_bg}};border:2px solid {{banner_b2_btn_border}};border-radius:{{banner_b2_btn_r}}px;-webkit-border-radius:{{banner_b2_btn_r}}px;padding:{{banner_b2_btn_py}}px {{banner_b2_btn_px}}px;box-shadow:0 1px 2px rgba(15,23,42,0.08);text-align:center;mso-padding-alt:{{banner_b2_btn_py}}px {{banner_b2_btn_px}}px;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center" style="border-collapse:collapse;margin:0 auto;"><tr>
<td valign="middle" style="padding:0 {{banner_b2_cal_pad_r}}px 0 0;vertical-align:middle;line-height:0;">{{{banner_b2_cal_html}}}</td>
<td valign="middle" style="padding:0;vertical-align:middle;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b2_fs_btn}}px;font-weight:800;color:{{banner_b2_btn_ink}};text-transform:uppercase;letter-spacing:0.03em;line-height:1.2;mso-line-height-rule:exactly;white-space:nowrap;">{{{banner_b2_cta_label}}}</td>
<td valign="middle" style="padding:0 0 0 {{banner_b2_cal_pad_r}}px;vertical-align:middle;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b2_fs_btn}}px;font-weight:400;color:{{banner_b2_btn_ink}};line-height:1;mso-line-height-rule:exactly;">&#8594;</td>
</tr></table>
</td>
</tr>
</table>
</td>
<td width="36%" valign="middle" style="width:36%;max-width:36%;vertical-align:middle;padding:{{banner_b2_pad_t}}px {{banner_b2_pad_side_right}}px {{banner_b2_pad_t}}px 2px;text-align:right;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin-left:auto;">
<tr>
<td valign="bottom" style="vertical-align:bottom;padding:0 2px 2px 0;line-height:0;font-size:0;">
<img src="{{{banner_b2_doodle_uri}}}" width="{{banner_b2_doodle_w}}" height="{{banner_b2_doodle_h}}" alt="" style="display:block;border:0;width:{{banner_b2_doodle_w}}px;height:{{banner_b2_doodle_h}}px;-ms-interpolation-mode:bicubic;">
</td>
<td valign="middle" style="vertical-align:middle;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;border:{{banner_b2_img_border}}px solid {{banner_b2_img_border_rgba}};border-radius:{{banner_b2_img_outer_r}}px;-webkit-border-radius:{{banner_b2_img_outer_r}}px;"><tr><td style="padding:1px;line-height:0;font-size:0;">
<img src="{{{banner_b2_image}}}" alt="" width="{{banner_b2_img_w}}" height="{{banner_b2_img_h}}" style="{{{banner_b2_image_style}}}">
</td></tr></table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</a>
</td>
</tr>
</table>`,

  /** Compact resume / download strip (moved from legacy banner_2). */
  banner_3: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="background-color:{{color_1}};padding:8px 12px;border-radius:9px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr>
{{#if banner_side_image}}
<td valign="middle" style="width:128px;min-width:96px;padding:0 12px 0 0;line-height:0;vertical-align:middle;"><img src="{{{banner_side_image}}}" alt="" width="120" height="90" style="{{{banner_side_image_style}}}"></td>
{{/if}}
<td width="60%" valign="middle" style="color:{{color_4}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:12px;font-weight:700;vertical-align:middle;">{{{banner_b3_left_text}}}</td>
<td width="40%" valign="middle" align="right" style="vertical-align:middle;"><a href="{{{banner_link}}}" style="background-color:{{banner_b3_pill_bg}};color:{{banner_b3_cta_ink}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:12px;font-weight:800;text-decoration:none;padding:7px 14px;border-radius:18px;display:inline-block;border:1px solid {{banner_b3_cta_border}};">{{{banner_text}}}</a></td>
</tr>
</table>
</td></tr>
</table>`,

  /**
   * Subscriber funnel strip — S-curve seam, lavender rail + journey, navy panel (wider **48%** text rail),
   * `#3b82f6` accent, subline + CTA gradient from palette, subtle shell border.
   */
  banner_4: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;border-radius:{{banner_b4_shell_radius}}px;-webkit-border-radius:{{banner_b4_shell_radius}}px;overflow:hidden;border:{{banner_b4_shell_border}};mso-line-height-rule:exactly;box-shadow:0 8px 20px rgba(0,0,0,0.10);">
<tr>
<td width="52%" valign="top" align="left" style="width:52%;min-width:150px;vertical-align:top;padding:0;margin:0;height:{{banner_b4_scene_h}}px;max-height:{{banner_b4_scene_h}}px;line-height:0;font-size:0;background-color:{{banner_b4_left_fallback_bg}};overflow:hidden;">{{#if banner_b4_scene_image}}<img src="{{{banner_b4_scene_image}}}" alt="" width="624" height="{{banner_b4_scene_h}}" style="{{{banner_b4_scene_image_style}}}">{{else}}{{{banner_b4_scene_svg}}}{{/if}}</td>
<td width="48%" valign="middle" style="width:48%;vertical-align:middle;background-color:{{banner_b4_right_bg_solid}};background-image:{{banner_b4_right_bg_image}};padding:{{banner_b4_pad_top}}px {{banner_b4_pad_right}}px {{banner_b4_pad_bottom}}px {{banner_b4_pad_left}}px;mso-line-height-rule:exactly;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td valign="middle" style="padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;mso-line-height-rule:exactly;">
<p style="margin:0;padding:0;color:{{banner_b4_title_color}};font-size:{{banner_b4_fs_title}}px;font-weight:800;line-height:1.05;letter-spacing:-0.6px;mso-line-height-rule:exactly;">{{{banner_b4_title_plain_html}}}<span style="color:{{banner_b4_accent}};font-weight:800;">{{{banner_b4_accent_html}}}</span></p>
<p style="margin:{{banner_b4_sub_margin_t}}px 0 0 0;padding:0;max-width:420px;color:{{banner_b4_sub_color}};font-size:{{banner_b4_fs_sub}}px;font-weight:400;line-height:1.5;mso-line-height-rule:exactly;">{{{banner_b4_sub_html}}}</p>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:{{banner_b4_cta_margin_t}}px 0 0 0;"><tr><td align="right" style="padding:0;mso-line-height-rule:exactly;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr><td style="padding:0;border-radius:{{banner_b4_cta_radius}}px;-webkit-border-radius:{{banner_b4_cta_radius}}px;background-color:{{banner_b4_cta_bg_mid}};background-image:linear-gradient(90deg,{{banner_b4_cta_g1}} 0%,{{banner_b4_cta_g2}} 100%);box-shadow:0 12px 18px rgba(0,0,0,0.18);mso-padding-alt:0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr>
<td valign="middle" style="padding:{{banner_b4_cta_pad_v}}px {{banner_b4_cta_pad_h}}px;vertical-align:middle;line-height:0;font-size:0;">
<svg xmlns="http://www.w3.org/2000/svg" width="{{banner_b4_rocket_wh}}" height="{{banner_b4_rocket_wh}}" viewBox="0 0 24 24" fill="none" style="display:block;"><path d="M12 2.5c1.2 3.2 2 6.4 2 9.5a2 2 0 11-4 0c0-3.1.8-6.3 2-9.5z" fill="{{banner_b4_cta_rocket_fill}}"/><path d="M10 20h4l-1-4h-2l-1 4zM8 14l-4 1 1.2 2.8L8 14zm8 0l4 1-1.2 2.8L16 14z" fill="{{banner_b4_cta_rocket_fill}}" opacity="0.9"/></svg>
</td>
<td valign="middle" style="padding:{{banner_b4_cta_pad_v}}px 4px {{banner_b4_cta_pad_v}}px 0;vertical-align:middle;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b4_fs_cta}}px;font-weight:700;color:{{banner_b4_cta_ink}};line-height:1.2;mso-line-height-rule:exactly;">{{{banner_text}}}</td>
<td valign="middle" style="padding:{{banner_b4_cta_pad_v}}px {{banner_b4_cta_pad_h}}px {{banner_b4_cta_pad_v}}px 2px;vertical-align:middle;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b4_fs_arrow}}px;font-weight:700;color:{{banner_b4_cta_ink}};line-height:1;">&#8594;</td>
</tr></table>
</td></tr></table>
</td></tr></table>
</td>
</tr></table>
</td></tr></table>
</a>
</td></tr>
</table>`,

  /**
   * Corporate “Boost” strip (`banner_8`): compact row; `compileBannerInnerHtml` sets `banner_b8_*` layout from signature rail width (`banner_rail_w_px`).
   */
  banner_8:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;line-height:normal;font-size:14px;mso-line-height-rule:exactly;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;border-radius:{{banner_b8_shell_radius}}px;-webkit-border-radius:{{banner_b8_shell_radius}}px;overflow:hidden;border:1px solid {{banner_b8_shell_border}};mso-line-height-rule:exactly;min-height:{{banner_b8_shell_min_h}}px;">
<tr>
<td valign="middle" width="21%" style="width:21%;min-width:104px;max-width:168px;vertical-align:middle;text-align:center;background-color:{{banner_b8_left_bg}};background-image:{{{banner_b8_left_bg_image}}};background-size:10px 10px;border-right:3px solid {{banner_b8_gold}};padding:{{banner_b8_pad_left}};mso-line-height-rule:exactly;">
<div style="margin:0 auto;line-height:0;">{{{banner_b8_leaf_inner}}}</div>
{{#if banner_b8_has_logo_main}}<p style="margin:{{banner_b8_logo_main_mt}};padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b8_fs_logo_main}}px;font-weight:800;color:{{banner_b8_gold}};letter-spacing:0.06em;text-transform:uppercase;line-height:1.1;mso-line-height-rule:exactly;">{{{banner_b8_logo_main}}}</p>{{/if}}
</td>
<td valign="middle" width="46%" style="width:46%;min-width:160px;vertical-align:middle;background-color:{{banner_b8_mid_bg}};background-image:{{{banner_b8_mid_bg_image}}};background-size:{{{banner_b8_mid_bg_size}}};background-repeat:repeat,no-repeat;padding:{{banner_b8_pad_mid}};mso-line-height-rule:exactly;">
{{#if banner_b8_has_headline}}<p style="margin:0;padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b8_fs_headline}}px;font-weight:800;line-height:1.08;letter-spacing:-0.02em;text-transform:none;mso-line-height-rule:exactly;">{{{banner_b8_headline_html}}}</p>{{/if}}
{{#if banner_b8_has_subline}}<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin-top:{{banner_b8_subline_mt}};mso-line-height-rule:exactly;"><tr>
<td width="3" style="width:3px;background-color:{{banner_b8_gold}};font-size:0;line-height:0;">&nbsp;</td>
<td style="padding:0 0 0 8px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b8_fs_sub}}px;font-weight:500;color:{{banner_b8_mid_sub_color}};line-height:1.32;letter-spacing:0.01em;mso-line-height-rule:exactly;">{{{banner_b8_subline}}}</td>
</tr></table>{{/if}}
{{#unless banner_b8_mid_has_copy}}<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td style="min-height:{{banner_b8_mid_ph}}px;font-size:0;line-height:0;">&nbsp;</td></tr></table>{{/unless}}
</td>
<td valign="middle" width="33%" style="width:33%;min-width:148px;vertical-align:middle;background-color:{{banner_b8_right_bg}};background-image:{{{banner_b8_right_bg_image}}};background-size:10px 10px;padding:{{banner_b8_pad_right}};mso-line-height-rule:exactly;">
{{#if banner_b8_has_blurb}}<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td valign="middle" width="{{banner_b8_rocket_cell_w}}" style="width:{{banner_b8_rocket_cell_w}}px;padding:0 6px 0 0;vertical-align:middle;line-height:0;font-size:0;">{{{banner_b8_rocket_svg}}}</td>
<td valign="middle" style="padding:0;vertical-align:middle;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b8_fs_blurb}}px;font-weight:500;color:{{banner_b8_right_blurb_color}};line-height:1.34;letter-spacing:0.02em;mso-line-height-rule:exactly;">{{{banner_b8_right_blurb}}}</td>
</tr></table>{{else}}<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td align="center" valign="middle" style="padding:0 0 4px 0;line-height:0;font-size:0;">{{{banner_b8_rocket_svg}}}</td></tr></table>{{/if}}
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin-top:{{banner_b8_cta_mt}};"><tr><td style="padding:0;">
<span style="display:inline-block;background-color:{{banner_b8_cta_bg}};border-radius:4px;padding:{{banner_b8_cta_pad_v}}px {{banner_b8_cta_pad_h}}px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b8_fs_cta}}px;font-weight:800;color:{{banner_b8_cta_text}};letter-spacing:0.08em;text-transform:uppercase;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b8_cta}}}&nbsp;<span style="color:{{banner_b8_cta_text}};font-size:{{banner_b8_fs_cta_arrow}}px;font-weight:800;">&#8594;</span></span>
</td></tr>
<tr><td align="right" style="padding:{{banner_b8_dots_pad_t}}px 0 0 0;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;"><tr>
<td style="width:4px;height:4px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b8_dot_hi}};">&nbsp;</td>
<td style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:4px;height:4px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b8_dot_lo}};">&nbsp;</td>
<td style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:4px;height:4px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b8_dot_lo}};">&nbsp;</td>
<td style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:4px;height:4px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b8_dot_lo}};">&nbsp;</td>
<td style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:4px;height:4px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b8_dot_lo}};">&nbsp;</td>
</tr></table>
</td></tr></table>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Online loan strip (`banner_9`) — warm `#f5f0e8` rail, 4px corners, Arial Black headline (left),
   * inline people SVG center (or optional `banner_image_url` photo), gold bar + REVOLIO + forest CTA (right).
   * Matches reference flex layout at 728×90, scaled via `banner_b9_fs_*` for narrower signature rails.
   */
  banner_9:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;background-color:{{banner_b9_surface}};border-radius:4px;-webkit-border-radius:4px;overflow:hidden;mso-border-radius-alt:4px;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:90px;">
<tr>
<td valign="middle" width="32%" style="width:32%;max-width:210px;vertical-align:middle;background-color:{{banner_b9_surface}};padding:0 8px 0 24px;mso-padding-alt:0 8px 0 24px;">
<p style="margin:0;padding:0;font-family:'Arial Black',Arial,Helvetica,Roboto,{{font_family}},sans-serif;font-size:{{banner_b9_fs_h}}px;font-weight:900;line-height:1.15;color:{{banner_b9_headline_color}};letter-spacing:-0.3px;text-transform:none;mso-line-height-rule:exactly;">{{{banner_b9_line1}}}</p>
<p style="margin:0;padding:0;font-family:'Arial Black',Arial,Helvetica,Roboto,{{font_family}},sans-serif;font-size:{{banner_b9_fs_h}}px;font-weight:900;line-height:1.15;color:{{banner_b9_headline_color}};letter-spacing:-0.3px;text-transform:none;mso-line-height-rule:exactly;">{{{banner_b9_line2}}}</p>
</td>
<td valign="bottom" width="44%" align="center" style="width:44%;vertical-align:bottom;background-color:{{banner_b9_surface}};padding:0;line-height:0;font-size:0;">
{{#if banner_b9_custom_hero}}
<img src="{{{banner_b9_hero}}}" alt="" width="280" height="140" style="{{{banner_b9_hero_style}}}">
{{else}}
` +
    ONLINE_LOAN_PEOPLE_SVG +
    `{{/if}}
</td>
<td valign="top" width="24%" style="width:24%;min-width:118px;vertical-align:top;background-color:{{banner_b9_surface}};padding:10px 22px 10px 6px;mso-padding-alt:10px 22px 10px 6px;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin:0 0 0 auto;"><tr>
<td valign="middle" style="padding:0 4px 0 0;line-height:0;vertical-align:middle;">` +
    REVOLIO_MARK_SVG +
    `</td>
<td valign="middle" style="padding:0;vertical-align:middle;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b9_fs_b}}px;font-weight:800;color:{{banner_b9_brand_color}};letter-spacing:1px;text-transform:uppercase;line-height:1;mso-line-height-rule:exactly;">{{{banner_b9_brand}}}</td>
</tr></table>
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin:6px 0 0 auto;"><tr><td style="padding:0;line-height:0;">
<span style="display:inline-block;background-color:{{banner_b9_cta_bg}};color:{{banner_b9_cta_text}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-weight:800;font-size:{{banner_b9_fs_cta}}px;letter-spacing:0.8px;text-transform:uppercase;line-height:1;padding:10px 20px;mso-padding-alt:10px 20px;border-radius:6px;-webkit-border-radius:6px;mso-line-height-rule:exactly;">{{{banner_b9_cta}}}</span>
</td></tr></table>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Business / city skyline strip (`banner_10`): dark `#1a1a2e` rail, white curved left panel, teal accent,
   * skyline SVG, top-right logo (`banner_b10_logo_img` from upload) or hex + `field_5` wordmark. `field_1`–`field_3` headlines; `text` = CTA.
   */
  banner_10:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;background-color:{{banner_b10_dark}};">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:90px;">
<tr>
<td valign="middle" width="41%" style="width:41%;max-width:310px;vertical-align:middle;background-color:{{banner_b10_card_bg}};border-radius:0 36px 36px 0;-webkit-border-radius:0 36px 36px 0;padding:0;mso-border-radius-alt:0 36px 36px 0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td valign="middle" style="padding:12px 8px 12px 18px;mso-padding-alt:12px 8px 12px 18px;">
<p style="margin:0 0 1px 0;padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b10_fs_bus}}px;font-weight:700;color:{{banner_b10_line_color}};letter-spacing:1.5px;text-transform:uppercase;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b10_business}}}</p>
<p style="margin:0;padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b10_fs_title}}px;font-weight:900;color:{{banner_b10_accent}};text-transform:uppercase;letter-spacing:0.5px;line-height:1;mso-line-height-rule:exactly;">{{{banner_b10_banner}}}</p>
<p style="margin:0 0 5px 0;padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b10_fs_title}}px;font-weight:900;color:{{banner_b10_line_color}};text-transform:uppercase;letter-spacing:0.5px;line-height:1;mso-line-height-rule:exactly;">{{{banner_b10_design}}}</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 7px 0;"><tr>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b10_dot1}};">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b10_dot2}};">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b10_dot2}};">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:{{banner_b10_dot2}};">&nbsp;</td>
</tr></table>
<span style="display:inline-block;background-color:{{banner_b10_dark}};color:{{banner_b10_cta_ink}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b10_fs_cta}}px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;line-height:1;padding:6px 12px;mso-padding-alt:6px 12px;border-radius:3px;-webkit-border-radius:3px;mso-line-height-rule:exactly;">{{{banner_b10_cta}}}</span>
</td>
<td valign="middle" width="6" style="width:6px;padding:0 6px 0 0;vertical-align:middle;">
<span style="display:inline-block;width:4px;height:60px;line-height:0;font-size:0;border-radius:2px;background:{{banner_b10_bar_grad}};">&nbsp;</span>
</td>
</tr></table>
</td>
<td valign="middle" width="6%" style="width:6%;min-width:36px;max-width:44px;vertical-align:middle;background-color:{{banner_b10_dark}};padding:0;line-height:0;font-size:0;text-align:center;">` +
    CITY_BUSINESS_CURVE_SVG +
    `</td>
<td valign="bottom" width="53%" style="width:53%;vertical-align:bottom;background-color:{{banner_b10_dark}};background-image:{{banner_b10_right_bg_image}};padding:0;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td align="right" valign="top" style="padding:8px 14px 4px 0;line-height:0;font-size:0;">
{{#if banner_b10_logo_img}}
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;"><tr><td align="right" valign="top" style="padding:0;line-height:0;">
<img src="{{{banner_b10_logo_img}}}" alt="" width="200" height="100" style="{{{banner_b10_logo_style}}}">
</td></tr></table>
{{else}}
<table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;background-color:{{banner_b10_dark}};border-radius:3px;padding:5px 8px;mso-padding-alt:5px 8px;"><tr><td align="center" style="padding:0;line-height:0;">` +
    CITY_BUSINESS_LOGO_HEX_SVG +
    `</td></tr>
<tr><td align="center" style="padding:2px 0 0 0;">
<p style="margin:0;padding:0;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:{{banner_b10_fs_logo}}px;font-weight:700;color:{{banner_b10_logo_ink}};letter-spacing:1px;text-transform:uppercase;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b10_company}}}</p>
</td></tr></table>
{{/if}}
</td></tr>
<tr><td align="right" valign="bottom" style="padding:0;line-height:0;font-size:0;">` +
    CITY_BUSINESS_SKYLINE_SVG +
    `</td></tr>
</table>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Leave a review card (`banner_11`): white rounded card, title + subtitle (left), wave hand, illustration + grey blob,
   * black circular arrow CTA (visual only — whole strip is one link). `field_1` title, `field_2` subtitle.
   */
  banner_11:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" title="{{{banner_b11_a_title}}}" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b11_min_h}}px;background-color:{{banner_b11_card_bg}};border:1px solid {{banner_b11_border}};border-radius:16px;-webkit-border-radius:16px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="width:32%;max-width:220px;vertical-align:middle;padding:12px 6px 12px 18px;mso-padding-alt:12px 6px 12px 18px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;">
<p style="margin:0 0 4px 0;padding:0;font-size:{{banner_b11_fs_title}}px;font-weight:800;color:{{banner_b11_title_color}};line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b11_title}}}</p>
<p style="margin:0;padding:0;font-size:{{banner_b11_fs_sub}}px;font-weight:400;color:{{banner_b11_sub_color}};line-height:1.25;mso-line-height-rule:exactly;">{{{banner_b11_subtitle}}}</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:8px;"><tr><td style="padding:0;line-height:0;font-size:0;">` +
    REVIEW_WAVE_HAND_SVG +
    `</td></tr></table>
</td>
<td valign="middle" style="width:52%;vertical-align:middle;padding:8px 4px;line-height:0;font-size:0;text-align:center;">
{{#if banner_b11_has_promo}}
<img src="{{{banner_b11_promo_image}}}" alt="" width="280" height="140" style="{{{banner_b11_promo_style}}}">
{{else}}
<table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="border-collapse:collapse;margin:0 auto;"><tr><td style="padding:0;line-height:0;font-size:0;width:{{banner_b11_art_w}}px;max-width:100%;">` +
    REVIEW_STAR_SCENE_SVG_OPEN +
    `{{banner_b11_art_w}}` +
    REVIEW_STAR_SCENE_SVG_AFTER_WIDTH +
    REVIEW_STAR_SCENE_SVG_BODY +
    `</td></tr></table>
{{/if}}
</td>
<td valign="middle" align="center" style="width:16%;min-width:52px;vertical-align:middle;padding:8px 16px 8px 6px;mso-padding-alt:8px 16px 8px 6px;text-align:center;line-height:0;font-size:0;">` +
    REVIEW_ARROW_CIRCLE_SVG +
    `</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Dark grid resource strip (`banner_12`): `#1a2530` rail, 14px corners, white title + muted subtitle (left),
   * SVG grid + left fade (right), square arrow tile. `field_1` title, `field_2` subtitle; whole row is one link.
   */
  banner_12:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" title="{{{banner_b12_a_title}}}" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b12_min_h}}px;background-color:{{banner_b12_bg}};border-radius:14px;-webkit-border-radius:14px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="width:34%;max-width:240px;vertical-align:middle;padding:10px 8px 10px 22px;mso-padding-alt:10px 8px 10px 22px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;">
<p style="margin:0;padding:0;font-size:{{banner_b12_fs_title}}px;font-weight:700;color:{{banner_b12_title_color}};letter-spacing:0.1px;line-height:1.3;mso-line-height-rule:exactly;">{{{banner_b12_title}}}</p>
<p style="margin:1px 0 0 0;padding:0;font-size:{{banner_b12_fs_sub}}px;font-weight:400;color:{{banner_b12_sub}};line-height:1.35;mso-line-height-rule:exactly;">{{{banner_b12_subtitle}}}</p>
</td>
<td valign="middle" align="right" style="vertical-align:middle;padding:0;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin-left:auto;"><tr>
<td valign="middle" align="right" style="padding:0;line-height:0;font-size:0;">
{{#if banner_b12_has_promo}}
<img src="{{{banner_b12_promo_image}}}" alt="" width="280" height="90" style="{{{banner_b12_promo_style}}}">
{{else}}
` +
    SEO_DARK_GRID_SVG_OPEN +
    `{{banner_b12_grid_w}}` +
    SEO_DARK_GRID_SVG_AFTER_WIDTH +
    SEO_DARK_GRID_SVG_BODY +
    `{{/if}}
</td>
<td valign="middle" align="center" style="width:52px;min-width:48px;vertical-align:middle;padding:0 18px 0 10px;mso-padding-alt:0 18px 0 10px;line-height:0;font-size:0;">` +
    SEO_DARK_GRID_ARROW_SVG +
    `</td>
</tr></table>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Green gradient CTA (`banner_13`): 135° mint→teal rail, overlapping-square logo, headline with optional line breaks,
   * decorative SVG on the right, CTA label + arrow. `field_1` headline (use line breaks); `text` = CTA phrase.
   */
  banner_13:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" title="{{{banner_b13_a_title}}}" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b13_min_h}}px;background-color:{{banner_b13_bg}};background-image:{{banner_b13_grad}};border-radius:12px;-webkit-border-radius:12px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="width:56px;min-width:48px;vertical-align:middle;padding:10px 8px 10px 28px;mso-padding-alt:10px 8px 10px 28px;line-height:0;font-size:0;">` +
    GREEN_GRADIENT_LOGO_SVG +
    `</td>
<td valign="middle" style="vertical-align:middle;padding:10px 8px;mso-padding-alt:10px 8px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;">
<p style="margin:0;padding:0;font-size:{{banner_b13_fs_title}}px;font-weight:600;color:{{banner_b13_title_color}};line-height:1.35;letter-spacing:-0.2px;mso-line-height-rule:exactly;">{{{banner_b13_title_html}}}</p>
</td>
<td valign="middle" align="right" style="width:{{banner_b13_decor_w}}px;max-width:38%;min-width:120px;vertical-align:middle;padding:4px 6px 4px 0;line-height:0;font-size:0;">
{{#if banner_b13_has_promo}}
<img src="{{{banner_b13_promo_image}}}" alt="" width="220" height="140" style="{{{banner_b13_promo_style}}}">
{{else}}
` +
    GREEN_GRADIENT_DECOR_SVG_OPEN +
    `{{banner_b13_decor_w}}` +
    GREEN_GRADIENT_DECOR_SVG_AFTER_WIDTH +
    GREEN_GRADIENT_DECOR_SVG_BODY +
    `{{/if}}
</td>
<td valign="middle" align="right" style="vertical-align:middle;white-space:nowrap;padding:10px 28px 10px 8px;mso-padding-alt:10px 28px 10px 8px;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;">
<span style="display:inline-block;border:2px solid {{banner_b13_cta_pill_border}};border-radius:50px;-webkit-border-radius:50px;padding:8px 16px;background-color:{{banner_b13_cta_pill_bg}};box-shadow:0 1px 2px rgba(15,23,42,0.08);mso-padding-alt:8px 16px;"><span style="font-size:{{banner_b13_fs_cta}}px;font-weight:800;color:{{banner_b13_cta_pill_text}};letter-spacing:0.2px;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b13_cta}}}</span><span style="font-size:{{banner_b13_fs_arrow}}px;font-weight:300;color:{{banner_b13_cta_pill_text}};line-height:1;margin-left:10px;mso-line-height-rule:exactly;">&#8594;</span></span>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Image-only strip — fixed cell; `{{{banner_blank_img_style}}}` scales image with `object-fit:fill` to the strip.
   */
  banner_blank: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;table-layout:fixed;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td bgcolor="#f8fafc" style="padding:0;margin:0;line-height:0;font-size:0;width:{{banner_rail_w_px}}px;max-width:100%;height:{{banner_blank_h_px}}px;max-height:{{banner_blank_h_px}}px;overflow:hidden;vertical-align:middle;background-color:#f8fafc;">
{{#if banner_blank_linked}}<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;line-height:0;width:100%;max-width:100%;height:{{banner_blank_h_px}}px;max-height:{{banner_blank_h_px}}px;overflow:hidden;">{{/if}}
<img src="{{{banner_full_image}}}" alt="" width="{{banner_rail_w_px}}" height="{{banner_blank_h_px}}" style="{{{banner_blank_img_style}}}">
{{#if banner_blank_linked}}</a>{{/if}}
</td></tr>
</table>`,
};

/**
 * Map editor preset_id / banner id string → BANNER_TEMPLATES key.
 * Order: specific matches before generic "call".
 */
export function resolveBannerKey(banner) {
  if (!banner) return null;
  const id = String(banner.id || banner.preset_id || '').toLowerCase();
  const webinarUuid = String(BANNER_SLUG_TO_UUID.webinar).toLowerCase();
  const needCallUuid = String(BANNER_SLUG_TO_UUID['need-call']).toLowerCase();
  const downloadUuid = String(BANNER_SLUG_TO_UUID.download).toLowerCase();
  const bookCallUuid = String(BANNER_SLUG_TO_UUID['book-call']).toLowerCase();

  if (id === 'b0000005-0000-4000-8000-000000000005' || id.includes('blank-image') || id === 'blank-image') {
    return 'banner_blank';
  }
  /** DB stores stable UUIDs — they do not contain the substring "webinar" / "need" / "download". */
  if (id === webinarUuid || id.includes('webinar')) return 'banner_1';
  if (id === needCallUuid || id.includes('need')) return 'banner_4';
  const subscriberJourneyUuid = String(BANNER_SLUG_TO_UUID['subscriber-journey']).toLowerCase();
  if (id === subscriberJourneyUuid || id.includes('subscriber-journey')) return 'banner_4';
  /** Retired Mindscope ATS strip (UUID `b0000006`) — render as book-a-call (`banner_2`). */
  if (id === 'b0000006-0000-4000-8000-000000000006' || id.includes('mindscope')) return 'banner_2';
  /** Retired Mailchimp-style strip (UUID `b0000007`) — render as subscriber funnel (`banner_4`). */
  if (id === 'b0000007-0000-4000-8000-000000000007' || id.includes('mailchimp')) return 'banner_4';
  /** Retired “Explore your world” strip (UUID `b0000008`) — render as book-a-call (`banner_2`). */
  if (
    id === 'b0000008-0000-4000-8000-000000000008' ||
    id.includes('explore-world') ||
    id.includes('explore-your-world')
  ) {
    return 'banner_2';
  }
  if (id === 'b0000009-0000-4000-8000-000000000009' || id.includes('boost-improve')) {
    return 'banner_8';
  }
  if (id === 'b0000010-0000-4000-8000-000000000010' || id.includes('online-loan')) {
    return 'banner_9';
  }
  if (id === 'b0000011-0000-4000-8000-000000000011' || id.includes('business-city')) {
    return 'banner_10';
  }
  if (id === 'b0000012-0000-4000-8000-000000000012' || id.includes('leave-review')) {
    return 'banner_11';
  }
  if (id === 'b0000013-0000-4000-8000-000000000013' || id.includes('seo-whitepaper')) {
    return 'banner_12';
  }
  if (id === 'b0000014-0000-4000-8000-000000000014' || id.includes('green-gradient-cta')) {
    return 'banner_13';
  }
  /** Resume / download pill strip — UUID must match before generic “call” heuristics. */
  if (id === downloadUuid || id.includes('download') || id.includes('resume')) return 'banner_3';
  /** Gradient “Book a call” card — UUID or slug preset_id. */
  if (id === bookCallUuid || id.includes('book') || id.includes('call')) return 'banner_2';
  return 'banner_2';
}
