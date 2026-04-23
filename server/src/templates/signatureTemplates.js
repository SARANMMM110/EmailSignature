/**
 * Layout 1 — Split banner (email-safe): nested tables only, ~520px wide.
 * 50/50 white | blue with avatar column on the seam; gradient behind the photo mimics the semi-circular cutout.
 */

import { uuidToTemplateSlug } from '../lib/templateIds.js';
import { TEMPLATE_12_MARKUP } from './template12Html.js';
import { TEMPLATE_13_MARKUP } from './template13Html.js';
import { TEMPLATE_14_MARKUP } from './template14Html.js';
import { TEMPLATE_15_MARKUP } from './template15Html.js';
import { TEMPLATE_16_MARKUP } from './template16Html.js';
import { TEMPLATE_17_MARKUP } from './template17Html.js';
import { TEMPLATE_18_MARKUP } from './template18Html.js';
import { TEMPLATE_19_MARKUP } from './template19Html.js';
import { TEMPLATE_20_MARKUP } from './template20Html.js';

const UUID_RE_TEMPLATE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const BADGE =
  '{{#if show_badge}}<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;"><tr><td style="padding-top:6px;font-size:7px;color:#94a3b8;font-family:{{font_family}};">Made with Signature Studio</td></tr></table>{{/if}}';

/** Gmail/outlook-safe contact row (table cells, no flex). */
const rowEmail = `<tr>
  <td width="26" valign="middle" style="padding:0 10px 8px 0;line-height:0;vertical-align:middle;"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;" aria-hidden="true"><path d="M2.91667 4.58341L8.82149 10.4882C9.47236 11.1391 10.5276 11.1391 11.1785 10.4882L17.0833 4.58341M3.33333 15.8334H16.6667C17.1269 15.8334 17.5 15.4603 17.5 15.0001V5.00008C17.5 4.53984 17.1269 4.16675 16.6667 4.16675L3.33333 4.16675C2.8731 4.16675 2.5 4.53984 2.5 5.00008L2.5 15.0001C2.5 15.4603 2.8731 15.8334 3.33333 15.8334Z" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></td>
  <td valign="middle" width="100%" style="padding:0 0 8px 0;font-size:11px;font-weight:300;color:#ffffff;line-height:16px;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;">{{email}}</td>
</tr>`;
const rowPhone = `<tr>
  <td width="26" valign="middle" style="padding:0 10px 8px 0;line-height:0;vertical-align:middle;"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;" aria-hidden="true"><path d="M10 15H10.0083M6.66667 17.5H13.3333C14.2538 17.5 15 16.7538 15 15.8333V4.16667C15 3.24619 14.2538 2.5 13.3333 2.5L6.66667 2.5C5.74619 2.5 5 3.24619 5 4.16667L5 15.8333C5 16.7538 5.74619 17.5 6.66667 17.5Z" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round" fill="none"/></svg></td>
  <td valign="middle" width="100%" style="padding:0 0 8px 0;font-size:11px;font-weight:300;color:#ffffff;line-height:16px;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;">{{phone}}</td>
</tr>`;
const rowWeb = `<tr>
  <td width="26" valign="middle" style="padding:0 10px 8px 0;line-height:0;vertical-align:middle;"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;" aria-hidden="true"><path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5M17.5 10C17.5 5.85786 14.1421 2.5 10 2.5M17.5 10H2.5M10 17.5C5.85786 17.5 2.5 14.1421 2.5 10M10 17.5C10 17.5 13.3333 15 13.3333 10C13.3333 5 10 2.5 10 2.5M10 17.5C10 17.5 6.66667 15 6.66667 10C6.66667 5 10 2.5 10 2.5M2.5 10C2.5 5.85786 5.85786 2.5 10 2.5" stroke="#ffffff" stroke-width="1.35" fill="none"/></svg></td>
  <td valign="middle" width="100%" style="padding:0 0 8px 0;font-size:11px;font-weight:300;line-height:16px;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;"><a href="{{{website_full}}}" style="color:#ffffff;text-decoration:none;white-space:nowrap;font-size:11px;">{{website}}</a></td>
</tr>`;
const rowAddr = `<tr>
  <td width="26" valign="top" style="padding:0 10px 0 0;line-height:0;vertical-align:top;padding-top:2px;"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;" aria-hidden="true"><path d="M16.6666 9.16667C16.6666 12.8486 13.6818 15.8333 9.99992 17.5C6.31802 15.8333 3.33325 12.8486 3.33325 9.16667C3.33325 5.48477 6.31802 2.5 9.99992 2.5C13.6818 2.5 16.6666 5.48477 16.6666 9.16667Z" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M12.4999 9.16667C12.4999 10.5474 11.3806 11.6667 9.99992 11.6667C8.61921 11.6667 7.49992 10.5474 7.49992 9.16667C7.49992 7.78595 8.61921 6.66667 9.99992 6.66667C11.3806 6.66667 12.4999 7.78595 12.4999 9.16667Z" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></td>
  <td valign="top" style="padding:0;font-size:11px;font-weight:300;color:#ffffff;line-height:16px;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;word-break:normal;overflow-wrap:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr>`;

/**
 * Layout 2 — **600px** card: solid primary rail | headshot overlapping seam (lavender ring + white stroke) |
 * identity | wider contacts column (divider = border-left only, email-safe).
 */
const t2rowEmail = `<tr>
  <td width="22" valign="middle" style="padding:0 6px 7px 6px;line-height:0;vertical-align:middle;"><img src="{{{icon_l2_mail}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
  <td valign="middle" align="left" style="padding:0 0 7px 4px;font-size:13px;font-weight:400;color:{{t2_muted}};line-height:1.45;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;text-align:left;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">{{email}}</td>
</tr>`;
const t2rowPhone = `<tr>
  <td width="22" valign="middle" style="padding:0 6px 7px 6px;line-height:0;vertical-align:middle;"><img src="{{{icon_l2_phone}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
  <td valign="middle" align="left" style="padding:0 0 7px 4px;font-size:13px;font-weight:400;color:{{t2_muted}};line-height:1.45;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;text-align:left;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">{{phone}}</td>
</tr>`;
const t2rowWeb = `<tr>
  <td width="22" valign="middle" style="padding:0 6px 7px 6px;line-height:0;vertical-align:middle;"><img src="{{{icon_l2_globe}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
  <td valign="middle" align="left" style="padding:0 0 7px 4px;font-size:13px;font-weight:400;line-height:1.45;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;text-align:left;word-break:break-word;overflow-wrap:anywhere;white-space:normal;"><a href="{{{website_full}}}" style="color:{{t2_muted}};text-decoration:none;font-size:13px;word-break:break-word;">{{website}}</a></td>
</tr>`;
const t2rowAddr = `<tr>
  <td width="22" valign="top" style="padding:0 8px 0 8px;line-height:0;vertical-align:top;padding-top:2px;"><img src="{{{icon_l2_pin}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
  <td valign="top" align="left" style="padding:0 0 0 6px;font-size:13px;font-weight:400;color:{{t2_muted}};line-height:1.45;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;text-align:left;word-break:normal;overflow-wrap:break-word;white-space:normal;overflow:visible;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr>`;

/** Layout 3 — white glyphs inside black rounded squares + grey text (reference). */
const t3rowBlkPhone = `<tr>
  <td width="36" valign="middle" style="padding:0 8px 6px 0;vertical-align:middle;line-height:0;">
    <table cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;border-radius:4px;"><tr><td width="26" height="26" align="center" valign="middle" style="width:26px;height:26px;padding:0;line-height:0;"><img src="{{{t3_icon_phone}}}" width="14" height="14" alt="" style="display:block;border:0;margin:0 auto;"></td></tr></table>
  </td>
  <td valign="middle" style="padding:0 0 6px 0;font-size:12px;font-weight:400;color:#666666;line-height:1.45;font-family:Arial,Helvetica,Roboto,{{font_family}},sans-serif;">{{phone}}</td>
</tr>`;
const t3rowBlkWeb = `<tr>
  <td width="36" valign="middle" style="padding:0 8px 6px 0;vertical-align:middle;line-height:0;">
    <table cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;border-radius:4px;"><tr><td width="26" height="26" align="center" valign="middle" style="width:26px;height:26px;padding:0;line-height:0;"><img src="{{{t3_icon_globe}}}" width="14" height="14" alt="" style="display:block;border:0;margin:0 auto;"></td></tr></table>
  </td>
  <td valign="middle" style="padding:0 0 6px 0;font-size:12px;font-weight:400;line-height:1.45;font-family:Arial,Helvetica,Roboto,{{font_family}},sans-serif;"><a href="{{{website_full}}}" style="color:#666666;text-decoration:none;">{{website}}</a></td>
</tr>`;
const t3rowBlkMail = `<tr>
  <td width="36" valign="middle" style="padding:0 8px 6px 0;vertical-align:middle;line-height:0;">
    <table cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;border-radius:4px;"><tr><td width="26" height="26" align="center" valign="middle" style="width:26px;height:26px;padding:0;line-height:0;"><img src="{{{t3_icon_mail}}}" width="14" height="14" alt="" style="display:block;border:0;margin:0 auto;"></td></tr></table>
  </td>
  <td valign="middle" style="padding:0 0 6px 0;font-size:12px;font-weight:400;color:#666666;line-height:1.45;font-family:Arial,Helvetica,Roboto,{{font_family}},sans-serif;">{{email}}</td>
</tr>`;
const t3rowBlkAddr = `<tr>
  <td width="36" valign="top" style="padding:0 8px 0 0;vertical-align:top;line-height:0;padding-top:2px;">
    <table cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;border-radius:4px;"><tr><td width="26" height="26" align="center" valign="middle" style="width:26px;height:26px;padding:0;line-height:0;"><img src="{{{t3_icon_pin}}}" width="14" height="14" alt="" style="display:block;border:0;margin:0 auto;"></td></tr></table>
  </td>
  <td valign="top" style="padding:0;font-size:12px;font-weight:400;color:#666666;line-height:1.45;font-family:Arial,Helvetica,Roboto,{{font_family}},sans-serif;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr>`;

export const TEMPLATES = {
  template_1: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:520px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Montserrat','Poppins','Roboto',-apple-system,Helvetica,Arial,sans-serif;"><tr><td style="padding:0;border-radius:12px;overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,0.12);">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="width:100%;max-width:520px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;">
{{#if photo_url}}
<tr>
  <td width="212" valign="middle" bgcolor="#ffffff" style="background-color:#ffffff;padding:18px 14px 18px 18px;vertical-align:middle;width:212px;max-width:212px;text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="center" style="border-collapse:collapse;margin:0 auto;table-layout:fixed;width:100%;">
      <tr><td align="center" style="padding:0 0 6px 0;font-size:16px;font-weight:700;color:{{primary_color}};line-height:1.25;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{name}}</td></tr>
      <tr><td align="center" style="padding:0 0 12px 0;font-size:11px;font-weight:400;color:{{company_muted}};line-height:1.45;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{title}}</td></tr>
      <tr><td align="center" style="padding:0;line-height:0;">{{#if logo_url}}<img src="{{{logo_url}}}" alt="" width="160" style="max-height:28px;max-width:160px;height:auto;width:auto;display:block;border:0;margin:0 auto;">{{else}}{{#if company_name}}<span style="font-size:17px;font-weight:700;color:{{primary_color}};line-height:1.2;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;">{{company_name}}</span>{{/if}}{{/if}}</td></tr>
    </table>
  </td>
  <td width="96" valign="middle" bgcolor="#ffffff" style="background-color:#ffffff;background:linear-gradient(to right,#ffffff 0%,#ffffff 50%,{{primary_color}} 50%,{{primary_color}} 100%);padding:11px 0;width:96px;min-width:96px;max-width:96px;vertical-align:middle;text-align:center;line-height:0;">
    <img src="{{{photo_url}}}" alt="" width="96" height="96" style="display:block;width:96px;height:96px;border-radius:48px;border:4px solid #ffffff;margin:0 auto;-webkit-border-radius:48px;object-fit:cover;">
  </td>
  <td width="212" valign="middle" align="left" style="background-color:{{primary_color}};padding:16px 14px 16px 12px;vertical-align:middle;width:212px;min-width:168px;text-align:left;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;width:100%;table-layout:fixed;margin:0;">
    {{#if email}}${rowEmail}{{/if}}
    {{#if phone}}${rowPhone}{{/if}}
    {{#if has_website}}${rowWeb}{{/if}}
    {{#if has_address}}${rowAddr}{{/if}}
    </table>
  </td>
</tr>
{{else}}
<tr>
  <td width="260" valign="middle" bgcolor="#ffffff" style="background-color:#ffffff;padding:18px 16px;width:260px;max-width:260px;vertical-align:middle;text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="center" style="border-collapse:collapse;margin:0 auto;table-layout:fixed;width:100%;">
    <tr><td align="center" style="padding:0 0 6px 0;font-size:16px;font-weight:700;color:{{primary_color}};line-height:1.25;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{name}}</td></tr>
      <tr><td align="center" style="padding:0 0 12px 0;font-size:11px;font-weight:400;color:{{company_muted}};line-height:1.45;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{title}}</td></tr>
      <tr><td align="center" style="padding:0;line-height:0;">{{#if logo_url}}<img src="{{{logo_url}}}" alt="" width="160" style="max-height:28px;max-width:160px;height:auto;width:auto;display:block;border:0;margin:0 auto;">{{else}}{{#if company_name}}<span style="font-size:17px;font-weight:700;color:{{primary_color}};line-height:1.2;font-family:'Montserrat','Poppins','Roboto',Helvetica,Arial,sans-serif;">{{company_name}}</span>{{/if}}{{/if}}</td></tr>
    </table>
  </td>
  <td width="260" valign="middle" align="left" style="background-color:{{primary_color}};padding:16px 14px 16px 14px;width:260px;min-width:200px;vertical-align:middle;text-align:left;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;width:100%;table-layout:fixed;margin:0;">
    {{#if email}}${rowEmail}{{/if}}
    {{#if phone}}${rowPhone}{{/if}}
    {{#if has_website}}${rowWeb}{{/if}}
    {{#if has_address}}${rowAddr}{{/if}}
    </table>
  </td>
</tr>
{{/if}}
</table>
</td></tr></table>${BADGE}`,

  template_2: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;"><tr><td style="padding:0;border-radius:14px;overflow:visible;background-color:{{sig_card_surface}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:{{sig_card_surface}};border-radius:14px;overflow:hidden;">
<tr>
  <td width="92" valign="middle" bgcolor="{{color_1}}" style="width:92px;min-width:92px;max-width:92px;background-color:{{color_1}};vertical-align:middle;padding:16px 0;line-height:0;font-size:0;">&nbsp;</td>
  <td width="508" valign="middle" style="width:508px;max-width:508px;vertical-align:middle;padding:14px 0;background-color:{{sig_card_surface}};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="508" style="width:508px;max-width:100%;border-collapse:collapse;table-layout:fixed;">
    {{#if photo_url}}
    <tr>
      <td width="40" valign="middle" align="left" style="width:40px;padding:0;line-height:0;vertical-align:middle;background-color:{{sig_card_surface}};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;margin:0 0 0 -56px;mso-margin-left-alt:-56px;">
          <tr>
            <td align="center" valign="middle" style="padding:0;line-height:0;background-color:{{photo_ring_bg}};border-radius:56px;-webkit-border-radius:56px;mso-border-radius-alt:56px;">
              <img src="{{{photo_url}}}" alt="" width="92" height="92" style="display:block;width:92px;height:92px;border-radius:50%;-webkit-border-radius:50%;border:3px solid {{sig_card_surface}};object-fit:cover;margin:2px;">
            </td>
          </tr>
        </table>
      </td>
      <td width="240" valign="middle" align="left" style="width:240px;max-width:240px;min-width:160px;padding:6px 16px 6px 12px;vertical-align:middle;background-color:{{sig_card_surface}};overflow:visible;box-sizing:border-box;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;table-layout:fixed;width:100%;max-width:100%;">
          <tr><td align="left" style="padding:0 0 5px 0;font-size:20px;font-weight:700;color:{{color_1}};line-height:1.2;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">{{name}}</td></tr>
          <tr><td align="left" style="padding:0 0 8px 0;font-size:13px;font-weight:400;color:{{t2_muted}};line-height:1.4;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">{{title}}</td></tr>
          <tr><td align="left" valign="top" style="padding:0;line-height:0;max-width:100%;overflow:hidden;">{{#if logo_url}}<img src="{{{logo_url}}}" alt="" width="128" style="max-height:26px;max-width:128px;height:auto;width:auto;display:block;border:0;">{{else}}{{#if company_name}}<span style="font-size:16px;font-weight:700;color:{{color_1}};line-height:1.1;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;">{{company_name}}</span>{{/if}}{{/if}}</td></tr>
        </table>
      </td>
      <td width="228" valign="middle" align="left" style="width:228px;max-width:228px;min-width:176px;padding:6px 10px 6px 18px;vertical-align:middle;background-color:{{sig_card_surface}};border-left:1px solid {{t2_divider_color}};box-sizing:border-box;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;width:100%;">
        {{#if email}}${t2rowEmail}{{/if}}
        {{#if phone}}${t2rowPhone}{{/if}}
        {{#if has_website}}${t2rowWeb}{{/if}}
        {{#if has_address}}${t2rowAddr}{{/if}}
        </table>
      </td>
    </tr>
    {{else}}
    <tr>
      <td width="258" valign="middle" align="left" style="width:258px;max-width:258px;min-width:200px;padding:6px 12px 6px 18px;vertical-align:middle;background-color:{{sig_card_surface}};overflow:visible;box-sizing:border-box;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;table-layout:fixed;width:100%;max-width:100%;">
          <tr><td align="left" style="padding:0 0 5px 0;font-size:20px;font-weight:700;color:{{color_1}};line-height:1.15;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">{{name}}</td></tr>
          <tr><td align="left" style="padding:0 0 8px 0;font-size:13px;font-weight:400;color:{{t2_muted}};line-height:1.4;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">{{title}}</td></tr>
          <tr><td align="left" valign="top" style="padding:0;line-height:0;max-width:100%;overflow:hidden;">{{#if logo_url}}<img src="{{{logo_url}}}" alt="" width="128" style="max-height:26px;max-width:128px;height:auto;width:auto;display:block;border:0;">{{else}}{{#if company_name}}<span style="font-size:16px;font-weight:700;color:{{color_1}};line-height:1.1;font-family:Arial, Helvetica, Roboto, {{font_family}}, sans-serif;">{{company_name}}</span>{{/if}}{{/if}}</td></tr>
        </table>
      </td>
      <td width="250" valign="middle" align="left" style="width:250px;max-width:250px;min-width:200px;padding:6px 12px 6px 20px;vertical-align:middle;background-color:{{sig_card_surface}};border-left:1px solid {{t2_divider_color}};box-sizing:border-box;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="left" style="border-collapse:collapse;width:100%;">
        {{#if email}}${t2rowEmail}{{/if}}
        {{#if phone}}${t2rowPhone}{{/if}}
        {{#if has_website}}${t2rowWeb}{{/if}}
        {{#if has_address}}${t2rowAddr}{{/if}}
        </table>
      </td>
    </tr>
    {{/if}}
    </table>
  </td>
</tr>
</table>
</td></tr></table>${BADGE}`,

  template_3: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Arial,Helvetica,Roboto,{{font_family}},sans-serif;"><tr><td style="padding:0 0 4px 0;background-color:#ffffff;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;border-collapse:collapse;table-layout:fixed;background-color:#ffffff;">
<tr>
  <td width="200" valign="top" style="width:200px;vertical-align:top;padding:0;background-color:#ffffff;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr><td style="padding:0;line-height:0;font-size:0;"><img src="{{{t3_deco_tl}}}" width="52" height="52" alt="" style="display:block;border:0;"></td></tr>
      <tr><td style="padding:10px 8px 0 18px;vertical-align:top;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        {{#if phone}}${t3rowBlkPhone}{{/if}}
        {{#if has_website}}${t3rowBlkWeb}{{/if}}
        {{#if email}}${t3rowBlkMail}{{/if}}
        {{#if has_address}}${t3rowBlkAddr}{{/if}}
        </table>
      </td></tr>
      <tr><td valign="bottom" style="padding:8px 0 6px 16px;line-height:0;"><img src="{{{t3_dots_bl}}}" width="56" height="21" alt="" style="display:block;border:0;"></td></tr>
    </table>
  </td>
  <td width="200" valign="top" align="center" style="width:200px;vertical-align:top;padding:0;text-align:center;background-color:#ffffff;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
      <tr><td align="center" style="padding:2px 0 0;line-height:0;font-size:0;position:relative;z-index:0;">
        <img src="{{{t3_deco_top_arc}}}" width="128" height="64" alt="" style="display:block;border:0;margin:0 auto;position:relative;z-index:0;">
      </td></tr>
      <tr><td align="center" style="padding:0;line-height:0;position:relative;z-index:1;">
        <span style="display:inline-block;position:relative;z-index:2;line-height:0;margin-top:-34px;mso-margin-top-alt:-34px;vertical-align:top;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;position:relative;z-index:2;">
          <tr><td style="background-color:#000000;padding:3px;border-radius:50%;line-height:0;mso-border-radius-alt:50%;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#ffffff;padding:2px;border-radius:50%;line-height:0;mso-border-radius-alt:50%;">
            {{#if photo_url}}
            <img src="{{{photo_url}}}" width="108" height="108" alt="" style="display:block;width:108px;height:108px;border-radius:50%;border:0;object-fit:cover;-webkit-filter:grayscale(100%);filter:grayscale(100%);">
            {{else}}
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="108" height="108" align="center" valign="middle" bgcolor="#e5e7eb" style="width:108px;height:108px;background-color:#e5e7eb;border-radius:50%;font-size:26px;font-weight:700;color:{{color_1}};font-family:Arial,Helvetica,sans-serif;">{{name_initials}}</td></tr></table>
            {{/if}}
            </td></tr></table>
          </td></tr>
        </table>
        </span>
      </td></tr>
      <tr><td align="center" style="padding:16px 8px 4px;font-family:Arial,Helvetica,Roboto,{{font_family}},sans-serif;line-height:1.25;">
        <span style="font-size:16px;font-weight:700;color:#000000;letter-spacing:0.04em;">{{t3_name_first_upper}}</span>{{#if t3_has_name_last}}<span style="font-size:16px;font-weight:700;color:{{color_1}};letter-spacing:0.04em;"> {{t3_name_last_upper}}</span>{{/if}}<br>
        <span style="font-size:11px;font-weight:400;color:{{t3_title_muted}};line-height:1.45;padding-top:4px;display:inline-block;">{{title}}</span>
      </td></tr>
    </table>
  </td>
  <td width="200" valign="middle" align="center" style="width:200px;vertical-align:middle;text-align:center;padding:0 12px;background-color:#ffffff;border-left:1px solid #000000;">
    {{#if logo_url}}
    <img src="{{{logo_url}}}" alt="" height="44" style="display:block;border:0;max-height:48px;width:auto;max-width:132px;margin:0 auto;">
    {{else}}
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center" style="margin:0 auto;border-collapse:collapse;"><tr><td width="20" height="20" align="center" valign="middle" style="width:20px;height:20px;border:2px solid {{color_1}};border-radius:5px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
    {{/if}}
  </td>
</tr>
</table>
</td></tr></table>${BADGE}`,

  /**
   * Layout 5 — light card **520px** wide: left palette art + round photo; right column has
   * logo top-right, split name + job title + 2×2 contacts (no company block, socials, or stripe/footer).
   */
  template_5: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:520px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Inter,system-ui,-apple-system,'Segoe UI',Arial,sans-serif;"><tr><td style="padding:0;background-color:{{t5_shell_bg}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="width:520px;max-width:520px;border-collapse:collapse;table-layout:fixed;background-color:{{t5_shell_bg}};">
<tr>
  <td width="180" valign="top" style="width:180px;vertical-align:top;padding:0;background-color:{{t5_shell_bg}};background-image:url({{{t5_deco_left}}});background-repeat:no-repeat;background-position:0 0;background-size:180px auto;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td align="center" style="padding:16px 10px 20px 12px;vertical-align:bottom;line-height:0;">
      {{#if photo_url}}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;"><tr><td style="padding:3px;line-height:0;background-color:{{t5_photo_ring}};border-radius:50%;mso-border-radius-alt:999px;">
        <img src="{{{photo_url}}}" alt="" width="140" height="140" style="display:block;width:140px;height:140px;border-radius:50%;object-fit:cover;border:0;">
      </td></tr></table>
      {{else}}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;"><tr><td align="center" valign="middle" width="140" height="140" style="width:140px;height:140px;background-color:{{t5_photo_ring}};border-radius:50%;font-size:24px;font-weight:700;color:{{color_1}};font-family:Inter,system-ui,Arial,sans-serif;">{{name_initials}}</td></tr></table>
      {{/if}}
    </td></tr></table>
  </td>
  <td width="340" valign="top" style="width:340px;vertical-align:top;padding:16px 14px 20px 6px;background-color:{{t5_shell_bg}};background-image:url({{{t5_deco_right}}});background-repeat:no-repeat;background-position:100% 0;background-size:190px auto;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr><td align="right" valign="top" style="padding:0 2px 12px 0;line-height:0;font-size:0;">
        {{#if logo_url}}<img src="{{{logo_url}}}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;border:0;margin-left:auto;">{{/if}}
      </td></tr>
      <tr><td style="padding:0 0 5px 0;line-height:1;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
          <td style="padding:0 8px 0 0;font-size:28px;font-weight:700;color:{{t5_name_first_color}};line-height:1;font-family:Inter,system-ui,Arial,sans-serif;white-space:nowrap;">{{name_line1}}</td>
          <td style="padding:0;font-size:28px;font-weight:700;color:{{t5_name_last_color}};line-height:1;font-family:Inter,system-ui,Arial,sans-serif;white-space:nowrap;">{{#if name_line2}}{{name_line2}}{{else}}&nbsp;{{/if}}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:0 0 14px 0;font-size:12px;font-weight:400;color:{{t5_job_color}};letter-spacing:0.12em;text-transform:uppercase;line-height:1.35;font-family:Inter,system-ui,Arial,sans-serif;">{{title}}</td></tr>
      <tr><td style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            {{#if phone}}<td style="padding:0 24px 6px 0;font-size:12px;color:{{t5_contact_color}};white-space:nowrap;vertical-align:top;">{{phone}}</td>{{else}}<td style="padding:0 24px 6px 0;"></td>{{/if}}
            {{#if email}}<td style="padding:0 0 6px 0;font-size:12px;color:{{t5_contact_color}};white-space:nowrap;vertical-align:top;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t5_link_color}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>{{else}}<td style="padding:0 0 6px 0;"></td>{{/if}}
          </tr>
          <tr>
            {{#if has_website}}<td style="padding:0 24px 0 0;font-size:12px;color:{{t5_contact_color}};white-space:nowrap;vertical-align:top;"><a href="{{{website_full}}}" style="color:{{t5_link_color}};text-decoration:none;">{{website}}</a></td>{{else}}<td style="padding:0 24px 0 0;"></td>{{/if}}
            {{#if has_address}}<td style="padding:0;font-size:12px;color:{{t5_contact_color}};vertical-align:top;line-height:1.35;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>{{else}}<td></td>{{/if}}
          </tr>
        </table>
      </td></tr>
    </table>
  </td>
</tr>
</table>
</td></tr></table>`,

  /**
   * Layout 6 — **600px** wide: navy strip + palette arc art, large round photo, “Hello, I am” + serif name,
   * 2×2 contacts (phone / web or Facebook + email / address), sparkles.
   */
  template_6: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Inter,system-ui,-apple-system,'Segoe UI',Arial,sans-serif;">
<tr><td style="padding:0;background-color:{{t6_shell_bg}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;border-collapse:collapse;table-layout:fixed;background-color:{{t6_shell_bg}};">
<tr>
  <td width="24" valign="top" bgcolor="{{t6_strip_bg}}" style="width:24px;min-width:24px;background-color:{{t6_strip_bg}};font-size:0;line-height:0;">&nbsp;</td>
  <td width="216" valign="top" bgcolor="#ffffff" style="width:216px;vertical-align:top;background-color:#ffffff;background-image:url({{{t6_left_deco}}});background-repeat:no-repeat;background-position:0 0;background-size:216px 100%;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>
      <td align="center" valign="middle" style="padding:24px 10px 18px 10px;line-height:0;vertical-align:middle;">
        {{#if photo_url}}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;"><tr><td style="padding:3px;line-height:0;background-color:{{t6_photo_ring}};border-radius:50%;mso-border-radius-alt:999px;">
          <img src="{{{photo_url}}}" alt="" width="172" height="172" style="display:block;width:172px;height:172px;border-radius:50%;object-fit:cover;border:0;">
        </td></tr></table>
        {{else}}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;"><tr><td align="center" valign="middle" width="172" height="172" style="width:172px;height:172px;background-color:{{t6_photo_ring}};border-radius:50%;font-size:26px;font-weight:700;color:{{color_1}};font-family:Georgia,'Times New Roman',serif;">{{name_initials}}</td></tr></table>
        {{/if}}
      </td>
    </tr></table>
  </td>
  <td width="360" valign="top" bgcolor="#ffffff" style="width:360px;vertical-align:top;background-color:#ffffff;background-image:url({{{t6_right_deco}}});background-repeat:no-repeat;background-position:100% 0;background-size:320px auto;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr><td align="right" valign="top" style="padding:14px 18px 0 8px;line-height:1.1;font-size:0;">
        {{#if logo_url}}
        <img src="{{{logo_url}}}" alt="" height="32" style="display:block;border:0;max-height:36px;width:auto;max-width:160px;margin-left:auto;">
        {{else}}{{#if company_name}}
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:{{t6_logo_text_color}};">{{company_name}}</span>
        {{else}}
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:{{t6_logo_text_color}};">Logo</span>
        {{/if}}{{/if}}
      </td></tr>
      <tr><td style="padding:4px 22px 0 14px;vertical-align:top;">
        <span style="display:block;font-size:14px;font-weight:400;color:{{t6_greeting_color}};line-height:1.35;">Hello, I am</span>
        <span style="display:block;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:700;color:{{t6_name_color}};line-height:1.08;padding-top:2px;">{{full_name}}</span>
        <span style="display:block;font-size:14px;font-weight:700;color:{{t6_title_color}};line-height:1.25;padding-top:4px;padding-bottom:12px;">{{job_title}}</span>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;table-layout:fixed;">
          <tr>
            <td width="50%" valign="top" style="width:50%;padding:0 12px 6px 0;vertical-align:top;">
              {{#if phone}}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="20" valign="middle" style="width:20px;padding:0 8px 0 0;vertical-align:middle;line-height:0;"><img src="{{{t6_icon_phone}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
                <td valign="middle" style="font-size:12px;font-weight:400;color:{{t6_contact_color}};line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">{{phone}}</td>
              </tr></table>
              {{/if}}
            </td>
            <td width="50%" valign="top" style="width:50%;padding:0 0 6px 0;vertical-align:top;">
              {{#if has_t6_row1_right}}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="20" valign="middle" align="center" style="width:20px;padding:0 8px 0 0;vertical-align:middle;font-size:13px;font-weight:700;color:{{t6_fb_glyph_color}};line-height:1;font-family:Inter,Arial,sans-serif;">f</td>
                <td valign="middle" style="font-size:12px;font-weight:400;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">{{#if t6_row1_right_href}}<a href="{{{t6_row1_right_href}}}" style="color:{{t6_contact_color}};text-decoration:none;">{{t6_row1_right_display}}</a>{{else}}<span style="color:{{t6_contact_color}};">{{t6_row1_right_display}}</span>{{/if}}</td>
              </tr></table>
              {{/if}}
            </td>
          </tr>
          <tr>
            <td width="50%" valign="top" style="width:50%;padding:0 12px 0 0;vertical-align:top;">
              {{#if email}}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="20" valign="middle" style="width:20px;padding:0 8px 0 0;vertical-align:middle;line-height:0;"><img src="{{{t6_icon_mail}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
                <td valign="middle" style="font-size:12px;font-weight:400;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t6_link_color}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
              </tr></table>
              {{/if}}
            </td>
            <td width="50%" valign="top" style="width:50%;padding:0;vertical-align:top;">
              {{#if has_address}}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="20" valign="top" style="width:20px;padding:0 8px 0 0;vertical-align:top;line-height:0;padding-top:1px;"><img src="{{{t6_icon_pin}}}" width="16" height="16" alt="" style="display:block;border:0;"></td>
                <td valign="top" style="font-size:12px;font-weight:400;color:{{t6_contact_color}};line-height:1.35;word-break:normal;overflow-wrap:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
              </tr></table>
              {{/if}}
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td align="right" valign="bottom" style="padding:8px 14px 14px 8px;vertical-align:bottom;">
        {{#if has_t6_sparkles}}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin-bottom:4px;"><tr>
          <td valign="middle" style="padding:0 6px 0 0;line-height:0;vertical-align:middle;"><img src="{{{t6_sparkle_sm}}}" width="22" height="22" alt="" style="display:block;border:0;"></td>
          <td valign="middle" style="padding:0 14px 0 0;line-height:0;vertical-align:middle;"><img src="{{{t6_sparkle_lg}}}" width="28" height="28" alt="" style="display:block;border:0;"></td>
        </tr></table>
        {{/if}}
      </td></tr>
    </table>
  </td>
</tr>
</table>
</td></tr></table>${BADGE}`,

  /**
   * Layout 7 — **600px** “studio” strip: white card (photo + logo), name/title + socials, vertical rule, icon+text contacts (Poppins stack).
   */
  template_7: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Poppins',Arial,Helvetica,sans-serif;">
<tr><td style="padding:0;background-color:{{t7_shell_bg}};border-radius:8px;-webkit-border-radius:8px;overflow:hidden;" bgcolor="{{t7_shell_bg}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;border-collapse:collapse;table-layout:fixed;">
<tr valign="bottom">
  <td width="192" valign="top" bgcolor="{{t7_card_bg}}" style="width:192px;vertical-align:top;background-color:{{t7_card_bg}};padding:14px 18px 16px 30px;">
    {{#if photo_url}}
    <img src="{{{photo_url}}}" alt="" width="140" height="140" style="display:block;width:140px;height:140px;border-radius:50%;-webkit-border-radius:50%;object-fit:cover;border:0;margin:0 0 0 -4px;">
    {{else}}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="140" style="border-collapse:collapse;margin:0 0 0 -4px;"><tr><td align="center" valign="middle" width="140" height="140" bgcolor="{{t7_initials_bg}}" style="width:140px;height:140px;background-color:{{t7_initials_bg}};border-radius:50%;mso-border-radius-alt:999px;font-size:26px;font-weight:700;color:{{t7_initials_color}};">{{name_initials}}</td></tr></table>
    {{/if}}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-top:10px;"><tr><td align="center" style="padding:0;line-height:0;">
      {{#if logo_url}}<img src="{{{logo_url}}}" alt="" height="22" style="display:block;border:0;max-height:26px;width:auto;max-width:120px;margin:0 auto;">{{else}}{{#if company_name}}<span style="font-size:13px;font-weight:600;color:{{t7_initials_color}};">{{company_name}}</span>{{/if}}{{/if}}
    </td></tr></table>
  </td>
  <td valign="bottom" style="vertical-align:bottom;padding:8px 10px 20px 6px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr><td style="padding:0 0 4px 0;font-size:20px;font-weight:700;color:{{t7_name_color}};line-height:1.2;white-space:normal;word-break:break-word;">{{name}}</td></tr>
      <tr><td style="padding:0 0 12px 0;font-size:14px;font-weight:400;color:{{t7_title_color}};line-height:1.35;white-space:normal;">{{title}}</td></tr>
      <tr><td style="padding:0;line-height:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
          {{#if has_linkedin}}<td style="padding:0 10px 0 0;vertical-align:middle;line-height:0;"><a href="{{{linkedin_url}}}" style="text-decoration:none;"><img src="{{{t7_soc_linkedin}}}" width="22" height="22" alt="" style="display:block;border:0;"></a></td>{{/if}}
          {{#if has_medium}}<td style="padding:0 10px 0 0;vertical-align:middle;line-height:0;"><a href="{{{medium_url}}}" style="text-decoration:none;"><img src="{{{t7_soc_medium}}}" width="22" height="22" alt="" style="display:block;border:0;"></a></td>{{/if}}
          {{#if has_twitter}}<td style="padding:0 10px 0 0;vertical-align:middle;line-height:0;"><a href="{{{twitter_url}}}" style="text-decoration:none;"><img src="{{{t7_soc_twitter}}}" width="22" height="22" alt="" style="display:block;border:0;"></a></td>{{/if}}
          {{#if has_github}}<td style="padding:0;vertical-align:middle;line-height:0;"><a href="{{{github_url}}}" style="text-decoration:none;"><img src="{{{t7_soc_github}}}" width="22" height="22" alt="" style="display:block;border:0;"></a></td>{{/if}}
        </tr></table>
      </td></tr>
    </table>
  </td>
  <td width="28" valign="middle" align="center" style="width:28px;vertical-align:middle;padding:0 8px 18px 8px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td style="width:1px;height:132px;border-left:1px solid {{t7_divider_color}};font-size:0;line-height:0;">&nbsp;</td></tr></table>
  </td>
  <td valign="bottom" style="vertical-align:bottom;padding:0 22px 22px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      {{#if email}}<tr><td width="22" valign="top" style="width:22px;padding:1px 8px 10px 0;vertical-align:top;line-height:0;"><img src="{{{t7_icon_mail}}}" width="18" height="18" alt="" style="display:block;border:0;"></td><td valign="top" style="padding:0 0 10px 0;font-size:14px;font-weight:300;color:{{t7_contact_text}};line-height:1.4;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t7_contact_text}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td></tr>{{/if}}
      {{#if phone}}<tr><td width="22" valign="top" style="width:22px;padding:0 8px 10px 0;vertical-align:top;line-height:0;"><img src="{{{t7_icon_phone}}}" width="18" height="18" alt="" style="display:block;border:0;"></td><td valign="top" style="padding:0 0 10px 0;font-size:14px;font-weight:300;color:{{t7_contact_text}};line-height:1.4;">{{phone}}</td></tr>{{/if}}
      {{#if has_website}}<tr><td width="22" valign="top" style="width:22px;padding:0 8px 10px 0;vertical-align:top;line-height:0;"><img src="{{{t7_icon_globe}}}" width="18" height="18" alt="" style="display:block;border:0;"></td><td valign="top" style="padding:0 0 10px 0;font-size:14px;font-weight:300;line-height:1.4;"><a href="{{{website_full}}}" style="color:{{t7_contact_text}};text-decoration:none;">{{website}}</a></td></tr>{{/if}}
      {{#if has_address}}<tr><td width="22" valign="top" style="width:22px;padding:0 8px 0 0;vertical-align:top;line-height:0;"><img src="{{{t7_icon_pin}}}" width="18" height="18" alt="" style="display:block;border:0;"></td><td valign="top" style="padding:0;font-size:14px;font-weight:300;color:{{t7_contact_text}};line-height:1.4;word-break:normal;overflow-wrap:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td></tr>{{/if}}
    </table>
  </td>
</tr>
</table>
</td></tr></table>${BADGE}`,

  /**
   * Layout 8 — **600px** reference: blue wedge behind round photo, circular blue socials, blue contact icons + gray text, rule, title + logo (Poppins).
   */
  template_8: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Poppins',Arial,Helvetica,sans-serif;">
<tr><td style="padding:16px 26px 20px 16px;background-color:{{t8_shell_bg}};border-radius:8px;-webkit-border-radius:8px;" bgcolor="{{t8_shell_bg}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="568" style="width:568px;max-width:100%;border-collapse:collapse;table-layout:fixed;">
<tr valign="top">
  <td width="178" valign="top" style="width:178px;vertical-align:top;padding:4px 8px 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="168" height="168" align="center" style="width:168px;height:168px;border-collapse:collapse;background-image:url({{{t8_photo_wedge_bg}}});background-repeat:no-repeat;background-position:center;background-size:168px 168px;">
      <tr><td align="center" valign="middle" style="padding:16px 12px;line-height:0;">
        {{#if photo_url}}
        <img src="{{{photo_url}}}" alt="" width="120" height="120" style="display:block;width:120px;height:120px;border-radius:50%;-webkit-border-radius:50%;object-fit:cover;border:4px solid #ffffff;box-sizing:content-box;">
        {{else}}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="120" height="120" style="border-collapse:collapse;"><tr><td align="center" valign="middle" width="120" height="120" bgcolor="{{t8_initials_bg}}" style="width:120px;height:120px;background-color:{{t8_initials_bg}};border-radius:50%;mso-border-radius-alt:999px;border:4px solid #ffffff;font-size:24px;font-weight:700;color:{{t8_initials_color}};">{{name_initials}}</td></tr></table>
        {{/if}}
      </td></tr>
    </table>
  </td>
  <td valign="top" style="vertical-align:top;padding:6px 16px 0 8px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr><td style="padding:0 0 18px 0;font-size:22px;font-weight:700;color:{{t8_name_color}};line-height:1.15;white-space:normal;word-break:break-word;">{{name}}</td></tr>
      {{#if email}}<tr><td style="padding:0 0 12px 0;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
        <td width="28" valign="top" style="width:28px;padding:2px 10px 0 0;vertical-align:top;line-height:0;"><img src="{{{t8_icon_mail}}}" width="18" height="18" alt="" style="display:block;border:0;"></td>
        <td valign="top" style="font-size:14px;font-weight:300;color:{{t8_contact_color}};line-height:1.45;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t8_contact_color}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
      </tr></table></td></tr>{{/if}}
      {{#if phone}}<tr><td style="padding:0 0 12px 0;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
        <td width="28" valign="top" style="width:28px;padding:0 10px 0 0;vertical-align:top;line-height:0;"><img src="{{{t8_icon_phone}}}" width="18" height="18" alt="" style="display:block;border:0;"></td>
        <td valign="top" style="font-size:14px;font-weight:300;color:{{t8_contact_color}};line-height:1.45;">{{phone}}</td>
      </tr></table></td></tr>{{/if}}
      {{#if has_address}}<tr><td style="padding:0 0 12px 0;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
        <td width="28" valign="top" style="width:28px;padding:0 10px 0 0;vertical-align:top;line-height:0;"><img src="{{{t8_icon_pin}}}" width="18" height="18" alt="" style="display:block;border:0;"></td>
        <td valign="top" style="font-size:14px;font-weight:300;color:{{t8_contact_color}};line-height:1.45;word-break:normal;overflow-wrap:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
      </tr></table></td></tr>{{/if}}
      {{#if has_website}}<tr><td style="padding:0;"><table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
        <td width="28" valign="top" style="width:28px;padding:0 10px 0 0;vertical-align:top;line-height:0;"><img src="{{{t8_icon_globe}}}" width="18" height="18" alt="" style="display:block;border:0;"></td>
        <td valign="top" style="font-size:14px;font-weight:300;line-height:1.45;"><a href="{{{website_full}}}" style="color:{{t8_contact_color}};text-decoration:none;">{{website}}</a></td>
      </tr></table></td></tr>{{/if}}
    </table>
  </td>
  <td width="26" valign="top" align="center" style="width:26px;vertical-align:top;padding:8px 4px 0 4px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td style="width:1px;height:158px;border-left:1px solid {{t8_divider_color}};font-size:0;line-height:0;">&nbsp;</td></tr></table>
  </td>
  <td width="138" valign="top" style="width:138px;vertical-align:top;padding:6px 0 0 6px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr><td style="padding:0 0 20px 0;font-size:14px;font-weight:400;color:{{t8_title_color}};line-height:1.45;white-space:normal;">{{title}}</td></tr>
      <tr><td style="padding:0 0 0 2px;line-height:0;">
        {{#if logo_url}}<img src="{{{logo_url}}}" alt="" height="40" style="display:block;border:0;max-height:44px;width:auto;max-width:118px;">{{else}}{{#if company_name}}<span style="font-size:22px;font-weight:700;color:{{t8_name_color}};letter-spacing:-0.02em;">{{company_name}}</span>{{/if}}{{/if}}
      </td></tr>
    </table>
  </td>
</tr>
</table>
</td></tr></table>${BADGE}`,

  /**
   * Layout 9 — **600px** mint chevron + white rim, circular headshot (mint rounded `td` under `<img>` so alpha never composites on #111; SVG for initials), flat #111 row, mint name + title, mint contact pills + muted grey details (reference; no social row).
   */
  template_9: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Segoe UI',Roboto,Arial,Helvetica,sans-serif;">
<tr><td bgcolor="#111111" style="padding:0;background-color:#111111;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;">
<tr>
<td width="240" valign="middle" align="left" bgcolor="#111111" background="{{{t9_chevron_art}}}" style="width:240px;max-width:40%;vertical-align:middle;text-align:left;background-color:#111111;background-image:url({{{t9_chevron_art}}});background-size:auto 100%;background-position:left center;background-repeat:no-repeat;padding:16px 44px 16px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;margin:0;"><tr><td width="200" align="left" valign="middle" style="width:200px;line-height:0;overflow:visible;background-color:transparent;vertical-align:middle;">{{#if photo_url}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse:collapse;margin:0 0 0 8px;"><tr><td width="128" height="128" bgcolor="{{t9_neon}}" align="center" valign="middle" style="width:128px;height:128px;line-height:0;padding:0;mso-line-height-rule:exactly;background-color:{{t9_neon}};border-radius:64px;-webkit-border-radius:64px;mso-border-radius-alt:64px;"><img src="{{{photo_url}}}" width="128" height="128" alt="" style="display:block;width:128px;height:128px;border:0;outline:none;border-radius:64px;-webkit-border-radius:64px;mso-border-radius-alt:64px;object-fit:cover;background-color:transparent;-ms-interpolation-mode:bicubic;"></td></tr></table>{{else}}<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200" viewBox="0 0 200 200" fill="none" style="display:block;background-color:transparent;margin:0 0 0 8px;"><defs><clipPath id="t9AvClip"><circle cx="100" cy="100" r="64"/></clipPath></defs><g clip-path="url(#t9AvClip)"><circle cx="100" cy="100" r="64" fill="{{t9_neon}}"/><text x="100" y="110" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700" fill="{{t9_initials_on_card}}" stroke="{{t9_dark_bg}}" stroke-width="2" paint-order="stroke fill">{{name_initials}}</text></g></svg>{{/if}}</td></tr></table>
</td>
<td width="178" valign="middle" bgcolor="#111111" style="width:178px;max-width:32%;vertical-align:middle;padding:22px 12px 22px 4px;background-color:#111111;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;"><tr><td style="font-size:20px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:{{t9_neon}};line-height:1.12;word-break:break-word;">{{name}}</td></tr>
<tr><td style="padding-top:6px;font-size:13px;font-weight:400;color:#ffffff;line-height:1.4;word-break:break-word;">{{title}}</td></tr>
</table>
</td>
<td valign="top" bgcolor="#111111" style="vertical-align:top;padding:22px 22px 22px 10px;background-color:#111111;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
{{#if has_address}}<tr><td style="padding:0 0 10px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td width="34" valign="top" style="width:34px;padding:0 10px 0 0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" width="26" height="26" style="width:26px;height:26px;border-collapse:collapse;background-color:{{t9_neon}};border-radius:13px;border:0;"><tr><td align="center" valign="middle" style="line-height:0;padding:0;"><img src="{{{t9_icon_pin}}}" width="12" height="12" alt="" style="display:block;border:0;"></td></tr></table></td>
<td valign="top" style="padding:2px 0 0 0;font-size:12px;font-weight:400;color:{{t9_body_muted}};line-height:1.45;word-break:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr></table></td></tr>{{/if}}
{{#if phone}}<tr><td style="padding:0 0 10px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td width="34" valign="top" style="width:34px;padding:0 10px 0 0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" width="26" height="26" style="width:26px;height:26px;border-collapse:collapse;background-color:{{t9_neon}};border-radius:13px;border:0;"><tr><td align="center" valign="middle" style="line-height:0;padding:0;"><img src="{{{t9_icon_phone}}}" width="12" height="12" alt="" style="display:block;border:0;"></td></tr></table></td>
<td valign="top" style="padding:2px 0 0 0;font-size:12px;font-weight:400;color:{{t9_body_muted}};line-height:1.45;">{{#if phone_line2}}{{phone_line1}}<br>{{phone_line2}}{{else}}{{phone}}{{/if}}</td>
</tr></table></td></tr>{{/if}}
{{#if email}}<tr><td style="padding:0 0 10px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td width="34" valign="top" style="width:34px;padding:0 10px 0 0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" width="26" height="26" style="width:26px;height:26px;border-collapse:collapse;background-color:{{t9_neon}};border-radius:13px;border:0;"><tr><td align="center" valign="middle" style="line-height:0;padding:0;"><img src="{{{t9_icon_mail}}}" width="12" height="12" alt="" style="display:block;border:0;"></td></tr></table></td>
<td valign="top" style="padding:2px 0 0 0;font-size:12px;font-weight:400;color:{{t9_body_muted}};line-height:1.45;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t9_body_muted}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
</tr></table></td></tr>{{/if}}
{{#if has_website}}<tr><td style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td width="34" valign="top" style="width:34px;padding:0 10px 0 0;vertical-align:top;"><table cellpadding="0" cellspacing="0" border="0" width="26" height="26" style="width:26px;height:26px;border-collapse:collapse;background-color:{{t9_neon}};border-radius:13px;border:0;"><tr><td align="center" valign="middle" style="line-height:0;padding:0;"><img src="{{{t9_icon_globe}}}" width="12" height="12" alt="" style="display:block;border:0;"></td></tr></table></td>
<td valign="top" style="padding:2px 0 0 0;font-size:12px;font-weight:400;line-height:1.45;"><a href="{{{website_full}}}" style="color:{{t9_body_muted}};text-decoration:none;">{{website}}</a></td>
</tr></table></td></tr>{{/if}}
</table>
</td>
</tr>
</table>
</td></tr></table>${BADGE}`,

  /**
   * Layout 10 — **600px** reference: **#1a1a1a** shell, **~40px** lime bar, **name + title pill same row** (pill `valign` bottom),
   * contacts 2-col (phone/email | web/address), **photo** PNG cutout **right** + **flush bottom**, logo top-right.
   */
  template_10: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Arial,Helvetica,sans-serif;">
<tr><td style="padding:0;border-radius:14px;-webkit-border-radius:14px;mso-border-radius-alt:14px;overflow:hidden;background-color:{{t10_bg}};" bgcolor="{{t10_bg}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;border-collapse:collapse;border-radius:14px;-webkit-border-radius:14px;overflow:hidden;">
<tr valign="top">
<td width="40" bgcolor="{{t10_bar}}" style="width:40px;min-width:40px;min-height:172px;background-color:{{t10_bar}};border-radius:14px 0 0 14px;-webkit-border-radius:14px 0 0 14px;padding:0;line-height:0;font-size:0;vertical-align:top;mso-line-height-rule:exactly;">&nbsp;</td>
<td valign="top" width="340" style="width:340px;max-width:340px;vertical-align:top;padding:18px 8px 16px 18px;background-color:{{t10_bg}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr valign="top">
<td valign="top" align="left" colspan="2" style="vertical-align:top;padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;width:100%;"><tr valign="bottom">
<td valign="bottom" align="left" style="vertical-align:bottom;padding:0 12px 0 0;">
<div style="font-size:26px;font-weight:700;line-height:28px;color:{{t10_name_color}};mso-line-height-rule:exactly;">{{name_line1}}{{#if name_line2}}<br>{{name_line2}}{{/if}}</div>
</td>
<td valign="bottom" align="left" style="vertical-align:bottom;padding:0;white-space:nowrap;mso-line-height-rule:exactly;">
<span style="display:inline-block;border:1px solid {{t10_pill_border}};background-color:{{t10_pill_bg}};border-radius:999px;-webkit-border-radius:999px;padding:5px 14px 6px 14px;font-size:12px;font-weight:500;color:{{t10_pill_text}};line-height:1.2;mso-line-height-rule:exactly;">{{title}}</span>
</td>
</tr></table>
</td>
</tr>
<tr><td colspan="2" style="padding:18px 0 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr valign="top">
<td valign="top" width="52%" style="width:52%;padding:0 13px 0 0;vertical-align:top;">
{{#if phone}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr valign="top">
<td valign="top" style="width:16px;padding:2px 7px 0 0;line-height:0;vertical-align:top;"><img src="{{{t10_icon_phone}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td>
<td valign="top" style="padding:0;font-size:11px;font-weight:400;color:{{t10_contact_muted}};line-height:1.4;mso-line-height-rule:exactly;">{{#if phone_line2}}{{phone_line1}}<br>{{phone_line2}}{{else}}{{phone}}{{/if}}</td>
</tr></table>{{/if}}
{{#if email}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:8px;"><tr valign="top">
<td valign="top" style="width:16px;padding:2px 7px 0 0;line-height:0;vertical-align:top;"><img src="{{{t10_icon_mail}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td>
<td valign="top" style="padding:0;font-size:11px;font-weight:400;color:{{t10_contact_muted}};line-height:1.4;mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t10_contact_muted}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
</tr></table>{{/if}}
</td>
<td valign="top" width="48%" style="width:48%;padding:0;vertical-align:top;">
{{#if has_website}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr valign="top">
<td valign="top" style="width:16px;padding:1px 7px 0 0;line-height:0;vertical-align:top;"><img src="{{{t10_icon_globe}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td>
<td valign="top" style="padding:0;font-size:11px;font-weight:400;color:{{t10_contact_muted_b}};line-height:1.4;mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t10_contact_muted_b}};text-decoration:none;">{{website}}</a></td>
</tr></table>{{/if}}
{{#if has_address}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:8px;"><tr valign="top">
<td valign="top" style="width:16px;padding:1px 7px 0 0;line-height:0;vertical-align:top;"><img src="{{{t10_icon_pin}}}" width="12" height="12" alt="" style="display:block;border:0;width:12px;height:12px;"></td>
<td valign="top" style="padding:0;font-size:10px;font-weight:400;color:{{t10_contact_address}};line-height:1.45;mso-line-height-rule:exactly;word-break:normal;overflow-wrap:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr></table>{{/if}}
</td>
</tr>
</table>
</td></tr>
</table>
</td>
<td valign="bottom" width="220" style="width:220px;min-width:220px;vertical-align:bottom;padding:0;background-color:{{t10_bg}};" bgcolor="{{t10_bg}}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="220" style="width:220px;border-collapse:collapse;">
<tr valign="bottom" style="vertical-align:bottom;">
<td valign="bottom" align="right" width="148" style="width:148px;vertical-align:bottom;padding:0 2px 0 4px;line-height:0;text-align:right;">
{{#if photo_url}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin:0 0 0 auto;"><tr><td bgcolor="{{t10_bg}}" align="right" style="padding:0;line-height:0;background-color:{{t10_bg}};mso-line-height-rule:exactly;">
<img src="{{{photo_url}}}" alt="" width="168" style="display:block;max-width:168px;width:168px;height:auto;max-height:236px;border:0;outline:none;background-color:transparent;-ms-interpolation-mode:bicubic;object-fit:contain;object-position:right bottom;margin:0;">
</td></tr></table>
{{else}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin:0 0 0 auto;"><tr><td align="center" valign="middle" bgcolor="{{t10_bg}}" style="min-width:72px;padding:28px 4px;font-size:22px;font-weight:700;color:{{t10_bar}};line-height:1;background-color:{{t10_bg}};">{{name_initials}}</td></tr></table>
{{/if}}
</td>
<td valign="top" align="right" width="72" style="width:72px;vertical-align:top;padding:4px 14px 0 4px;text-align:right;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin:0 0 0 auto;">
{{#if logo_url}}
<tr valign="top"><td valign="top" align="right" style="padding:0;line-height:0;vertical-align:top;text-align:right;">
<img src="{{{logo_url}}}" alt="" height="34" style="display:block;height:34px;width:auto;max-width:128px;border:0;">
</td></tr>
{{#if has_t10_tagline}}<tr valign="top"><td valign="top" align="right" style="padding:5px 0 0 0;text-align:right;line-height:1.25;">
<div style="font-size:9px;font-weight:400;color:{{t10_tagline_color}};line-height:1.25;mso-line-height-rule:exactly;">{{t10_tagline}}</div>
</td></tr>{{/if}}
{{else}}
<tr valign="top">
<td valign="top" style="padding:0 5px 0 0;line-height:0;vertical-align:top;">
<img src="{{{t10_brand_icon}}}" width="14" height="17" alt="" style="display:block;width:14px;height:17px;border:0;">
</td>
<td valign="top" style="vertical-align:top;text-align:left;padding:0;">
<div style="font-size:11px;font-weight:300;color:{{t10_company}};line-height:1.25;mso-line-height-rule:exactly;">{{t10_company_display}}</div>
{{#if has_t10_tagline}}<div style="font-size:9px;font-weight:400;color:{{t10_tagline_color}};line-height:1.25;padding-top:3px;mso-line-height-rule:exactly;">{{t10_tagline}}</div>{{/if}}
</td>
</tr>
{{/if}}
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td></tr>
</table>${BADGE}`,

  /**
   * Layout 11 — **620px** wide: **#81cc27** field, compact **#0c0c0d** contact card (~228px), **#5d9021** row dividers,
   * **right column** = grid + **centered** portrait (and optional subtitle above).
   */
  template_11: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="620" style="width:100%;max-width:620px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Arial,Helvetica,sans-serif;">
<tr valign="top">
<td valign="top" style="vertical-align:top;padding:26px 12px 12px 28px;background-color:{{t11_bg}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr><td style="padding:0 3px 0 3px;font-size:28px;font-weight:700;line-height:30px;color:{{t11_hello_color}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">Hello, I'm</td></tr>
<tr><td style="padding:2px 3px 0 3px;font-size:28px;font-weight:700;line-height:32px;color:{{t11_name_color}};letter-spacing:-0.02em;mso-line-height-rule:exactly;">{{name_line1}}{{#if name_line2}} {{name_line2}}{{/if}}</td></tr>
{{#if has_t11_intro}}<tr><td style="padding:4px 6px 0 3px;font-size:10px;font-weight:400;line-height:12px;color:{{t11_intro_color}};max-width:310px;mso-line-height-rule:exactly;">{{t11_intro_line1}}{{#if t11_intro_line2}}<br>{{t11_intro_line2}}{{/if}}</td></tr>{{/if}}
<tr><td style="padding:6px 0 0 3px;line-height:0;font-size:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="132" style="width:132px;border-collapse:collapse;"><tr><td height="4" bgcolor="{{t11_divider}}" style="height:4px;line-height:4px;font-size:0;background-color:{{t11_divider}};">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding:6px 3px 0 3px;font-size:12px;font-weight:400;line-height:15px;color:{{t11_role_color}};mso-line-height-rule:exactly;">{{t11_job_primary}}</td></tr>
{{#if logo_url}}<tr><td style="padding:8px 3px 0 3px;line-height:0;"><img src="{{{logo_url}}}" alt="" height="28" style="display:block;height:28px;width:auto;max-width:180px;border:0;"></td></tr>{{/if}}
</table>
</td>
<td valign="middle" width="240" style="width:240px;max-width:240px;vertical-align:middle;padding:10px 6px 10px 5px;background-color:{{t11_bg}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="228" align="center" style="width:228px;max-width:228px;border-collapse:separate;border-radius:8px;-webkit-border-radius:8px;overflow:hidden;mso-border-radius-alt:8px;">
<tr><td style="padding:0;line-height:0;font-size:0;background-color:{{t11_card_fill}};border-radius:8px;-webkit-border-radius:8px;mso-border-radius-alt:8px;">
<table role="presentation" cellpadding="0" cellspacing="1" border="0" width="228" bgcolor="{{t11_gutter_color}}" style="width:228px;max-width:228px;border-collapse:separate;mso-table-lspace:1pt;mso-table-rspace:1pt;">
{{#if has_address}}<tr><td bgcolor="{{t11_card_fill}}" style="background-color:{{t11_card_fill}};padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:226px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>
<td width="32" valign="middle" style="width:32px;max-width:32px;padding:6px 0 6px 10px;vertical-align:middle;line-height:0;"><img src="{{{t11_icon_pin}}}" width="13" height="17" alt="" style="display:block;border:0;"></td>
<td valign="middle" width="100%" style="width:100%;padding:6px 10px 6px 6px;font-size:11px;font-weight:400;color:{{t11_contact_text}};line-height:1.3;word-break:break-word;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr></table></td></tr>{{/if}}
{{#if phone}}<tr><td bgcolor="{{t11_card_fill}}" style="background-color:{{t11_card_fill}};padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:226px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>
<td width="32" valign="middle" style="width:32px;max-width:32px;padding:6px 0 6px 10px;vertical-align:middle;line-height:0;"><img src="{{{t11_icon_phone}}}" width="11" height="15" alt="" style="display:block;border:0;"></td>
<td valign="middle" width="100%" style="width:100%;padding:6px 10px 6px 6px;font-size:11px;font-weight:400;color:{{t11_contact_text_b}};line-height:1.3;">{{#if phone_line2}}{{phone_line1}}<br>{{phone_line2}}{{else}}{{phone}}{{/if}}</td>
</tr></table></td></tr>{{/if}}
{{#if email}}<tr><td bgcolor="{{t11_card_fill}}" style="background-color:{{t11_card_fill}};padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:226px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>
<td width="32" valign="middle" style="width:32px;max-width:32px;padding:6px 0 6px 10px;vertical-align:middle;line-height:0;"><img src="{{{t11_icon_mail}}}" width="13" height="11" alt="" style="display:block;border:0;"></td>
<td valign="middle" width="100%" style="width:100%;padding:6px 10px 6px 6px;font-size:11px;font-weight:400;color:{{t11_contact_text}};line-height:1.3;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t11_contact_text}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
</tr></table></td></tr>{{/if}}
{{#if has_website}}<tr><td bgcolor="{{t11_card_fill}}" style="background-color:{{t11_card_fill}};padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:226px;border-collapse:collapse;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr>
<td width="32" valign="middle" style="width:32px;max-width:32px;padding:6px 0 6px 10px;vertical-align:middle;line-height:0;"><img src="{{{t11_icon_globe}}}" width="15" height="15" alt="" style="display:block;border:0;"></td>
<td valign="middle" width="100%" style="width:100%;padding:6px 10px 6px 6px;font-size:11px;font-weight:400;color:{{t11_contact_text_b}};line-height:1.3;"><a href="{{{website_full}}}" style="color:{{t11_contact_text_b}};text-decoration:none;">{{website}}</a></td>
</tr></table></td></tr>{{/if}}
</table>
</td></tr>
</table>
</td>
<td valign="middle" width="168" align="center" style="width:168px;max-width:168px;vertical-align:middle;text-align:center;padding:10px 22px 10px 14px;background-color:{{t11_bg}};background-image:url({{{t11_grid_uri}}});background-repeat:no-repeat;background-position:center;background-size:110px 100%;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
{{#if has_t11_corner_role}}<tr><td align="center" style="padding:0 0 8px 0;text-align:center;font-size:10px;font-weight:400;line-height:1.25;color:{{t11_corner_color}};mso-line-height-rule:exactly;">{{t11_corner_role}}</td></tr>{{/if}}
<tr><td align="center" valign="middle" style="padding:0;line-height:0;text-align:center;vertical-align:middle;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="100" height="100" style="display:block;width:100px;height:100px;max-width:100px;margin:0 auto;border:3px solid {{t11_photo_ring}};object-fit:cover;border-radius:52% 48% 50% 50%/50% 50% 48% 52%;-webkit-border-radius:52% 48% 50% 50%;">
{{else}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;"><tr><td align="center" valign="middle" width="100" height="100" bgcolor="{{t11_initials_bg}}" style="width:100px;height:100px;background-color:{{t11_initials_bg}};border:3px solid {{t11_photo_ring}};font-size:24px;font-weight:700;color:{{t11_initials_color}};mso-line-height-rule:exactly;border-radius:52% 48% 50% 50%;-webkit-border-radius:52% 48% 50% 50%;">{{name_initials}}</td></tr></table>{{/if}}
</td></tr>
</table>
</td>
</tr>
</table>${BADGE}`,

  /** Layout 12 — 520×162 cream + lime resume card (Rheina reference, email-safe tables). */
  template_12: `${TEMPLATE_12_MARKUP}${BADGE}`,

  /** Layout 13 — dark card + yellow photo rail + “I’M” + social stack + uppercase contacts (reference card). */
  template_13: `${TEMPLATE_13_MARKUP}${BADGE}`,

  /** Layout 14 — light canvas + orange squircle photo + black contacts + white footer + orange social pills. */
  template_14: `${TEMPLATE_14_MARKUP}${BADGE}`,

  /** Layout 15 — neon lime + white tab/card + contact block (reference card). */
  /** Layout 15 — no trailing “Made with…” strip so the lime card is the full footprint. */
  template_15: `${TEMPLATE_15_MARKUP}`,

  /** Layout 16 — navy split + seam portrait + white panel (corporate reference). */
  template_16: `${TEMPLATE_16_MARKUP}`,

  /** Layout 17 — 600px white card + lime rail + split name + contacts + footer bar (creative card reference). */
  template_17: `${TEMPLATE_17_MARKUP}`,

  /** Layout 18 — ~521×183 Zubrilka-style business card: sage brand, cream field, two-column contacts. */
  template_18: `${TEMPLATE_18_MARKUP}`,

  /** Layout 19 — 600×210 periwinkle creative card + sage portrait frame (Figma reference). */
  template_19: `${TEMPLATE_19_MARKUP}`,

  /** Layout 20 — 600×210 neon dark banner: radial field + S-glow behind portrait, DM pill, gradient role, Core. */
  template_20: `${TEMPLATE_20_MARKUP}`,

  /**
   * Layout 4 — same **470px** footprint as Layout 2: dark card, full-bleed art bg, contacts, logo lockup.
   */
  template_4: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="470" style="width:470px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Inter,system-ui,-apple-system,'Segoe UI',Arial,sans-serif;">
<tr>
<td width="470" valign="top" bgcolor="{{t4_bg_solid}}" background="{{{t4_card_bg}}}" style="width:470px;max-width:100%;min-height:260px;background-color:{{t4_bg_solid}};background-image:url({{{t4_card_bg}}});background-size:cover;background-position:0% 0%;background-repeat:no-repeat;border-radius:14px;-webkit-border-radius:14px;overflow:hidden;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;min-height:260px;border-collapse:collapse;">
<tr>
<td style="padding:26px 118px 28px 20px;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr><td style="font-size:22px;font-weight:400;color:{{t4_name_color}};line-height:28px;padding:0;mso-line-height-rule:exactly;">{{name}}</td></tr>
<tr><td style="font-size:13px;font-weight:400;color:{{t4_title_color}};line-height:18px;padding:8px 0 0 0;mso-line-height-rule:exactly;">{{title}}</td></tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:18px;">
{{#if phone}}
<tr><td style="padding:0 0 10px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="22" valign="middle" style="width:22px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;"><img src="{{{t4_icon_phone}}}" width="18" height="18" alt="" style="display:block;border:0;width:18px;height:18px;"></td>
<td valign="middle" style="font-size:12px;color:{{t4_phone_color}};line-height:17px;padding:0;mso-line-height-rule:exactly;">{{phone}}</td>
</tr></table>
</td></tr>
{{/if}}
{{#if email}}
<tr><td style="padding:0 0 10px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="22" valign="middle" style="width:22px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;"><img src="{{{t4_icon_email}}}" width="20" height="17" alt="" style="display:block;border:0;width:20px;height:17px;"></td>
<td valign="middle" style="font-size:12px;color:{{t4_email_color}};line-height:17px;padding:0;mso-line-height-rule:exactly;">{{#if t4_mailto_href}}<a href="{{{t4_mailto_href}}}" style="color:{{t4_link_email}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
</tr></table>
</td></tr>
{{/if}}
{{#if has_website}}
<tr><td style="padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="21" valign="middle" style="width:21px;padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;"><img src="{{{t4_icon_globe}}}" width="19" height="17" alt="" style="display:block;border:0;width:19px;height:17px;"></td>
<td valign="middle" style="font-size:12px;color:{{t4_web_color}};line-height:17px;padding:0;mso-line-height-rule:exactly;"><a href="{{{website_full}}}" style="color:{{t4_link_web}};text-decoration:none;">{{website}}</a></td>
</tr></table>
</td></tr>
{{/if}}
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:22px;">
<tr>
<td valign="middle" style="padding:0 10px 0 0;vertical-align:middle;line-height:0;font-size:0;"><img src="{{{t4_logo_src}}}" alt="" width="40" height="40" style="display:block;border:0;width:40px;height:40px;object-fit:contain;"></td>
<td valign="middle" style="font-size:15px;font-weight:700;color:{{t4_company_color}};line-height:20px;padding:0;mso-line-height-rule:exactly;">{{#if t4_company_line1}}{{t4_company_line1}}{{#if has_t4_company_line2}}<br>{{t4_company_line2}}{{/if}}{{else}}&nbsp;{{/if}}</td>
</tr>
</table>
</td></tr></table>
</td></tr></table>${BADGE}`,
};

export const TEMPLATE_META = {
  template_1: {
    id: 'template_1',
    name: 'Layout 1',
    tier: 'free',
    /** Primary label for display; `style_tags` drives multi-filter gallery matching. */
    style: 'design',
    /** Listed under both Design and Minimalist sidebar filters. */
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_2: {
    id: 'template_2',
    name: 'Layout 2',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_3: {
    id: 'template_3',
    name: 'Layout 3',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_4: {
    id: 'template_4',
    name: 'Layout 4',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: false,
    color_count: 8,
    preview_img_url:
      'https://static.codia.ai/s/image_caba0333-a82b-443e-9903-6458245ac81f.png',
  },
  template_5: {
    id: 'template_5',
    name: 'Layout 5',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_6: {
    id: 'template_6',
    name: 'Layout 6',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_7: {
    id: 'template_7',
    name: 'Layout 7',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_8: {
    id: 'template_8',
    name: 'Layout 8',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_9: {
    id: 'template_9',
    name: 'Layout 9',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_10: {
    id: 'template_10',
    name: 'Layout 10',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_11: {
    id: 'template_11',
    name: 'Layout 11',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_12: {
    id: 'template_12',
    name: 'Layout 12',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: false,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_13: {
    id: 'template_13',
    name: 'Layout 13',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: false,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_14: {
    id: 'template_14',
    name: 'Layout 14',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: false,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_15: {
    id: 'template_15',
    name: 'Layout 15',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_16: {
    id: 'template_16',
    name: 'Layout 16',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_17: {
    id: 'template_17',
    name: 'Layout 17',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: false,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_18: {
    id: 'template_18',
    name: 'Layout 18',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: false,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_19: {
    id: 'template_19',
    name: 'Layout 19',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: false,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
  template_20: {
    id: 'template_20',
    name: 'Layout 20',
    tier: 'free',
    style: 'design',
    style_tags: ['design', 'minimalist'],
    has_logo: true,
    has_photo: true,
    color_count: 8,
    preview_img_url: null,
  },
};

export const signatureTemplates = Object.keys(TEMPLATE_META).map((slug, i) => {
  const m = TEMPLATE_META[slug];
  const tags = Array.isArray(m.style_tags) && m.style_tags.length ? m.style_tags : [m.style || 'design'];
  return {
    id: slug,
    name: m.name,
    category: 'Design',
    description: 'Split banner (email-safe tables): white/blue + photo seam; works in Gmail.',
    thumbnail: m.preview_img_url,
    tier: m.tier,
    style: m.style,
    style_tags: tags,
    has_logo: m.has_logo,
    has_photo: m.has_photo,
    color_count: m.color_count,
    sort_order: i + 1,
  };
});

export const TEMPLATE_ID_MAP = {
  'classic-table': 'template_1',
  'minimal-stack': 'template_1',
  'corporate-strip': 'template_1',
  classic_split: 'template_1',
  bold_header: 'template_1',
  minimal_left: 'template_1',
  card_style: 'template_1',
  executive: 'template_1',
  modern_banner: 'template_1',
};

export function resolveTemplateKey(templateId) {
  if (!templateId || typeof templateId !== 'string') return 'template_1';
  const t = templateId.trim();
  if (TEMPLATES[t]) return t;
  if (TEMPLATE_ID_MAP[t]) return TEMPLATE_ID_MAP[t];
  if (/^template_image$/i.test(t)) return 'template_1';
  if (/^template_2$/i.test(t)) return 'template_2';
  if (/^template_3$/i.test(t)) return 'template_3';
  if (/^template_4$/i.test(t)) return 'template_4';
  if (/^template_5$/i.test(t)) return 'template_5';
  if (/^template_6$/i.test(t)) return 'template_6';
  if (/^template_7$/i.test(t)) return 'template_7';
  if (/^template_8$/i.test(t)) return 'template_8';
  if (/^template_9$/i.test(t)) return 'template_9';
  if (/^template_10$/i.test(t)) return 'template_10';
  if (/^template_11$/i.test(t)) return 'template_11';
  if (/^template_12$/i.test(t)) return 'template_12';
  if (/^template_13$/i.test(t)) return 'template_13';
  if (/^template_14$/i.test(t)) return 'template_14';
  if (/^template_15$/i.test(t)) return 'template_15';
  if (/^template_16$/i.test(t)) return 'template_16';
  if (/^template_17$/i.test(t)) return 'template_17';
  if (/^template_18$/i.test(t)) return 'template_18';
  if (/^template_19$/i.test(t)) return 'template_19';
  if (/^template_20$/i.test(t)) return 'template_20';
  if (/^template_\d+$/i.test(t)) return 'template_1';
  if (UUID_RE_TEMPLATE.test(t)) return uuidToTemplateSlug(t);
  return 'template_1';
}

export function getTemplateHtml(templateId) {
  const key = resolveTemplateKey(templateId);
  return TEMPLATES[key] || TEMPLATES.template_1;
}

export function getTemplateById(templateId) {
  const key = resolveTemplateKey(templateId);
  const meta = TEMPLATE_META[key] || TEMPLATE_META.template_1;
  return {
    id: meta.id,
    name: meta.name,
    html: TEMPLATES[key] || TEMPLATES.template_1,
  };
}
