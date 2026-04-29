/**
 * Layout 15 — reference: chartreuse field (#D4FF1F); top-left white tab (logo + company);
 * “Hello, I’m” + two-line caps name + white pill job CTA with black border; circular photo
 * overlapping a large rounded white card; Address / Contact as slash-separated grey lines.
 * One outer row so the photo + card `valign="middle"` centers against tab + text column.
 * 600px wide.
 */
const T15_FONT =
  "'Montserrat','Poppins','Inter',system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
/** Photo overlaps the card; half-disc sits on lime. */
const T15_PHOTO_NEG = '52px';
const T15_HERO_W = '248';
const T15_RIGHT_W = '352';

export const TEMPLATE_15_MARKUP = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:${T15_FONT};border:0;">
<tr>
<td width="${T15_HERO_W}" valign="top" bgcolor="{{t15_lime}}" style="width:${T15_HERO_W}px;max-width:${T15_HERO_W}px;vertical-align:top;background-color:{{t15_lime}};padding:0 8px 0 0;border:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:${T15_HERO_W}px;border-collapse:collapse;table-layout:fixed;">
<tr><td style="padding:0 0 0 0;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="{{t15_card}}" style="border-collapse:collapse;background-color:{{t15_card}};border-radius:0 0 20px 0;-webkit-border-radius:0 0 20px 0;"><tr>
<td align="left" style="padding:8px 18px 8px 14px;vertical-align:middle;line-height:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
<td valign="middle" style="padding:0 10px 0 0;vertical-align:middle;line-height:0;">
{{#if show_logo}}{{#if logo_url}}<img src="{{{logo_url}}}" alt="" width="44" height="44" style="display:block;width:44px;height:44px;max-width:44px;max-height:44px;border:0;object-fit:contain;">{{else}}<img src="{{{t15_tab_icon}}}" width="56" height="30" alt="" style="display:block;width:56px;height:30px;border:0;">{{/if}}{{else}}<span style="display:inline-block;width:8px;height:30px;font-size:0;line-height:0;">&nbsp;</span>{{/if}}
</td>
{{#if t15_show_company_in_tab}}<td valign="middle" style="padding:0;vertical-align:middle;font-size:11px;font-weight:600;line-height:1.25;color:{{t15_ink}};mso-line-height-rule:exactly;">{{company_name}}</td>{{/if}}
</tr></table>
</td></tr></table>
</td></tr>
<tr><td style="padding:10px 18px 14px 14px;vertical-align:top;background-color:{{t15_lime}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;table-layout:fixed;">
<tr><td style="padding:0 0 6px 0;font-size:14px;font-weight:500;line-height:1.2;color:{{t15_ink}};mso-line-height-rule:exactly;">Hello, I&#8217;m</td></tr>
<tr><td style="padding:0 0 10px 0;font-size:30px;font-weight:800;line-height:1.02;color:{{t15_ink}};letter-spacing:0.02em;mso-line-height-rule:exactly;white-space:normal;">{{t15_name_line1_upper}}{{#if t15_has_name_line2}}<br>{{t15_name_line2_upper}}{{/if}}</td></tr>
{{#if title}}<tr><td style="padding:0;line-height:0;font-size:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="{{t15_card}}" style="border-collapse:collapse;border:1px solid {{t15_ink}};border-radius:999px;-webkit-border-radius:999px;background-color:{{t15_card}};"><tr><td style="padding:7px 18px 8px 18px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:{{t15_ink}};mso-line-height-rule:exactly;line-height:1.2;background-color:{{t15_card}};">{{{t15_job_pill_text}}} &gt;</td></tr></table>
</td></tr>{{/if}}
</table>
</td></tr>
</table>
</td>
<td width="${T15_RIGHT_W}" valign="middle" align="center" bgcolor="{{t15_lime}}" style="width:${T15_RIGHT_W}px;max-width:${T15_RIGHT_W}px;vertical-align:middle;text-align:center;background-color:{{t15_lime}};padding:4px 10px 4px 6px;border:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="336" align="center" style="width:336px;max-width:100%;border-collapse:collapse;margin:0 auto;">
<tr>
<td width="108" valign="middle" align="right" style="width:108px;max-width:108px;vertical-align:middle;padding:0;line-height:0;font-size:0;">
{{#if photo_url}}<img src="{{{photo_url}}}" alt="" width="96" height="96" style="display:block;width:96px;height:96px;border-radius:50%;-webkit-border-radius:50%;border:2px solid {{t15_ink}};object-fit:cover;margin:0;margin-right:-${T15_PHOTO_NEG};position:relative;z-index:2;">{{else}}{{#if show_photo}}<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;margin:0;margin-right:-${T15_PHOTO_NEG};position:relative;z-index:2;"><tr><td width="96" height="96" align="center" valign="middle" bgcolor="{{t15_photo_placeholder_bg}}" style="width:96px;height:96px;border-radius:50%;-webkit-border-radius:50%;border:2px solid {{t15_ink}};background-color:{{t15_photo_placeholder_bg}};font-size:22px;font-weight:800;color:{{t15_photo_placeholder_color}};mso-line-height-rule:exactly;">{{name_initials}}</td></tr></table>{{/if}}{{/if}}
</td>
<td valign="middle" style="vertical-align:middle;padding:0;border:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="{{t15_card}}" style="width:100%;border-collapse:collapse;background-color:{{t15_card}};border-radius:28px 28px 28px 28px;-webkit-border-radius:28px;overflow:hidden;mso-line-height-rule:exactly;">
<tr>
<td valign="middle" style="vertical-align:middle;padding:14px 20px 14px 46px;border:0;background-color:{{t15_card}};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
{{#if has_address}}<tr><td style="padding:0 0 10px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td style="padding:0 0 5px 0;font-size:12px;font-weight:800;line-height:1.2;color:{{t15_ink}};mso-line-height-rule:exactly;">Address</td></tr>
<tr><td style="padding:0;font-size:10px;font-weight:500;line-height:1.5;color:{{t15_muted}};mso-line-height-rule:exactly;">{{{t15_address_body_html}}}</td></tr></table>
</td></tr>{{/if}}
{{#if t15_has_contact_body}}<tr><td style="padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td style="padding:0 0 5px 0;font-size:12px;font-weight:800;line-height:1.2;color:{{t15_ink}};mso-line-height-rule:exactly;">Contact</td></tr>
<tr><td style="padding:0;font-size:10px;font-weight:500;line-height:1.5;color:{{t15_muted}};mso-line-height-rule:exactly;">{{{t15_contact_body_html}}}</td></tr></table>
</td></tr>{{/if}}
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>`;
