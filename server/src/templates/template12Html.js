/**
 * Layout 12 — 520×162 Rheina reference (email-safe tables): cream card surface (no full-bleed plate PNG — avoids baked-in edge); left “Hello, I’m” +
 * full name + chevron + lime role pill (black title, centered, rounded); center **P** / **E** / **A** + copy (no colons); small X;
 * right column: **SVG lime rail** (`t12_photo_rail_uri`) on **card-colored** td (not lime) so SVG transparency shows the stepped cut; portrait + squiggle on top. Tokens from `buildTemplate12PaletteContext`.
 */

export const TEMPLATE_12_MARKUP = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="width:520px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:'Inter',system-ui,-apple-system,'Segoe UI',Arial,Helvetica,sans-serif;border:0;box-shadow:none;">
<tr>
<td width="520" height="162" valign="top" bgcolor="{{t12_card_bg}}" style="width:520px;height:162px;vertical-align:top;padding:0;border:0;outline:none;box-shadow:none;background-color:{{t12_card_bg}};background-image:none;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="width:520px;border-collapse:collapse;">
<tr>
<td width="240" valign="top" style="width:240px;max-width:240px;vertical-align:top;padding:20px 0 0 26px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr>
<td valign="top" style="padding:8px 8px 0 0;line-height:0;font-size:0;vertical-align:top;"><img src="{{{t12_hello_mark_uri}}}" width="20" height="20" alt="" style="display:block;width:20px;height:20px;border:0;"></td>
<td valign="top" style="vertical-align:top;padding:0;">
<div style="font-size:13px;font-weight:500;line-height:15px;color:{{t12_name_color}};mso-line-height-rule:exactly;">Hello, I&#8217;m</div>
<div style="font-size:26px;font-weight:700;line-height:28px;color:{{t12_name_color}};letter-spacing:-0.03em;padding-top:2px;mso-line-height-rule:exactly;">{{name}}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:12px;">
<tr>
<td valign="middle" style="padding:0 5px 0 0;line-height:0;vertical-align:middle;"><img src="{{{t12_chevron_uri}}}" width="12" height="12" alt="" style="display:block;width:12px;height:12px;border:0;"></td>
<td valign="middle" align="center" bgcolor="{{t12_badge_fill}}" style="background-color:{{t12_badge_fill}};border-radius:999px;padding:4px 18px;text-align:center;vertical-align:middle;white-space:nowrap;mso-line-height-rule:exactly;">
<span style="display:block;font-size:9px;font-weight:700;color:{{t12_role_pill_text}};line-height:14px;text-align:center;mso-line-height-rule:exactly;">{{title}}</span>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
<td width="130" valign="top" style="width:130px;max-width:130px;vertical-align:top;padding:38px 0 0 4px;">
{{#if phone}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td valign="top" style="padding:0 4px 0 0;vertical-align:top;font-size:11px;font-weight:700;line-height:14px;color:{{t12_contact_label}};mso-line-height-rule:exactly;">P</td>
<td valign="top" style="vertical-align:top;font-size:11px;font-weight:300;line-height:14px;color:{{t12_contact_muted}};mso-line-height-rule:exactly;">{{phone}}</td>
</tr></table>{{/if}}
{{#if email}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:6px;"><tr>
<td valign="top" style="padding:0 4px 0 0;vertical-align:top;font-size:11px;font-weight:700;line-height:14px;color:{{t12_contact_label}};mso-line-height-rule:exactly;">E</td>
<td valign="top" style="vertical-align:top;font-size:11px;font-weight:300;line-height:14px;color:{{t12_contact_muted}};mso-line-height-rule:exactly;">{{#if has_mailto}}<a href="{{{t3_mailto_href}}}" style="color:{{t12_contact_muted}};text-decoration:none;">{{email}}</a>{{else}}{{email}}{{/if}}</td>
</tr></table>{{/if}}
{{#if has_address}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:6px;"><tr>
<td valign="top" style="padding:0 4px 0 0;vertical-align:top;font-size:11px;font-weight:700;line-height:14px;color:{{t12_contact_label}};mso-line-height-rule:exactly;">A</td>
<td valign="top" style="vertical-align:top;font-size:11px;font-weight:300;line-height:14px;color:{{t12_contact_muted}};mso-line-height-rule:exactly;">{{address_line1}}{{#if address_line2}}<br>{{address_line2}}{{/if}}{{#if address_line3}}<br>{{address_line3}}{{/if}}</td>
</tr></table>{{/if}}
<div style="padding-top:18px;line-height:0;font-size:0;text-align:left;"><img src="{{{t12_x_uri}}}" width="7" height="6" alt="" style="display:block;width:7px;height:6px;border:0;"></div>
</td>
<td width="150" valign="top" align="right" style="width:150px;max-width:150px;vertical-align:top;padding:17px 8px 0 0;text-align:right;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin:0 0 0 auto;">
<tr>
<td valign="top" style="padding:0;line-height:0;vertical-align:top;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="112" height="120" style="width:112px;height:120px;border-collapse:collapse;">
<tr>
<td width="112" height="120" valign="bottom" align="center" background="{{{t12_photo_rail_uri}}}" bgcolor="{{t12_card_bg}}" style="width:112px;height:120px;vertical-align:bottom;text-align:center;background-color:{{t12_card_bg}};background-image:url({{{t12_photo_rail_uri}}});background-repeat:no-repeat;background-position:center;background-size:112px 120px;mso-line-height-rule:exactly;">
{{#if photo_url}}<img src="{{{photo_url}}}" width="112" height="120" alt="" style="display:block;width:112px;height:120px;border:0;object-fit:contain;object-position:center bottom;background-color:transparent;">{{else}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="112" height="120" style="width:112px;height:120px;border-collapse:collapse;"><tr><td width="112" height="120" align="center" valign="middle" bgcolor="{{t12_photo_placeholder_bg}}" style="width:112px;height:120px;background-color:{{t12_photo_placeholder_bg}};font-size:22px;font-weight:700;color:{{t12_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}
</td>
</tr>
</table>
</td>
<td valign="top" style="padding:8px 0 0 12px;line-height:0;vertical-align:top;"><img src="{{{t12_squiggle_uri}}}" width="17" height="76" alt="" style="display:block;width:17px;height:76px;border:0;"></td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
