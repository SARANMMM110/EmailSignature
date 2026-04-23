/**
 * CTA banner strips — inline CSS, table layout. Compiled with Handlebars + banner_link, colors.
 */

import { MAILCHIMP_SCENE_SVG, MAILCHIMP_CHIMP_SVG } from './mailchimpBannerAssets.js';
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
  /** Webinar / CTA banner 1 — warm surface, palette-tinted blob art, brand + headline + subtext, outline pill CTA. */
  banner_1: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:16px;-webkit-border-radius:16px;overflow:hidden;mso-border-radius-alt:16px;position:relative;background-color:{{banner_surface_bg}};min-height:{{banner_min_height}}px;">
<img src="{{{banner_b1_blobs_uri}}}" width="{{banner_rail_w_px}}" height="{{banner_b1_blobs_h}}" alt="" role="presentation" style="display:block;border:0;line-height:0;font-size:0;width:{{banner_rail_w_px}}px;height:{{banner_b1_blobs_h}}px;position:absolute;right:0;top:0;z-index:0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;position:relative;z-index:1;">
<tr>
<td valign="middle" width="99%" style="width:99%;max-width:100%;padding:11px 6px 11px 16px;vertical-align:middle;text-align:center;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;mso-line-height-rule:exactly;">
<p style="margin:0 0 3px;padding:0;color:{{banner_brand_color}};font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;line-height:1.2;">{{banner_brand_label}}</p>
<p style="margin:0 0 5px;padding:0;color:{{banner_headline_color}};font-size:17px;font-weight:800;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_headline_html}}}</p>
<p style="margin:0;padding:0;color:{{banner_subline_color}};font-size:10px;font-weight:400;line-height:1.45;mso-line-height-rule:exactly;">{{{banner_subline_html}}}</p>
</td>
<td valign="middle" align="right" width="1%" style="width:1%;white-space:nowrap;padding:11px 16px 11px 8px;vertical-align:middle;text-align:right;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;mso-line-height-rule:exactly;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="display:inline-block;border:2px solid {{banner_cta_border}};border-radius:50px;-webkit-border-radius:50px;padding:7px 16px;font-size:11px;font-weight:600;color:{{banner_cta_text}};text-decoration:none;line-height:1.2;mso-line-height-rule:exactly;background-color:transparent;mso-padding-alt:7px 16px;">{{{banner_text}}}</a>
</td>
</tr>
</table>
</td>
</tr>
</table>`,

  /**
   * Book-a-call CTA — mint→sage gradient, Montserrat headline, forest arrow, right photo (email-safe tables).
   * Headline: {@link appendBanner} sets `banner_b2_headline`; image: `banner_b2_image` (optional default).
   */
  banner_2: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr>
<td style="padding:0;border-radius:22px;-webkit-border-radius:22px;overflow:hidden;mso-line-height-rule:exactly;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:{{banner_b2_grad_end}};background-image:linear-gradient(90deg,{{banner_b2_grad_start}} 0%,{{banner_b2_grad_end}} 100%);">
<tr>
<td valign="middle" style="padding:14px 8px 14px 18px;vertical-align:middle;font-family:'Montserrat',Arial,Helvetica,{{font_family}},sans-serif;font-size:15px;font-weight:500;color:{{banner_b2_title_color}};line-height:1.3;mso-line-height-rule:exactly;">{{banner_b2_headline}}</td>
<td valign="middle" width="32" style="width:32px;padding:10px 4px;vertical-align:middle;text-align:center;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:22px;font-weight:400;color:{{banner_b2_arrow_color}};line-height:1;mso-line-height-rule:exactly;">&#8594;</td>
<td valign="middle" align="right" style="padding:10px 16px 10px 6px;vertical-align:middle;text-align:right;line-height:0;font-size:0;width:34%;max-width:160px;">
<img src="{{{banner_b2_image}}}" alt="" width="136" style="display:block;border:0;border-radius:10px;-webkit-border-radius:10px;width:136px;max-width:100%;height:auto;max-height:96px;object-fit:cover;vertical-align:middle;">
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
<td valign="middle" style="width:44px;padding:0 10px 0 0;line-height:0;vertical-align:middle;"><img src="{{{banner_side_image}}}" alt="" width="40" height="40" style="display:block;width:40px;height:40px;max-width:100%;border:0;border-radius:7px;object-fit:cover;vertical-align:middle;"></td>
{{/if}}
<td width="60%" valign="middle" style="color:#ffffff;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:12px;font-weight:700;vertical-align:middle;">{{{banner_b3_left_text}}}</td>
<td width="40%" valign="middle" align="right" style="vertical-align:middle;"><a href="{{{banner_link}}}" style="background-color:#ffffff;color:{{color_1}};font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:5px 12px;border-radius:18px;display:inline-block;">{{{banner_text}}}</a></td>
</tr>
</table>
</td></tr>
</table>`,

  banner_4: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="background-color:{{color_1}};padding:9px 12px;border-radius:6px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr>
{{#if banner_side_image}}
<td valign="middle" style="width:40px;padding:0 8px 0 0;line-height:0;vertical-align:middle;"><img src="{{{banner_side_image}}}" alt="" width="32" height="32" style="display:block;width:32px;height:32px;max-width:100%;border:0;border-radius:5px;object-fit:cover;vertical-align:middle;"></td>
{{/if}}
<td width="50%" valign="middle"><p style="margin:0;color:{{banner_4_left_text}};font-family:Arial,sans-serif;font-size:12px;font-weight:700;">{{{banner_4_label}}}</p></td>
<td width="50%" valign="middle" align="right"><a href="{{{banner_link}}}" style="background-color:{{banner_4_btn_bg}};color:{{banner_4_btn_text}};font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:6px 13px;border-radius:5px;display:inline-block;border:1px solid {{banner_4_btn_border}};">{{{banner_text}}}</a></td>
</tr>
</table>
</td></tr>
</table>`,

  /**
   * Mindscope CTA “template 2” — 728×90 reference as email-safe tables: gradient + dot grid, 115px logo rail
   * (15-dot pattern), Montserrat-style type, green outline CTA, check + fine print, optional photo or
   * illustration + mini form card (`banner_b5_person` when set).
   */
  banner_5: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b5_min_h}}px;background-color:#0f2d6b;background-image:linear-gradient(110deg,#0a1628 0%,#0d2145 40%,#0f2d6b 70%,#1a3a80 100%),radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:auto,18px 18px;">
<tr>
<td valign="middle" align="center" width="100" style="width:100px;max-width:100px;min-width:88px;background-color:#0a1628;border-right:1px solid rgba(255,255,255,0.08);padding:6px 8px;">
<table role="presentation" align="center" cellpadding="0" cellspacing="2" border="0" style="border-collapse:separate;border-spacing:2px;margin:0 auto 5px;">
<tr>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00c4ff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00c4ff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#ffffff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td>
</tr><tr>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00c4ff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00c4ff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td>
</tr><tr>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00c4ff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#ffffff;">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.25);">&nbsp;</td><td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00c4ff;">&nbsp;</td>
</tr>
</table>
<p style="margin:0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-weight:800;font-size:11px;color:#ffffff;letter-spacing:0.08em;text-transform:uppercase;line-height:1.2;text-align:center;mso-line-height-rule:exactly;">{{{banner_b5_brand}}}</p>
</td>
<td valign="middle" style="padding:0 12px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr>
<td valign="middle" style="font-family:'Montserrat',Arial,Helvetica,sans-serif;padding-right:12px;">
<p style="margin:0 0 2px;padding:0;font-size:13px;font-weight:700;color:#ffffff;line-height:1.25;mso-line-height-rule:exactly;">{{{banner_b5_headline_html}}}</p>
<p style="margin:0;padding:0;font-size:15px;font-weight:900;color:#ffffff;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b5_tagline_pre}}}<span style="color:#f9e000;">{{{banner_b5_tagline_accent}}}</span></p>
</td>
<td valign="middle" align="center" style="white-space:nowrap;">
<table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="border-collapse:collapse;">
<tr><td align="center" style="padding:0;">
<span style="display:inline-block;border:2px solid #2ecc71;border-radius:4px;padding:5px 12px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-weight:700;font-size:12px;color:#2ecc71;letter-spacing:0.03em;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b5_cta}}}</span>
</td></tr>
<tr><td align="center" style="padding:4px 0 0 0;">
<table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="border-collapse:collapse;"><tr>
<td valign="middle" width="15" style="width:15px;padding:0 5px 0 0;vertical-align:middle;line-height:0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:13px;height:13px;border-radius:50%;background-color:#2ecc71;"><tr><td align="center" valign="middle" style="padding:2px;line-height:0;">
<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 10 10" fill="none" style="display:block;"><polyline points="2,5 4,7.5 8,3" stroke="#0a1628" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
</td></tr></table>
</td>
<td valign="middle" style="font-size:9px;color:rgba(255,255,255,0.75);font-family:'Open Sans',Arial,Helvetica,sans-serif;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b5_fineprint}}}</td>
</tr></table>
</td></tr>
</table>
</td>
</tr>
</table>
</td>
<td valign="middle" align="center" width="100" style="width:100px;max-width:100px;padding:4px 6px;vertical-align:middle;background-color:#1a3a80;background-image:linear-gradient(160deg,#1a3a80 0%,#2a5298 100%);overflow:hidden;">
{{#if banner_b5_has_person}}
<img src="{{{banner_b5_person}}}" alt="" width="92" style="display:block;border:0;width:92px;max-width:100%;height:auto;max-height:94px;object-fit:contain;object-position:center;vertical-align:middle;">
{{else}}
<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;min-height:74px;height:74px;"><tr>
<td valign="bottom" align="center" style="padding:0 0 0 2px;vertical-align:bottom;line-height:0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr><td style="line-height:0;font-size:0;">
<svg xmlns="http://www.w3.org/2000/svg" width="72" height="74" viewBox="0 0 85 88" fill="none" style="display:block;max-width:72px;height:auto;"><ellipse cx="52" cy="18" rx="13" ry="15" fill="#f5c5a3"/><ellipse cx="52" cy="10" rx="13" ry="8" fill="#4a3728"/><path d="M 30 88 C 30 60, 38 50, 52 48 C 66 50, 74 60, 74 88 Z" fill="#1e3a6e"/><path d="M 44 48 L 52 58 L 60 48" stroke="#ffffff" stroke-width="1.5" fill="none"/><rect x="47" y="30" width="10" height="12" rx="4" fill="#f5c5a3"/><path d="M 30 65 Q 52 52 74 65" fill="#1e3a6e"/></svg>
</td></tr></table>
</td>
<td valign="bottom" align="right" style="padding:0 6px 8px 0;vertical-align:bottom;width:56px;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="width:52px;background-color:#ffffff;border-radius:3px;border-collapse:separate;padding:4px 6px 4px 6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
<tr><td style="height:3px;line-height:0;font-size:0;background-color:#dde3ee;border-radius:2px;">&nbsp;</td></tr>
<tr><td style="padding-top:3px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;"><tr><td width="65%" style="width:65%;height:3px;line-height:0;font-size:0;background-color:#dde3ee;border-radius:2px;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding-top:3px;height:3px;line-height:0;font-size:0;background-color:#dde3ee;border-radius:2px;">&nbsp;</td></tr>
<tr><td style="padding-top:3px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;"><tr><td width="65%" style="width:65%;height:3px;line-height:0;font-size:0;background-color:#dde3ee;border-radius:2px;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding-top:4px;height:8px;line-height:0;font-size:0;background-color:#2ecc71;border-radius:2px;">&nbsp;</td></tr>
</table>
</td>
</tr></table>
{{/if}}
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Mailchimp-inspired campaign strip — left illustrated SVG scene, dark panel + yellow CTA + mascot
   * (`banner_6`). Copy: `field_1` panel line, `text` button label.
   */
  banner_6:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:52px;height:52px;">
<tr>
<td width="57%" valign="top" align="left" style="width:57%;min-width:160px;vertical-align:top;padding:0;margin:0;height:52px;max-height:52px;line-height:0;font-size:0;background-color:#e8813a;overflow:hidden;">{{#if banner_b6_scene_image}}<img src="{{{banner_b6_scene_image}}}" alt="" width="415" height="52" style="display:block;width:100%;height:52px;max-height:52px;border:0;object-fit:cover;object-position:center;">{{else}}` +
    MAILCHIMP_SCENE_SVG +
    `{{/if}}</td>
<td width="43%" valign="middle" style="width:43%;vertical-align:middle;background-color:#1c1c1c;padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td valign="middle" style="padding:6px 4px 6px 10px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#ffffff;line-height:1.3;mso-line-height-rule:exactly;">{{{banner_b6_panel}}}</td>
<td valign="middle" align="right" style="padding:6px 4px 6px 2px;white-space:nowrap;vertical-align:middle;">
<span style="display:inline-block;background-color:#ffe01b;border-radius:3px;padding:5px 9px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#1c1c1c;line-height:1.15;mso-line-height-rule:exactly;">{{{banner_b6_cta}}}</span>
</td>
<td valign="middle" width="38" style="width:38px;padding:4px 8px 4px 0;vertical-align:middle;line-height:0;font-size:0;">` +
    MAILCHIMP_CHIMP_SVG +
    `</td>
</tr></table>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * “Explore your world” travel CTA — navy + gold border, logo rail, headline + accent, pill CTA + URL line.
   * Built-in decor: `banner_b7_rail_decor`, `banner_b7_center_accent`. Optional uploads: `banner_b7_rail_logo_html`, `banner_b7_traveler_inner`.
   */
  banner_7:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border:2px solid #e8d94a;background-color:#1a2355;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" width="17%" style="width:17%;max-width:120px;vertical-align:middle;background-color:#111b42;border-right:2px solid #e8d94a;padding:5px 7px;">
{{{banner_b7_rail_logo_html}}}
<p style="margin:0 0 2px 0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:8px;font-weight:400;color:#ffffff;letter-spacing:0.06em;text-transform:lowercase;line-height:1.15;mso-line-height-rule:exactly;text-align:left;">{{{banner_b7_brand_small}}}</p>
<p style="margin:0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:#ffffff;line-height:1;letter-spacing:-0.02em;mso-line-height-rule:exactly;text-align:left;">{{{banner_b7_logo_word}}}</p>
<p style="margin:4px 0 0 0;padding:0;line-height:0;font-size:0;mso-line-height-rule:exactly;">{{{banner_b7_rail_decor}}}</p>
</td>
<td valign="middle" style="vertical-align:middle;padding:5px 10px 5px 8px;background-color:#1a2355;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
<tr>
<td valign="middle" width="30" style="width:30px;max-width:30px;padding:0 8px 0 0;line-height:0;font-size:0;vertical-align:middle;">{{{banner_b7_center_accent}}}</td>
<td valign="middle" style="vertical-align:middle;padding:0;">
<p style="margin:0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:0.02em;line-height:1.15;mso-line-height-rule:exactly;">{{{banner_b7_headline}}}</p>
<p style="margin:1px 0 0 0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:17px;font-weight:900;color:#e8d94a;line-height:1;letter-spacing:0.02em;text-transform:uppercase;mso-line-height-rule:exactly;">{{{banner_b7_world}}}</p>
</td>
</tr>
</table>
</td>
<td valign="middle" align="center" style="vertical-align:middle;padding:5px 8px 5px 6px;white-space:nowrap;">
<span style="display:inline-block;background-color:#e8d94a;border-radius:3px;padding:5px 11px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;color:#1a2355;letter-spacing:0.02em;line-height:1.15;mso-line-height-rule:exactly;">{{{banner_b7_cta}}}</span>
<p style="margin:3px 0 0 0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:8px;font-weight:500;color:#c8d8ff;letter-spacing:0.03em;line-height:1.2;text-align:center;mso-line-height-rule:exactly;">{{{banner_b7_url}}}</p>
</td>
<td valign="bottom" width="58" style="width:58px;max-width:15%;vertical-align:bottom;padding:0;line-height:0;text-align:right;">{{{banner_b7_traveler_inner}}}</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Wellness / juice “Boost and Improve” strip (`banner_8`): dark logo rail + illustrated scene + green CTA.
   * Optional uploads: `banner_b8_leaf_inner`, `banner_b8_scene_inner`.
   */
  banner_8:
    `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td style="padding:0;line-height:0;font-size:0;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;line-height:normal;font-size:14px;mso-line-height-rule:exactly;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:100px;">
<tr>
<td valign="middle" width="18%" style="width:18%;min-width:108px;max-width:140px;vertical-align:middle;background-color:#1e2d1e;padding:0;text-align:center;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td align="center" valign="middle" height="120" style="padding:12px 8px 8px;min-height:120px;height:auto;line-height:normal;font-size:14px;mso-line-height-rule:exactly;vertical-align:middle;">
{{{banner_b8_leaf_inner}}}
</td></tr>
<tr><td align="center" valign="top" style="padding:0 8px 10px;line-height:1.2;font-size:7px;mso-line-height-rule:exactly;">
<p style="margin:0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:7px;font-weight:600;color:#aac88a;letter-spacing:0.1em;text-transform:uppercase;line-height:1.25;mso-line-height-rule:exactly;">{{{banner_b8_logo_small}}}</p>
<p style="margin:4px 0 0 0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;color:#ffffff;letter-spacing:0.05em;text-transform:uppercase;line-height:1.15;mso-line-height-rule:exactly;">{{{banner_b8_logo_main}}}</p>
</td></tr>
</table>
</td>
<td valign="middle" width="47%" style="width:47%;min-width:140px;min-height:100px;vertical-align:middle;padding:4px 0;line-height:0;font-size:0;background:linear-gradient(105deg,#e8f0d8 0%,#d4e8b0 40%,#b8d888 100%);">{{{banner_b8_scene_inner}}}</td>
<td valign="middle" width="35%" style="width:35%;vertical-align:middle;background-color:#7ab82a;padding:8px 12px 10px 14px;position:relative;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr><td style="padding:0 0 6px 0;">
<p style="margin:0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:#1a2e0a;line-height:1.1;letter-spacing:0.01em;mso-line-height-rule:exactly;">{{{banner_b8_headline}}}</p>
<p style="margin:3px 0 0 0;padding:0;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:10px;font-weight:500;color:#2a4a10;letter-spacing:0.02em;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b8_subline}}}</p>
</td></tr>
<tr><td style="padding:0;">
<span style="display:inline-block;background-color:#1e2d1e;border-radius:3px;padding:5px 11px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#ffffff;letter-spacing:0.06em;text-transform:uppercase;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b8_cta}}}</span>
</td></tr>
<tr><td align="right" style="padding:8px 0 0 0;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;"><tr>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#ffffff;">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.4);">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.4);">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.4);">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:rgba(255,255,255,0.4);">&nbsp;</td>
</tr></table>
</td></tr>
</table>
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
<tr><td style="padding:0;line-height:0;font-size:0;background-color:#f5f0e8;border-radius:4px;-webkit-border-radius:4px;overflow:hidden;mso-border-radius-alt:4px;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:90px;">
<tr>
<td valign="middle" width="32%" style="width:32%;max-width:210px;vertical-align:middle;background-color:#f5f0e8;padding:0 8px 0 24px;mso-padding-alt:0 8px 0 24px;">
<p style="margin:0;padding:0;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-size:{{banner_b9_fs_h}}px;font-weight:900;line-height:1.15;color:#1a1a1a;letter-spacing:-0.3px;text-transform:none;mso-line-height-rule:exactly;">{{{banner_b9_line1}}}</p>
<p style="margin:0;padding:0;font-family:'Arial Black',Arial,Helvetica,sans-serif;font-size:{{banner_b9_fs_h}}px;font-weight:900;line-height:1.15;color:#1a1a1a;letter-spacing:-0.3px;text-transform:none;mso-line-height-rule:exactly;">{{{banner_b9_line2}}}</p>
</td>
<td valign="bottom" width="44%" align="center" style="width:44%;vertical-align:bottom;background-color:#f5f0e8;padding:0;line-height:0;font-size:0;">
{{#if banner_b9_custom_hero}}
<img src="{{{banner_b9_hero}}}" alt="" width="180" height="95" style="display:block;height:95px;width:auto;max-width:100%;margin:0 auto;border:0;vertical-align:bottom;line-height:0;">
{{else}}
` +
    ONLINE_LOAN_PEOPLE_SVG +
    `{{/if}}
</td>
<td valign="top" width="24%" style="width:24%;min-width:118px;vertical-align:top;background-color:#f5f0e8;padding:10px 22px 10px 6px;mso-padding-alt:10px 22px 10px 6px;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin:0 0 0 auto;"><tr>
<td valign="middle" style="padding:0 4px 0 0;line-height:0;vertical-align:middle;">` +
    REVOLIO_MARK_SVG +
    `</td>
<td valign="middle" style="padding:0;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:{{banner_b9_fs_b}}px;font-weight:800;color:#444444;letter-spacing:1px;text-transform:uppercase;line-height:1;mso-line-height-rule:exactly;">{{{banner_b9_brand}}}</td>
</tr></table>
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin:6px 0 0 auto;"><tr><td style="padding:0;line-height:0;">
<span style="display:inline-block;background-color:#1e3d2f;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-weight:800;font-size:{{banner_b9_fs_cta}}px;letter-spacing:0.8px;text-transform:uppercase;line-height:1;padding:10px 20px;mso-padding-alt:10px 20px;border-radius:6px;-webkit-border-radius:6px;mso-line-height-rule:exactly;">{{{banner_b9_cta}}}</span>
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
<tr><td style="padding:0;line-height:0;font-size:0;background-color:#1a1a2e;">
<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;color:inherit;outline:none;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:90px;">
<tr>
<td valign="middle" width="41%" style="width:41%;max-width:310px;vertical-align:middle;background-color:#ffffff;border-radius:0 36px 36px 0;-webkit-border-radius:0 36px 36px 0;padding:0;mso-border-radius-alt:0 36px 36px 0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td valign="middle" style="padding:12px 8px 12px 18px;mso-padding-alt:12px 8px 12px 18px;">
<p style="margin:0 0 1px 0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:{{banner_b10_fs_bus}}px;font-weight:700;color:#1a1a2e;letter-spacing:1.5px;text-transform:uppercase;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b10_business}}}</p>
<p style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:{{banner_b10_fs_title}}px;font-weight:900;color:#f0b400;text-transform:uppercase;letter-spacing:0.5px;line-height:1;mso-line-height-rule:exactly;">{{{banner_b10_banner}}}</p>
<p style="margin:0 0 5px 0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:{{banner_b10_fs_title}}px;font-weight:900;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.5px;line-height:1;mso-line-height-rule:exactly;">{{{banner_b10_design}}}</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin:0 0 7px 0;"><tr>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#00aacc;">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#cccccc;">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#cccccc;">&nbsp;</td>
<td style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
<td style="width:5px;height:5px;line-height:0;font-size:0;border-radius:50%;background-color:#cccccc;">&nbsp;</td>
</tr></table>
<span style="display:inline-block;background-color:#1a1a2e;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:{{banner_b10_fs_cta}}px;font-weight:700;letter-spacing:1px;text-transform:uppercase;line-height:1;padding:4px 10px;mso-padding-alt:4px 10px;border-radius:2px;-webkit-border-radius:2px;mso-line-height-rule:exactly;">{{{banner_b10_cta}}}</span>
</td>
<td valign="middle" width="6" style="width:6px;padding:0 6px 0 0;vertical-align:middle;">
<span style="display:inline-block;width:4px;height:60px;line-height:0;font-size:0;border-radius:2px;background:linear-gradient(to bottom,#00aacc,#0077aa);">&nbsp;</span>
</td>
</tr></table>
</td>
<td valign="middle" width="6%" style="width:6%;min-width:36px;max-width:44px;vertical-align:middle;background-color:#1a1a2e;padding:0;line-height:0;font-size:0;text-align:center;">` +
    CITY_BUSINESS_CURVE_SVG +
    `</td>
<td valign="bottom" width="53%" style="width:53%;vertical-align:bottom;background-color:#1a1a2e;background-image:linear-gradient(160deg,#5a6e80 0%,#8a9eac 40%,#6b7f8e 70%,#4a5a68 100%);padding:0;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;"><tr>
<td align="right" valign="top" style="padding:8px 14px 4px 0;line-height:0;font-size:0;">
{{#if banner_b10_logo_img}}
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;"><tr><td align="right" valign="top" style="padding:0;line-height:0;">
<img src="{{{banner_b10_logo_img}}}" alt="" width="80" height="40" style="display:block;width:80px;max-width:88px;height:auto;max-height:42px;border:0;object-fit:contain;object-position:right top;">
</td></tr></table>
{{else}}
<table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;background-color:#1a1a2e;border-radius:3px;padding:5px 8px;mso-padding-alt:5px 8px;"><tr><td align="center" style="padding:0;line-height:0;">` +
    CITY_BUSINESS_LOGO_HEX_SVG +
    `</td></tr>
<tr><td align="center" style="padding:2px 0 0 0;">
<p style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:{{banner_b10_fs_logo}}px;font-weight:700;color:#ffffff;letter-spacing:1px;text-transform:uppercase;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b10_company}}}</p>
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
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b11_min_h}}px;background-color:#ffffff;border:1px solid #e8e8e8;border-radius:16px;-webkit-border-radius:16px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="width:32%;max-width:220px;vertical-align:middle;padding:12px 6px 12px 18px;mso-padding-alt:12px 6px 12px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,{{font_family}},sans-serif;">
<p style="margin:0 0 4px 0;padding:0;font-size:{{banner_b11_fs_title}}px;font-weight:800;color:#111111;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b11_title}}}</p>
<p style="margin:0;padding:0;font-size:{{banner_b11_fs_sub}}px;font-weight:400;color:#444444;line-height:1.25;mso-line-height-rule:exactly;">{{{banner_b11_subtitle}}}</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:8px;"><tr><td style="padding:0;line-height:0;font-size:0;">` +
    REVIEW_WAVE_HAND_SVG +
    `</td></tr></table>
</td>
<td valign="bottom" style="width:52%;vertical-align:bottom;padding:0;line-height:0;font-size:0;text-align:center;">
<table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="border-collapse:collapse;margin:0 auto;"><tr><td style="padding:0;line-height:0;font-size:0;width:{{banner_b11_art_w}}px;max-width:100%;">` +
    REVIEW_STAR_SCENE_SVG_OPEN +
    `{{banner_b11_art_w}}` +
    REVIEW_STAR_SCENE_SVG_AFTER_WIDTH +
    REVIEW_STAR_SCENE_SVG_BODY +
    `</td></tr></table>
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
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b12_min_h}}px;background-color:#1a2530;border-radius:14px;-webkit-border-radius:14px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="width:34%;max-width:240px;vertical-align:middle;padding:10px 8px 10px 22px;mso-padding-alt:10px 8px 10px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,{{font_family}},sans-serif;">
<p style="margin:0;padding:0;font-size:{{banner_b12_fs_title}}px;font-weight:700;color:#ffffff;letter-spacing:0.1px;line-height:1.3;mso-line-height-rule:exactly;">{{{banner_b12_title}}}</p>
<p style="margin:1px 0 0 0;padding:0;font-size:{{banner_b12_fs_sub}}px;font-weight:400;color:#8a9baa;line-height:1.35;mso-line-height-rule:exactly;">{{{banner_b12_subtitle}}}</p>
</td>
<td valign="middle" align="right" style="vertical-align:middle;padding:0;line-height:0;font-size:0;">
<table cellpadding="0" cellspacing="0" border="0" align="right" role="presentation" style="border-collapse:collapse;margin-left:auto;"><tr>
<td valign="middle" align="right" style="padding:0;line-height:0;font-size:0;">` +
    SEO_DARK_GRID_SVG_OPEN +
    `{{banner_b12_grid_w}}` +
    SEO_DARK_GRID_SVG_AFTER_WIDTH +
    SEO_DARK_GRID_SVG_BODY +
    `</td>
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
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;min-height:{{banner_b13_min_h}}px;background-color:#2a9e72;background-image:linear-gradient(135deg,#4cd68a 0%,#2a9e72 40%,#1e7a5e 100%);border-radius:12px;-webkit-border-radius:12px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="width:56px;min-width:48px;vertical-align:middle;padding:10px 8px 10px 28px;mso-padding-alt:10px 8px 10px 28px;line-height:0;font-size:0;">` +
    GREEN_GRADIENT_LOGO_SVG +
    `</td>
<td valign="middle" style="vertical-align:middle;padding:10px 8px;mso-padding-alt:10px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,{{font_family}},sans-serif;">
<p style="margin:0;padding:0;font-size:{{banner_b13_fs_title}}px;font-weight:600;color:#ffffff;line-height:1.35;letter-spacing:-0.2px;mso-line-height-rule:exactly;">{{{banner_b13_title_html}}}</p>
</td>
<td valign="middle" align="right" style="width:{{banner_b13_decor_w}}px;max-width:35%;vertical-align:middle;padding:4px 6px 4px 0;line-height:0;font-size:0;">` +
    GREEN_GRADIENT_DECOR_SVG_OPEN +
    `{{banner_b13_decor_w}}` +
    GREEN_GRADIENT_DECOR_SVG_AFTER_WIDTH +
    GREEN_GRADIENT_DECOR_SVG_BODY +
    `</td>
<td valign="middle" align="right" style="vertical-align:middle;white-space:nowrap;padding:10px 28px 10px 8px;mso-padding-alt:10px 28px 10px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,{{font_family}},sans-serif;">
<span style="font-size:{{banner_b13_fs_cta}}px;font-weight:700;color:#ffffff;letter-spacing:0.1px;line-height:1.2;mso-line-height-rule:exactly;">{{{banner_b13_cta}}}</span><span style="font-size:{{banner_b13_fs_arrow}}px;font-weight:300;color:#ffffff;line-height:1;margin-left:10px;mso-line-height-rule:exactly;">&#8594;</span>
</td>
</tr>
</table>
</a>
</td></tr>
</table>`,

  /**
   * Image-only strip — outer table uses px rail width (not `width:100%` in style) so {@link collapseSignatureShellWidth} does not rewrite it to `width:auto`. `object-fit:cover` fills the strip height.
   * Uploads 720×93 (`72:560` vs width 720) in `upload.js`.
   */
  banner_blank: `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="{{banner_rail_w_px}}" style="width:{{banner_rail_w_px}}px;max-width:100%;table-layout:fixed;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
<tr><td bgcolor="#f8fafc" style="padding:0;margin:0;line-height:0;font-size:0;width:{{banner_rail_w_px}}px;max-width:100%;height:{{banner_blank_h_px}}px;max-height:{{banner_blank_h_px}}px;overflow:hidden;vertical-align:middle;background-color:#f8fafc;">
{{#if banner_blank_linked}}<a href="{{{banner_link}}}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;line-height:0;width:100%;max-width:100%;height:{{banner_blank_h_px}}px;max-height:{{banner_blank_h_px}}px;overflow:hidden;">{{/if}}
<img src="{{{banner_full_image}}}" alt="" width="{{banner_rail_w_px}}" height="{{banner_blank_h_px}}" style="display:block;width:100%;min-width:100%;max-width:100%;height:{{banner_blank_h_px}}px;min-height:{{banner_blank_h_px}}px;max-height:{{banner_blank_h_px}}px;object-fit:cover;object-position:center;border:0;vertical-align:middle;-ms-interpolation-mode:bicubic;">
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
  if (id === 'b0000006-0000-4000-8000-000000000006' || id.includes('mindscope')) return 'banner_5';
  if (id === 'b0000007-0000-4000-8000-000000000007' || id.includes('mailchimp')) return 'banner_6';
  if (
    id === 'b0000008-0000-4000-8000-000000000008' ||
    id.includes('explore-world') ||
    id.includes('explore-your-world')
  ) {
    return 'banner_7';
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
