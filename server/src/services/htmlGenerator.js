import Handlebars from 'handlebars';
import juice from 'juice';
import { minify } from 'html-minifier-terser';
import {
  bundleRailPxForEngineSlug,
  uuidToTemplateSlug,
  isBlankImageBannerPreset,
} from '../lib/templateIds.js';
import { resolveTemplateKey, TEMPLATE_META, getTemplateHtml } from '../templates/signatureTemplates.js';
import { BANNER_TEMPLATES, resolveBannerKey } from '../templates/bannerTemplates.js';
import {
  EXPLORE_WORLD_B7_CENTER_ACCENT_SVG,
  EXPLORE_WORLD_B7_RAIL_DECOR_SVG,
  EXPLORE_WORLD_TRAVELER_SVG,
} from '../templates/exploreWorldBannerAssets.js';
import { BOOST_LOGO_LEAF_SVG, BOOST_WELLNESS_SCENE_SVG } from '../templates/boostImproveBannerAssets.js';
import { T18_BORDER_TOP, T18_BORDER_RIGHT } from '../templates/template18Assets.js';
import { T18_CARD_HEIGHT_PX } from '../templates/template18Html.js';
import { T19_CARD_HEIGHT_PX, T19_CARD_WIDTH_PX } from '../templates/template19Html.js';
import { T20_CARD_HEIGHT_PX, T20_CARD_WIDTH_PX } from '../templates/template20Html.js';
import {
  splitSignaturePreviewSlots,
  intersperseBrBetweenBannerPartTables,
} from '../lib/splitSignaturePreviewSlots.js';

/** Rich layouts embed multiple SVG data-URIs — keep headroom so output is never sliced mid-signature. */
const MAX_OUTPUT_BYTES = 48 * 1024;

/** Layout 2 & 4 + banner bundle width (px) — matches narrow templates and editor preview rail. */
export const SIG_LAYOUT_RAIL_PX = 470;

/**
 * Narrower footprint for Gmail/Outlook paste only. Editor preview uses full-size HTML.
 * Scales presentation max-widths (signature shell + nested tables, banners).
 */
export function applyPasteFootprint(html, clipMaxPx = SIG_LAYOUT_RAIL_PX) {
  const s = String(html || '');
  const clipMax = clipMaxPx;
  return s.replace(/max-width:\s*(\d+)px/gi, (_, w) => {
    const n = Number(w);
    if (!Number.isFinite(n) || n < 200) return `max-width:${w}px`;
    if (n <= clipMax) return `max-width:${n}px`;
    const scaled = Math.min(clipMax, Math.max(260, Math.round(n * 0.8)));
    return `max-width:${scaled}px`;
  });
}

function styleReplaceWidth100(style) {
  return style
    .replace(/(^|;)\s*width:\s*100%\s*(?=;|$)/gi, '$1width:auto')
    .replace(/;\s*;/g, ';')
    .replace(/^;\s*|\s*;$/g, '');
}

function styleHasOwnWidthDeclaration(style) {
  return /(^|;)\s*width\s*:/i.test(style);
}

/**
 * Gmail/Outlook stretch `width:100%` on outer shell tables to the full compose width, so a white
 * `background-color:#ffffff` card looks like a huge margin around the real design. Shrink-wrap
 * presentation tables and full-width signature-link wrappers so paste is only as wide as the layout.
 */
export function collapseSignatureShellWidth(html) {
  let s = String(html || '').trim();
  s = s.replace(/<table\b([^>]*)>/gi, (full, attrs) => {
    if (!/\brole\s*=\s*["']presentation["']/i.test(attrs)) return full;
    const sm = attrs.match(/\bstyle\s*=\s*"([^"]*)"/i);
    if (!sm) return full;
    let style = sm[1];
    if (/(^|;)\s*width:\s*100%\s*(?=;|$)/i.test(style)) {
      style = styleReplaceWidth100(style);
    }
    const newAttrs = attrs.replace(/\bstyle\s*=\s*"[^"]*"/i, `style="${style}"`);
    return `<table${newAttrs}>`;
  });
  let outerDone = false;
  s = s.replace(/<table\b([^>]*)>/i, (full, attrs) => {
    if (outerDone) return full;
    if (!/\brole\s*=\s*["']presentation["']/i.test(attrs)) return full;
    const sm = attrs.match(/\bstyle\s*=\s*"([^"]*)"/i);
    if (!sm) return full;
    outerDone = true;
    const style = sm[1];
    if (styleHasOwnWidthDeclaration(style)) return full;
    const merged = `${style};width:auto`.replace(/;;+/g, ';');
    const newAttrs = attrs.replace(/\bstyle\s*=\s*"[^"]*"/i, `style="${merged}"`);
    return `<table${newAttrs}>`;
  });
  s = s.replace(/\bdisplay\s*:\s*block\s*;\s*width\s*:\s*100%\s*;/gi, 'display:block;width:auto;max-width:100%;');
  return s;
}

/** Log quality issues for email-client-safe HTML (does not mutate output). */
export function validateHTML(html) {
  if (typeof html !== 'string') return html;
  const issues = [];
  if (html.includes('<style')) issues.push('WARNING: <style> block found — Gmail will strip it');
  if (/<script/i.test(html)) issues.push('WARNING: <script> tag in output');
  if (/javascript:/i.test(html)) issues.push('WARNING: javascript: URL in output');
  if (/src\s*=\s*["']\/(?!\/)/i.test(html)) {
    issues.push('WARNING: relative image URL found');
  }
  const bytes = Buffer.byteLength(html, 'utf8');
  if (bytes > 48 * 1024) issues.push('WARNING: HTML exceeds 48KB');
  if (issues.length) console.warn('HTML Generation Issues:', issues);
  return html;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Reject URLs whose hostname decodes to spaces or other prose (e.g. `https://Projecting%20your%20brand…`
 * still parses in some engines and triggers spurious GET / DNS errors in preview iframes).
 */
function httpUrlStringIsPlausible(uStr) {
  try {
    const u = new URL(String(uStr || '').trim());
    let host = u.hostname;
    try {
      host = decodeURIComponent(host.replace(/\+/g, ' '));
    } catch {
      return false;
    }
    if (/[\s\r\n\t\u00a0<>"'`]/.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export function ensureHttps(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) {
    return httpUrlStringIsPlausible(t) ? t : '';
  }
  /** Do not prefix `https://` onto prose (e.g. webinar subline pasted into “link”); browsers then DNS-resolve a fake host. */
  if (/[\s\n\r\t]/.test(t)) return '';
  const prefixed = `https://${t}`;
  return httpUrlStringIsPlausible(prefixed) ? prefixed : '';
}

/** Root for resolving `/path` asset URLs in email HTML (images, links). */
function publicAssetBaseFromEnv() {
  const raw =
    process.env.SIGNATURE_PUBLIC_ASSET_BASE?.trim() ||
    process.env.PUBLIC_BASE_URL?.trim() ||
    '';
  return raw.replace(/\/$/, '');
}

/**
 * Prefix root-relative src/href with a public origin so clients like Gmail can fetch assets.
 */
export function resolveRelativeAssetUrls(html, baseUrl) {
  const h = String(html || '');
  const base = String(baseUrl || '').replace(/\/$/, '');
  if (!h || !base) return h;
  return h.replace(/\s(src|href)=(["'])\/(?!\/)([^"'>\s]+)\2/gi, (_m, attr, q, p) => {
    return ` ${attr}=${q}${base}/${p}${q}`;
  });
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** WCAG-style relative luminance (0–1). */
function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/**
 * Template_1 prints the name on white using the primary swatch; very light primaries disappear.
 * Fall back to palette text (if dark) or slate.
 */
function primaryOnWhite(primaryHex, textCandidate) {
  const primary = String(primaryHex || '#1e3a5f').trim();
  if (relativeLuminance(primary) <= 0.62) return primary;
  const text = String(textCandidate || '').trim();
  if (text && relativeLuminance(text) <= 0.55) return text;
  return '#0f172a';
}

/** Darkest candidate suitable for body text on a light background (name, headings on card). */
function pickDarkestReadable(candidates, maxLum = 0.5) {
  let best = '#0f172a';
  let bestL = 1;
  for (const raw of candidates) {
    const c = String(raw || '').trim();
    if (!c) continue;
    const L = relativeLuminance(c);
    if (L <= maxLum && L < bestL) {
      bestL = L;
      best = c;
    }
  }
  if (bestL < 1) return best;
  return '#0f172a';
}

function mixHexWithWhite(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#f1f5f9';
  const r = Math.round(base[0] * (1 - t) + 255 * t);
  const g = Math.round(base[1] * (1 - t) + 255 * t);
  const b = Math.round(base[2] * (1 - t) + 255 * t);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function mixHexWithBlack(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#0f172a';
  const r = Math.round(base[0] * (1 - t));
  const g = Math.round(base[1] * (1 - t));
  const b = Math.round(base[2] * (1 - t));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/** Blend two hex colors; `t` toward `hexB` (0 = A only, 1 = B only). */
function mixHexPair(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a && !b) return '#e5e7eb';
  if (!a) return String(hexB || '#e5e7eb').trim();
  if (!b) return String(hexA || '#e5e7eb').trim();
  const u = Math.max(0, Math.min(1, Number(t) || 0));
  const r = Math.round(a[0] * (1 - u) + b[0] * u);
  const g = Math.round(a[1] * (1 - u) + b[1] * u);
  const bl = Math.round(a[2] * (1 - u) + b[2] * u);
  return `#${[r, g, bl].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/** Photo disc behind headshot — prefer palette accent when it reads as a light wash. */
function photoRingBackground(accentHex) {
  const c = String(accentHex || '#e4e6ef').trim();
  if (relativeLuminance(c) > 0.72) return c;
  return mixHexWithWhite(c, 0.52);
}

/** Main card fill: use palette “text” swatch when it is a light surface (e.g. white / off-white). */
function signatureCardSurface(textHex) {
  const c = String(textHex || '#ffffff').trim();
  if (relativeLuminance(c) >= 0.88) return c;
  return '#ffffff';
}

function bannerHeadlineOnDark(c4) {
  const c = String(c4 || '').trim();
  if (c && relativeLuminance(c) > 0.82) return c;
  return '#ffffff';
}

function bannerSublineOnDark(c3) {
  const c = String(c3 || '').trim();
  const L3 = relativeLuminance(c);
  if (!c) return mixHexWithWhite('#ffffff', 0.14);
  if (L3 > 0.62) return mixHexWithWhite(c, 0.08);
  return mixHexWithWhite(c, 0.38);
}

function bannerCtaOnDark(c1, c2, c3, c4) {
  const L3 = relativeLuminance(c3);
  if (L3 > 0.42 && L3 < 0.94) {
    return {
      bg: String(c3).trim(),
      text: primaryOnWhite(c3, pickDarkestReadable([c1, c2, c4], 0.45)),
    };
  }
  const L4 = relativeLuminance(c4);
  if (L4 > 0.82) {
    return {
      bg: String(c4).trim(),
      text: primaryOnWhite(c4, pickDarkestReadable([c1, c2], 0.48)),
    };
  }
  return {
    bg: '#ffffff',
    text: primaryOnWhite(c1, pickDarkestReadable([c2, c4], 0.48)),
  };
}

/**
 * Webinar / CTA banner 1 — light card + organic blobs (palette primary/accent/text); see `bannerTemplates.js` banner_1.
 */
function webinarBannerStyleVars(color1, color2, color3, color4, railPx = 470) {
  const c1 = String(color1 || '#e8630a').trim();
  const c2 = String(color2 || c1).trim();
  const c3 = String(color3 || '#94a3b8').trim();
  const c4 = String(color4 || '#0f172a').trim();
  const rail = Math.max(320, Math.min(720, Number(railPx) || 470));
  const surface = mixHexPair(mixHexWithWhite(c4, 0.97), mixHexWithWhite(c3, 0.82), 0.58);
  const blobPeach = mixHexPair(mixHexWithWhite(c1, 0.38), mixHexWithWhite(c3, 0.5), 0.55);
  const blobOrange = c1;
  const headline = pickDarkestReadable([c4, mixHexWithBlack(c1, 0.04)], 0.48);
  const subline = companyMutedColor(c4, c2);
  const blobSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="140" viewBox="0 0 560 140" fill="none">` +
    `<path d="M 320 -10 C 310 10, 270 5, 275 35 C 280 60, 320 55, 315 80 C 308 110, 270 105, 280 125 C 290 145, 340 135, 360 110 C 380 85, 360 70, 375 50 C 392 28, 420 35, 415 10 C 410 -10, 330 -30, 320 -10 Z" fill="${blobPeach}" opacity="0.6"/>` +
    `<path d="M 355 -20 C 340 5, 360 30, 390 25 C 420 20, 445 -5, 460 20 C 475 45, 450 70, 420 75 C 395 80, 375 65, 370 85 C 364 108, 390 125, 420 120 C 455 114, 480 90, 500 65 C 520 40, 510 5, 490 -15 C 468 -38, 375 -48, 355 -20 Z" fill="${blobOrange}" opacity="0.95"/>` +
    `</svg>`;
  const blobsH = Math.max(84, Math.round((rail * 140) / 560));
  return {
    banner_surface_bg: surface,
    banner_brand_color: c1,
    banner_headline_color: headline,
    banner_subline_color: subline,
    banner_cta_border: headline,
    banner_cta_text: headline,
    banner_b1_blobs_uri: svgDataUri(blobSvg),
    banner_b1_blobs_h: String(blobsH),
  };
}

/**
 * When `apply_brand_palette_to_cta_banners` is not true on the Handlebars context, palette-tinted
 * CTA strips use these stops so thumbnails and previews match each template’s “original” art
 * instead of inheriting the signature layout colors. Choosing a palette in the editor sets the flag.
 */
function ctaBannerTintStops(context, variant) {
  const useBrand = context.apply_brand_palette_to_cta_banners === true;
  if (useBrand) {
    return [context.color_1, context.color_2, context.color_3, context.color_4];
  }
  if (variant === 'webinar') {
    return ['#e8630a', '#e8630a', '#94a3b8', '#0f172a'];
  }
  if (variant === 'bookCall') {
    return ['#4d8a6a', '#2f5c45', '#b8e8d0', '#0f172a'];
  }
  if (variant === 'needCall') {
    return ['#1e3a5f', '#2d6a9f', '#94a3b8', '#0f172a'];
  }
  return [context.color_1, context.color_2, context.color_3, context.color_4];
}

/**
 * Book-a-call banner (banner_2) — soft horizontal wash from palette primary / accent / secondary.
 */
function bookCallBannerStyleVars(color1, color2, color3, color4) {
  const c1 = String(color1 || '#1e3a5f').trim();
  const c2 = String(color2 || c1).trim();
  const c3 = String(color3 || '#94a3b8').trim();
  const c4 = String(color4 || '#0f172a').trim();
  const gradStart = mixHexPair(mixHexWithWhite(c1, 0.28), mixHexWithWhite(c3, 0.2), 0.55);
  const gradEnd = mixHexPair(c1, c2, 0.42);
  const titleColor = pickDarkestReadable([c4, mixHexWithBlack(c1, 0.18), mixHexWithBlack(c2, 0.12)], 0.5);
  const arrowColor = pickDarkestReadable([mixHexWithBlack(c2, 0.1), c4, c1], 0.48);
  return {
    banner_b2_grad_start: gradStart,
    banner_b2_grad_end: gradEnd,
    banner_b2_title_color: titleColor,
    banner_b2_arrow_color: arrowColor,
  };
}

/**
 * Need-a-call strip (banner_4) — bar uses `color_1`; label + pill CTA follow palette contrast rules.
 */
function needCallBannerStyleVars(color1, color2, _color3, color4) {
  const c1 = String(color1 || '#1e3a5f').trim();
  const c2 = String(color2 || c1).trim();
  const c4 = String(color4 || '#0f172a').trim();
  const barL = relativeLuminance(c1);
  const leftText = barL < 0.42 ? '#ffffff' : pickDarkestReadable([c4, mixHexWithBlack(c1, 0.22)], 0.5);
  let btnBg = c2;
  if (relativeLuminance(btnBg) > 0.58) {
    btnBg = mixHexPair(c1, c2, 0.55);
  }
  if (relativeLuminance(btnBg) > 0.58) {
    btnBg = mixHexWithBlack(c1, 0.08);
  }
  if (relativeLuminance(btnBg) > 0.62) {
    btnBg = pickDarkestReadable([c2, c1, mixHexWithBlack(c1, 0.05)], 0.44);
  }
  const btnL = relativeLuminance(btnBg);
  const btnText =
    btnL < 0.52 ? '#ffffff' : pickDarkestReadable([c4, mixHexWithBlack(c1, 0.12)], 0.5);
  const btnBorder = mixHexWithWhite(btnBg, btnL < 0.45 ? 0.32 : 0.22);
  return {
    banner_4_left_text: leftText,
    banner_4_btn_bg: btnBg,
    banner_4_btn_text: btnText,
    banner_4_btn_border: btnBorder,
  };
}

/** Inline SVG contact icons (stroke color) for email-safe data URIs. */
function contactStrokeIconDataUris(strokeHex) {
  const stroke = String(strokeHex || '#334155').trim();
  const mail = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  /** Heroicons-style handset — clearer at small sizes than the old path. */
  const phone = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
  const globe = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`;
  const pin = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  return {
    mail: `data:image/svg+xml,${encodeURIComponent(mail)}`,
    phone: `data:image/svg+xml,${encodeURIComponent(phone)}`,
    globe: `data:image/svg+xml,${encodeURIComponent(globe)}`,
    pin: `data:image/svg+xml,${encodeURIComponent(pin)}`,
  };
}

/** Layout 2 contact column — smaller display size; thinner strokes read better at ~14px. */
function contactStrokeIconDataUrisCompact(strokeHex) {
  const stroke = String(strokeHex || '#334155').trim();
  const sw = '1.65';
  const mail = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const phone = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>`;
  const globe = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`;
  const pin = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  return {
    mail: `data:image/svg+xml,${encodeURIComponent(mail)}`,
    phone: `data:image/svg+xml,${encodeURIComponent(phone)}`,
    globe: `data:image/svg+xml,${encodeURIComponent(globe)}`,
    pin: `data:image/svg+xml,${encodeURIComponent(pin)}`,
  };
}

function pickContactRowIconStroke(primary, secondary) {
  const candidates = [secondary, primary, '#475569'];
  for (const c of candidates) {
    const s = String(c || '').trim();
    if (!s) continue;
    const L = relativeLuminance(s);
    if (L >= 0.12 && L <= 0.55) return s;
  }
  return '#475569';
}

function companyMutedColor(textHex, secondaryHex) {
  const t = String(textHex || '').trim();
  if (t && relativeLuminance(t) >= 0.18 && relativeLuminance(t) <= 0.55) return t;
  const s = String(secondaryHex || '').trim();
  if (s && relativeLuminance(s) >= 0.25 && relativeLuminance(s) <= 0.6) return mixHexWithWhite(s, 0.35);
  return '#6b7280';
}

/** Layout 2 — title + contact lines: medium grey (~#888) when palette text is too dark for body copy. */
function template2BodyText(textHex) {
  const t = String(textHex || '').trim();
  if (!t) return '#888888';
  const L = relativeLuminance(t);
  if (L >= 0.28 && L <= 0.72) return t;
  return '#888888';
}

function buildGeoDecoDataUri(c1, c2, c3) {
  const a = String(c1 || '#15803d').trim();
  const b = String(c2 || '#22c55e').trim();
  const c = String(c3 || '#4ade80').trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="#ffffff"/><polygon points="120,0 300,0 300,240 40,240" fill="${a}"/><polygon points="200,0 300,0 300,160 90,160" fill="${b}"/><polygon points="260,20 300,20 300,100 180,100" fill="${c}" opacity="0.85"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Solid fill for title bars that use white text — pick a sufficiently dark swatch. */
function headerBarBackground(primary, secondary) {
  const order = [secondary, primary, '#1e293b'];
  for (const raw of order) {
    const c = String(raw || '').trim();
    if (c && relativeLuminance(c) <= 0.42) return c;
  }
  return '#1e293b';
}

function buildFloralDecoDataUri(primary, secondary, accent) {
  const dot = String(primary || '#6366f1').trim();
  const base = String(accent || '#ede9fe').trim();
  const ell1 = String(secondary || '#86efac').trim();
  const ell2 = mixHexWithWhite(primary, 0.45);
  const ell3 = mixHexWithWhite(secondary || primary, 0.5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="260" viewBox="0 0 220 260"><defs><pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.3" fill="${dot}" opacity="0.4"/></pattern></defs><rect width="220" height="260" fill="${base}"/><rect x="95" y="0" width="125" height="110" fill="url(#g)"/><ellipse cx="115" cy="210" rx="62" ry="38" fill="${ell1}" opacity="0.55"/><ellipse cx="165" cy="195" rx="48" ry="32" fill="${ell2}" opacity="0.4"/><ellipse cx="140" cy="225" rx="35" ry="22" fill="${ell3}" opacity="0.35"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function svgDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Layout 4 — each palette stop is visible: 4-stop field gradient + 4 tinted shapes (p1–p4),
 * name/title/company from different mixes, phone/email/web lines + icons each tied to a swatch.
 */
function template4StrokeOnDark(swatchesHex) {
  let s = mixHexWithWhite(String(swatchesHex || '#94a3b8').trim(), 0.42);
  if (relativeLuminance(s) < 0.56) s = mixHexWithWhite(s, 0.28);
  if (relativeLuminance(s) > 0.9) s = mixHexWithBlack(s, 0.08);
  return s;
}

function buildTemplate4PaletteContext(c1, c2, c3, c4) {
  const p1 = String(c1 || '#1e3a5f').trim();
  const p2 = String(c2 || p1).trim();
  const p3 = String(c3 || p2).trim();
  const p4 = String(c4 || '#0f172a').trim();

  const g0 = mixHexWithBlack(p1, 0.2);
  const g1 = mixHexWithBlack(mixHexPair(p1, p2, 0.52), 0.22);
  const g2 = mixHexWithBlack(mixHexPair(p2, p3, 0.55), 0.28);
  const g3 = mixHexWithBlack(mixHexPair(p3, p4, 0.48), 0.4);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="470" height="260" viewBox="0 0 470 260"><defs><linearGradient id="t4bg" x1="0%" y1="8%" x2="100%" y2="92%"><stop offset="0%" stop-color="${g0}"/><stop offset="33%" stop-color="${g1}"/><stop offset="66%" stop-color="${g2}"/><stop offset="100%" stop-color="${g3}"/></linearGradient></defs><rect width="470" height="260" fill="url(#t4bg)"/><circle cx="72" cy="48" r="78" fill="${p1}" opacity="0.2"/><circle cx="402" cy="70" r="104" fill="${p2}" opacity="0.26"/><circle cx="438" cy="198" r="124" fill="${p3}" opacity="0.2"/><ellipse cx="320" cy="200" rx="88" ry="56" fill="${p4}" opacity="0.14"/></svg>`;

  const ic1 = contactStrokeIconDataUrisCompact(template4StrokeOnDark(p1));
  const ic2 = contactStrokeIconDataUrisCompact(template4StrokeOnDark(p2));
  const ic3 = contactStrokeIconDataUrisCompact(template4StrokeOnDark(p3));

  const nameOnDark = mixHexPair('#f8fafc', p1, 0.32);
  const titleOnDark = mixHexPair('#eef2f7', p3, 0.38);
  const companyOnDark = mixHexPair('#f3f4f6', mixHexPair(p2, p4, 0.45), 0.28);

  const phoneLine = mixHexPair('#e2e8f0', p1, 0.44);
  const emailLine = mixHexPair('#e2e8f0', p2, 0.44);
  const webLine = mixHexPair('#e2e8f0', p3, 0.44);
  const linkEmail = mixHexPair(phoneLine, p2, 0.22);
  const linkWeb = mixHexPair(webLine, p3, 0.2);

  return {
    t4_bg_solid: g0,
    t4_card_bg: svgDataUri(svg),
    t4_name_color: relativeLuminance(nameOnDark) < 0.45 ? mixHexWithWhite(nameOnDark, 0.35) : nameOnDark,
    t4_title_color: relativeLuminance(titleOnDark) < 0.42 ? mixHexWithWhite(titleOnDark, 0.3) : titleOnDark,
    t4_company_color: relativeLuminance(companyOnDark) < 0.45 ? mixHexWithWhite(companyOnDark, 0.32) : companyOnDark,
    t4_phone_color: phoneLine,
    t4_email_color: emailLine,
    t4_web_color: webLine,
    t4_link_email: linkEmail,
    t4_link_web: linkWeb,
    t4_icon_phone: ic1.phone,
    t4_icon_email: ic2.mail,
    t4_icon_globe: ic3.globe,
  };
}

/**
 * Layout 5 — light card: left/right palette art, typography + contact colors (no stripe/social SVGs).
 */
function buildTemplate5PaletteContext(c1, c2, c3, c4) {
  const p1 = String(c1 || '#56c9a8').trim();
  const p2 = String(c2 || p1).trim();
  const p3 = String(c3 || p2).trim();
  const p4 = String(c4 || '#252525').trim();
  const shell = mixHexWithWhite(p4, 0.96);
  const leftArt = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="280" viewBox="0 0 180 280"><rect width="180" height="280" fill="${shell}"/><path d="M-5,22 C40,4 82,52 65,118 C48,188 -8,224 -5,280 L-5,0 Z" fill="${p2}" opacity="0.16"/><path d="M0,128 Q48,102 86,158 T48,280" fill="none" stroke="${p1}" stroke-width="24" stroke-linecap="round" opacity="0.22"/><ellipse cx="94" cy="212" rx="80" ry="62" fill="${p1}" opacity="0.14"/></svg>`;
  const rightArt = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260" viewBox="0 0 200 260"><rect width="200" height="260" fill="none"/><ellipse cx="168" cy="44" rx="92" ry="78" fill="${p1}" opacity="0.12"/><ellipse cx="186" cy="198" rx="76" ry="62" fill="${p3}" opacity="0.1"/></svg>`;
  return {
    t5_shell_bg: shell,
    t5_deco_left: svgDataUri(leftArt),
    t5_deco_right: svgDataUri(rightArt),
    t5_photo_ring: mixHexPair(shell, p1, 0.28),
    t5_name_first_color: pickDarkestReadable([p4, mixHexWithBlack(p4, 0.02)], 0.52),
    t5_name_last_color: primaryOnWhite(p1, p4),
    t5_job_color: mixHexPair('#373737', p4, 0.38),
    t5_contact_color: mixHexPair('#464646', p4, 0.42),
    t5_link_color: mixHexPair(p1, p2, 0.42),
  };
}

/** Strip scheme for compact URL lines (Layout 6 contact row). */
function displayUrlWithoutScheme(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  let x = u.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  return x.length > 44 ? `${x.slice(0, 41)}…` : x;
}

/**
 * Layout 6 — real-estate style card: navy strip + palette SVG arcs, large photo, serif name,
 * 2×2 contacts (palette-driven; no external art URLs).
 */
function buildTemplate6PaletteContext(c1, c2, c3, c4) {
  const p1 = String(c1 || '#f51b37').trim();
  const p2 = String(c2 || p1).trim();
  const p3 = String(c3 || p2).trim();
  const p4 = String(c4 || '#0e1327').trim();
  const shell = mixHexPair('#0e1327', p4, 0.55);
  const strip = mixHexWithBlack(mixHexPair(p1, p4, 0.38), 0.18);
  const leftBase = mixHexWithWhite(p2, 0.94);
  const leftArt = `<svg xmlns="http://www.w3.org/2000/svg" width="216" height="280" viewBox="0 0 216 280"><rect width="216" height="280" fill="#ffffff"/><path d="M-6,36 C58,4 128,72 96,168 C72,238 8,272 0,280 L0,0 Z" fill="${leftBase}" opacity="0.98"/><path d="M0,150 Q78,118 148,182 T96,280" fill="none" stroke="${p1}" stroke-width="20" stroke-linecap="round" opacity="0.5"/><ellipse cx="108" cy="224" rx="82" ry="62" fill="${p1}" opacity="0.14"/></svg>`;
  const rightArt = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="280" viewBox="0 0 360 280"><rect width="360" height="280" fill="none"/><path d="M360,0 L360,280 L228,280 Q268,168 312,88 Q340,36 360,0 Z" fill="${mixHexWithBlack(p4, 0.22)}" opacity="0.42"/><path d="M320,24 Q382,96 340,220" fill="none" stroke="${p1}" stroke-width="22" stroke-linecap="round" opacity="0.45"/><ellipse cx="300" cy="200" rx="96" ry="72" fill="${p3}" opacity="0.12"/></svg>`;
  const sparkFill = mixHexPair(p3, p1, 0.35);
  const sparkSm = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12,2 L22,12 L12,22 L2,12 Z" fill="${sparkFill}" opacity="0.92"/></svg>`;
  const sparkLg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16,3 L29,16 L16,29 L3,16 Z" fill="${sparkFill}" opacity="0.88"/></svg>`;
  const contactStroke = pickDarkestReadable([mixHexPair('#232231', p4, 0.35), '#232231'], 0.48);
  const icons = contactStrokeIconDataUrisCompact(contactStroke);

  return {
    t6_shell_bg: shell,
    t6_strip_bg: strip,
    t6_left_deco: svgDataUri(leftArt),
    t6_right_deco: svgDataUri(rightArt),
    t6_sparkle_sm: svgDataUri(sparkSm),
    t6_sparkle_lg: svgDataUri(sparkLg),
    t6_photo_ring: mixHexPair('#ffffff', p1, 0.22),
    t6_logo_text_color: mixHexWithWhite(p3, 0.88),
    t6_greeting_color: mixHexPair('#111124', p4, 0.32),
    t6_name_color: pickDarkestReadable([p4, '#0c0c21'], 0.48),
    t6_title_color: mixHexPair('#101124', p4, 0.28),
    t6_contact_color: mixHexPair('#232231', p4, 0.25),
    t6_link_color: mixHexPair(p1, p2, 0.38),
    t6_fb_glyph_color: primaryOnWhite(p1, p4),
    t6_icon_phone: icons.phone,
    t6_icon_mail: icons.mail,
    t6_icon_pin: icons.pin,
  };
}

/**
 * Layout 7 — purple “studio” band: white photo card + logo, name/title + social glyphs, divider, contact stack.
 */
function buildTemplate7PaletteContext(c1, _c2, _c3, c4) {
  const p1 = String(c1 || '#5363f2').trim();
  const shell = mixHexPair('#5363f2', p1, 0.38);
  const titleMuted = mixHexWithWhite(shell, 0.46);
  const contactText = mixHexWithWhite(shell, 0.86);
  const divider = mixHexWithWhite(shell, 0.28);
  const stroke = '#ffffff';
  const icons = contactStrokeIconDataUrisCompact(stroke);
  const li = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${stroke}"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69A1.69 1.69 0 005.19 6.88c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`;
  const medium = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${stroke}"><circle cx="5.5" cy="12" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="18.5" cy="12" r="2.4"/></svg>`;
  const tw = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${stroke}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  const gh = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${stroke}"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.41 10.79c.54.1.74-.23.74-.52 0-.26-.01-.94-.01-1.85-3.01.66-3.64-1.45-3.64-1.45-.49-1.25-1.2-1.58-1.2-1.58-.98-.67.07-.66.07-.66 1.09.08 1.66 1.12 1.66 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.4-.27-4.92-1.2-4.92-5.34 0-1.18.42-2.15 1.11-2.9-.11-.27-.48-1.36.1-2.85 0 0 .91-.29 2.99 1.11.87-.24 1.8-.36 2.73-.36.92 0 1.86.12 2.73.36 2.08-1.4 2.99-1.11 2.99-1.11.59 1.49.22 2.58.11 2.85.69.75 1.11 1.72 1.11 2.9 0 4.15-2.53 5.06-4.94 5.33.39.34.73 1.01.73 2.03 0 1.46-.01 2.64-.01 3 0 .29.2.63.75.52A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>`;
  const p4 = String(c4 || '#1e293b').trim();
  const initialsBg = mixHexPair('#f1f5f9', p4, 0.08);
  const initialsColor = pickDarkestReadable([p1, p4], 0.45);
  return {
    t7_shell_bg: shell,
    t7_card_bg: '#ffffff',
    t7_name_color: '#ffffff',
    t7_title_color: titleMuted,
    t7_divider_color: divider,
    t7_contact_text: contactText,
    t7_initials_bg: initialsBg,
    t7_initials_color: initialsColor,
    t7_icon_mail: icons.mail,
    t7_icon_phone: icons.phone,
    t7_icon_globe: icons.globe,
    t7_icon_pin: icons.pin,
    t7_soc_linkedin: svgDataUri(li),
    t7_soc_medium: svgDataUri(medium),
    t7_soc_twitter: svgDataUri(tw),
    t7_soc_github: svgDataUri(gh),
  };
}

/**
 * Layout 8 — white card + blue wedge behind headshot, circular blue socials, blue contact icons, divider, title + logo.
 */
function buildTemplate8PaletteContext(c1, _c2, _c3, c4) {
  const p1 = String(c1 || '#5363f2').trim();
  const muted = mixHexPair('#929292', String(c4 || '#64748b').trim(), 0.38);
  const divider = mixHexPair('#e5e5e5', mixHexPair('#929292', p1, 0.25), 0.55);
  const iconsBlue = contactStrokeIconDataUrisCompact(p1);
  const liPath =
    'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69A1.69 1.69 0 005.19 6.88c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z';
  const twPath = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';
  const ghPath =
    'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.41 10.79c.54.1.74-.23.74-.52 0-.26-.01-.94-.01-1.85-3.01.66-3.64-1.45-3.64-1.45-.49-1.25-1.2-1.58-1.2-1.58-.98-.67.07-.66.07-.66 1.09.08 1.66 1.12 1.66 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.4-.27-4.92-1.2-4.92-5.34 0-1.18.42-2.15 1.11-2.9-.11-.27-.48-1.36.1-2.85 0 0 .91-.29 2.99 1.11.87-.24 1.8-.36 2.73-.36.92 0 1.86.12 2.73.36 2.08-1.4 2.99-1.11 2.99-1.11.59 1.49.22 2.58.11 2.85.69.75 1.11 1.72 1.11 2.9 0 4.15-2.53 5.06-4.94 5.33.39.34.73 1.01.73 2.03 0 1.46-.01 2.64-.01 3 0 .29.2.63.75.52A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z';
  const circ = (inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="13" fill="${p1}"/><g fill="#ffffff">${inner}</g></svg>`;
  const liCirc = svgDataUri(
    circ(`<path transform="translate(5,5) scale(0.42)" d="${liPath}"/>`)
  );
  const medCirc = svgDataUri(
    circ('<circle cx="8" cy="13" r="2.2" fill="#ffffff"/><circle cx="13" cy="13" r="2.2" fill="#ffffff"/><circle cx="18" cy="13" r="2.2" fill="#ffffff"/>')
  );
  const twCirc = svgDataUri(circ(`<path transform="translate(4.5,4.5) scale(0.42)" d="${twPath}"/>`));
  const ghCirc = svgDataUri(circ(`<path transform="translate(4,4) scale(0.38)" d="${ghPath}"/>`));
  const wedge = `<svg xmlns="http://www.w3.org/2000/svg" width="176" height="176" viewBox="0 0 176 176"><rect width="176" height="176" fill="#ffffff"/><g transform="translate(88,90) rotate(-20)"><path d="M0,0 L-92,-78 A 118 118 0 0 1 95,-58 Z" fill="${p1}"/></g></svg>`;
  const p4 = String(c4 || '#1e293b').trim();
  const initialsBg = mixHexPair('#f4f4f5', p4, 0.06);
  const initialsColor = pickDarkestReadable([p1, p4], 0.42);
  return {
    t8_shell_bg: '#ffffff',
    t8_name_color: p1,
    t8_title_color: muted,
    t8_contact_color: muted,
    t8_divider_color: divider,
    t8_photo_wedge_bg: svgDataUri(wedge),
    t8_initials_bg: initialsBg,
    t8_initials_color: initialsColor,
    t8_icon_mail: iconsBlue.mail,
    t8_icon_phone: iconsBlue.phone,
    t8_icon_globe: iconsBlue.globe,
    t8_icon_pin: iconsBlue.pin,
    t8_soc_linkedin: liCirc,
    t8_soc_medium: medCirc,
    t8_soc_twitter: twCirc,
    t8_soc_github: ghCirc,
  };
}

/**
 * Layout 9 — mint chevron (#42f5a4 style) + white rim (flat mint), circular headshot (no mat, transparent PNG), flat #111 row, light-grey social + dark glyphs, mint contact pills (reference card).
 */
function buildTemplate9PaletteContext(c1, _c2, _c3, c4) {
  const p1 = String(c1 || '#2dd4bf').trim();
  const p4 = String(c4 || '#0f172a').trim();
  /** Bright mint accent (~#42f5a4), blended with palette primary. */
  const mint = mixHexPair('#42f5a4', mixHexPair('#34d399', p1, 0.55), 0.42);
  const neon = mint;
  /** Single flat row fill (avoids seam when each &lt;td&gt; had its own gradient). */
  const darkBg = '#111111';
  /** Light grey social icon discs. */
  const socCircle = mixHexPair('#e5e7eb', mixHexWithWhite(p4, 0.88), 0.35);
  /** Dark grey glyphs on social discs. */
  const socGlyph = mixHexPair('#374151', mixHexWithBlack(p4, 0.08), 0.4);
  /** Muted light grey for address / phone / email / web lines. */
  const bodyMuted = mixHexPair('#d4d4d4', mixHexWithWhite(p4, 0.72), 0.25);
  /**
   * Full-height chevron: wider stem + tip; white rear + mint front (flat, no drop shadow on mint).
   */
  const chevronSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="275" height="280" viewBox="0 0 275 280" preserveAspectRatio="xMinYMid meet">
<polygon points="0,0 152,0 268,140 152,280 0,280" fill="#ffffff"/>
<polygon points="0,0 142,0 250,140 142,280 0,280" fill="${mint}"/>
</svg>`;
  const liPath =
    'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69A1.69 1.69 0 005.19 6.88c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z';
  const twPath =
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';
  const ghPath =
    'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.41 10.79c.54.1.74-.23.74-.52 0-.26-.01-.94-.01-1.85-3.01.66-3.64-1.45-3.64-1.45-.49-1.25-1.2-1.58-1.2-1.58-.98-.67.07-.66.07-.66 1.09.08 1.66 1.12 1.66 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.4-.27-4.92-1.2-4.92-5.34 0-1.18.42-2.15 1.11-2.9-.11-.27-.48-1.36.1-2.85 0 0 .91-.29 2.99 1.11.87-.24 1.8-.36 2.73-.36.92 0 1.86.12 2.73.36 2.08-1.4 2.99-1.11 2.99-1.11.59 1.49.22 2.58.11 2.85.69.75 1.11 1.72 1.11 2.9 0 4.15-2.53 5.06-4.94 5.33.39.34.73 1.01.73 2.03 0 1.46-.01 2.64-.01 3 0 .29.2.63.75.52A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z';
  const igGlyph = `<rect x="5.2" y="5.2" width="11.6" height="11.6" rx="2.8" ry="2.8" fill="none" stroke="${socGlyph}" stroke-width="1.35"/><circle cx="11" cy="11" r="2.6" fill="${socGlyph}"/><circle cx="15.2" cy="6.8" r="0.9" fill="${socGlyph}"/>`;
  const t9Soc = (inner) =>
    svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="${socCircle}"/><g fill="${socGlyph}">${inner}</g></svg>`
    );
  const t9_soc_twitter = t9Soc(`<path transform="translate(4.2,4) scale(0.55)" d="${twPath}"/>`);
  const t9_soc_linkedin = t9Soc(`<path transform="translate(4.5,4.5) scale(0.55)" d="${liPath}"/>`);
  const t9_soc_instagram = t9Soc(igGlyph);
  const t9_soc_github = t9Soc(`<path transform="translate(3.8,3.8) scale(0.52)" d="${ghPath}"/>`);
  const icons = contactStrokeIconDataUrisCompact('#ffffff');
  const initialsBg = mixHexWithBlack(mint, 0.38);
  const initialsColor = mixHexWithWhite(mint, 0.75);
  /** Initials inside avatar circle. */
  const initialsOnCard = '#ffffff';
  return {
    t9_dark_bg: darkBg,
    t9_accent: mint,
    t9_neon: neon,
    t9_body_muted: bodyMuted,
    t9_initials_on_card: initialsOnCard,
    t9_chevron_art: svgDataUri(chevronSvg),
    t9_soc_twitter: t9_soc_twitter,
    t9_soc_linkedin: t9_soc_linkedin,
    t9_soc_instagram: t9_soc_instagram,
    t9_soc_github: t9_soc_github,
    t9_initials_bg: initialsBg,
    t9_initials_color: initialsColor,
    t9_icon_mail: icons.mail,
    t9_icon_phone: icons.phone,
    t9_icon_globe: icons.globe,
    t9_icon_pin: icons.pin,
  };
}

/**
 * Layout 10 dark shell — blends **primary + secondary + text** so the card tracks palette *variation*
 * (not only the text slot, which is often the same dark neutral across presets).
 */
function buildTemplate10ShellBg(p1, p2, p4) {
  const p4s = String(p4 || '').trim();
  /** Very light “text” swatches must not wash a dark shell — blend with secondary instead. */
  const p4w = p4s && relativeLuminance(p4s) > 0.72 ? String(p2 || p1).trim() : p4s;
  const deep1 = mixHexWithBlack(p1, 0.78);
  const deep2 = mixHexWithBlack(p2, 0.74);
  const deep4 = mixHexWithBlack(p4w, 0.32);
  let bg = mixHexPair(mixHexPair(deep1, deep2, 0.48), deep4, 0.58);
  let L = relativeLuminance(bg);
  if (L > 0.28) bg = mixHexWithBlack(bg, 0.22);
  L = relativeLuminance(bg);
  if (L > 0.26) bg = mixHexWithBlack(bg, 0.14);
  if (L < 0.032) bg = mixHexPair(bg, mixHexWithWhite(p1, 0.05), 0.3);
  return bg;
}

/**
 * Layout 10 — **Vivid mode** (primary === accent): lime bar, lime pill, lime icons on a charcoal shell
 * (reference card). **Split mode**: mid moss accent → pill only; light silver accent → moss pill blend +
 * silver icons; otherwise pill blends primary + secondary for alternate brand themes.
 */
function buildTemplate10PaletteContext(c1, c2, c3, c4) {
  const p1 = String(c1 || '#A6E22E').trim();
  const p2 = String(c2 || p1).trim();
  const p3 = String(c3 || p1).trim();
  const p4 = String(c4 || '#0f172a').trim();

  const barColor = p1;
  const L3 = relativeLuminance(p3);
  const unifyVividAccent =
    !p3 || String(p3).trim().toLowerCase() === String(barColor).trim().toLowerCase();

  const pillBg = unifyVividAccent
    ? barColor
    : p3 && p3.toLowerCase() !== barColor.toLowerCase() && L3 > 0.06 && L3 < 0.45
      ? p3
      : mixHexPair(barColor, p2, 0.38);

  let bg = buildTemplate10ShellBg(p1, p2, p4);
  /** Lime-on-charcoal card: keep the shell neutral — blending a chromatic primary otherwise tints the field green. */
  if (unifyVividAccent) {
    const p2t = String(p2 || '').trim();
    if (p2t && relativeLuminance(p2t) < 0.18) {
      bg = mixHexPair(p2t, mixHexWithBlack(p2t, 0.45), 0.55);
    }
  }

  const pillL = relativeLuminance(pillBg);
  const pillText =
    pillL < 0.48
      ? '#ffffff'
      : pickDarkestReadable([p4, p2, bg, mixHexWithBlack(pillBg, 0.92)], 0.55);

  const pillBorder = mixHexPair(pillBg, mixHexWithBlack(pillBg, pillL > 0.52 ? 0.2 : 0.38), 0.28);

  const iconDefaultSilver = mixHexPair('#c5cec7', mixHexWithWhite(p2, 0.2), 0.42);
  const iconTint = unifyVividAccent ? barColor : L3 > 0.42 ? p3 : iconDefaultSilver;
  const ic = contactStrokeIconDataUrisCompact(iconTint);

  const barL = relativeLuminance(barColor);
  const brandMarkFill = barColor;
  const brandMarkGlyph =
    barL > 0.55
      ? pickDarkestReadable([p4, p2, bg, mixHexWithBlack(barColor, 0.9)], 0.5)
      : '#ffffff';
  const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6 0L0 2.8v5.4C0 11.2 2.7 13.8 6 14c3.3-.2 6-2.8 6-5.8V2.8L6 0z" fill="${brandMarkFill}"/><path d="M8.2 5.1L5.4 8.4 3.8 6.8l-.9.9 2.5 2.5L9.1 6 8.2 5.1z" fill="${brandMarkGlyph}"/></svg>`;

  const mutedBase = mixHexPair('#a5a5a5', mixHexWithWhite(p4, 0.1), 0.24);
  const contactMutedB = mixHexPair(mutedBase, mixHexWithWhite(p3, 0.18), 0.14);
  const contactAddr = mixHexPair(mutedBase, mixHexWithWhite(p2, 0.12), 0.12);

  const nameOnDark = bannerHeadlineOnDark(p4);
  const taglineC = mixHexPair('#a3a3a3', mixHexWithWhite(p3, 0.32), 0.28);

  return {
    t10_bg: bg,
    t10_bar: barColor,
    t10_name_color: nameOnDark,
    t10_pill_bg: pillBg,
    t10_pill_border: pillBorder,
    t10_pill_text: pillText,
    t10_contact_muted: mutedBase,
    t10_contact_muted_b: contactMutedB,
    t10_contact_address: contactAddr,
    t10_company: nameOnDark,
    t10_tagline_color: taglineC,
    t10_icon_phone: ic.phone,
    t10_icon_mail: ic.mail,
    t10_icon_globe: ic.globe,
    t10_icon_pin: ic.pin,
    t10_brand_icon: svgDataUri(brandSvg),
  };
}

/**
 * Layout 11 — reference card: **#81cc27** field, **#0c0c0d** contact card, **#5d9021** row dividers,
 * **white** stroke icons, **light gray** row copy, **dark gray** intro + role, thin gray rule, faint “Hello!”.
 */
function buildTemplate11PaletteContext(c1, c2, c3, c4) {
  const limeRef = '#81cc27';
  const lime = String(c1 || limeRef).trim();
  const cardRef = '#0c0c0d';
  const cardBlack = String(c2 || cardRef).trim();
  const lightCopyRef = '#e8e8e8';
  const lightCopy = String(c3 || lightCopyRef).trim();
  const inkRef = '#1a1d15';
  const ink = String(c4 || inkRef).trim();
  /** Row hairlines — darker green (reference), not the same as the lime field. */
  const rowGreenRef = '#5d9021';

  /** Keep the banner reading as “lime” even when the palette primary drifts. */
  let bg = lime;
  const Lbg = relativeLuminance(bg);
  if (Lbg < 0.35 || Lbg > 0.72) bg = mixHexPair(lime, limeRef, 0.55);

  const nameColor = pickDarkestReadable([ink, '#0c0c0d', '#1a1d15', mixHexWithBlack(bg, 0.92)], 0.42);
  /** Description — smaller dark gray on lime (softer than the name). */
  const introColor = mixHexPair('#4a5244', mixHexWithBlack(ink, 0.12), 0.55);
  /** Job title under rule — medium dark gray. */
  const roleColor = mixHexPair('#3d4538', mixHexWithBlack(ink, 0.06), 0.52);
  /** Thin separator under intro — subtle gray. */
  const dividerColor = mixHexPair('#6b7280', mixHexWithBlack(ink, 0.25), 0.4);
  const helloColor = '#ffffff';
  /** Small label top-right — faint on lime. */
  const cornerColor = mixHexPair('#5a6554', mixHexWithBlack(bg, 0.48), 0.5);
  /** Decorative “Hello!” bottom-left — very low contrast on lime. */
  const faintHelloColor = mixHexPair(bg, mixHexWithWhite(bg, 0.38), 0.68);

  const cardFill =
    relativeLuminance(cardBlack) < 0.12 && relativeLuminance(cardBlack) > 0.01 ? cardBlack : cardRef;
  const gutterColor = mixHexPair(rowGreenRef, mixHexWithBlack(bg, 0.55), 0.35);
  /** Body lines in the black card — light gray / off-white. */
  const contactText = mixHexPair(lightCopyRef, lightCopy, 0.5);
  const ic = contactStrokeIconDataUrisCompact('#ffffff');

  const gridStroke = mixHexWithWhite(bg, 0.42);
  let gridBody = '';
  for (let x = 0; x <= 160; x += 14) {
    gridBody += `<line x1="${x}" y1="0" x2="${x}" y2="240" stroke="${gridStroke}" stroke-opacity="0.28" stroke-width="0.85"/>`;
  }
  for (let y = 0; y <= 240; y += 14) {
    gridBody += `<line x1="0" y1="${y}" x2="160" y2="${y}" stroke="${gridStroke}" stroke-opacity="0.28" stroke-width="0.85"/>`;
  }
  const t11_grid_uri = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="240" viewBox="0 0 160 240" fill="none">${gridBody}</svg>`
  );

  const initialsBg = mixHexWithBlack(cardFill, 0.35);
  const initialsColor = '#ffffff';

  return {
    t11_bg: bg,
    t11_gutter_color: gutterColor,
    t11_card_fill: cardFill,
    t11_hello_color: helloColor,
    t11_name_color: nameColor,
    t11_intro_color: introColor,
    t11_divider: dividerColor,
    t11_role_color: roleColor,
    t11_corner_color: cornerColor,
    t11_faint_hello_color: faintHelloColor,
    t11_row_bg_a: cardFill,
    t11_row_bg_b: cardFill,
    t11_row_border: gutterColor,
    t11_contact_text: contactText,
    t11_contact_text_b: contactText,
    t11_photo_ring: '#ffffff',
    t11_icon_pin: ic.pin,
    t11_icon_phone: ic.phone,
    t11_icon_mail: ic.mail,
    t11_icon_globe: ic.globe,
    t11_initials_bg: initialsBg,
    t11_initials_color: initialsColor,
    t11_grid_uri,
  };
}

/**
 * Lime “notched panel” behind the portrait (reference art — rounded vertical slab with a left-side bite).
 * Rendered as SVG data-URI so it survives when the plate PNG omits that layer or the photo covers it.
 */
function buildTemplate12PhotoRailDataUri(limeHex) {
  const f = String(limeHex || '#DFFF00').trim();
  /** Rheina rail: left-edge step (~⅓ down), raised NW tab, rounded TL, top slopes down to the right. */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="120" viewBox="0 0 105 116" preserveAspectRatio="none"><path fill="${f}" d="M10 114V42h22V10Q34 2 42 2L98 12Q103 14 103 22V106Q103 113 96 113H14Q10 113 10 108V114Z"/></svg>`;
  return svgDataUri(svg);
}

/** Layout 12 — Rheina 520×162 card: Codia plate + decor; cream #FCF8F1; role pill = black on lime (see `template12Html.js`). */
function buildTemplate12PaletteContext(c1, c2, c3, c4) {
  const ink = String(c2 || '#1a1a1a').trim();
  const creamRef = '#FCF8F1';
  const cream = String(c3 || creamRef).trim();
  const textSoft = String(c4 || '#9A9894').trim();
  const lime = String(c1 || '#DFFF00').trim();
  return {
    t12_photo_rail_uri: buildTemplate12PhotoRailDataUri(lime),
    t12_lime_solid: lime,
    t12_squiggle_uri: 'https://static.codia.ai/s/image_42fd279c-001a-4468-8f67-59d4126b0b25.png',
    t12_hello_mark_uri: 'https://static.codia.ai/s/image_a461e5bc-4546-46f5-a995-c30477d025e8.png',
    t12_x_uri: 'https://static.codia.ai/s/image_99732d6d-b959-4013-9ac8-16bd0007b74d.png',
    t12_chevron_uri: 'https://static.codia.ai/s/image_ee0f6312-add1-4b8e-8fb4-845fad121dc0.png',
    t12_card_bg: mixHexPair(creamRef, cream, 0.35),
    t12_name_color: ink,
    t12_contact_muted: mixHexPair('#A09F97', textSoft, 0.4),
    t12_contact_label: ink,
    /** Reference art: bold black job title on the lime capsule (not olive). */
    t12_role_pill_text: ink,
    t12_badge_fill: mixHexPair('#DFFF00', lime, 0.55),
    t12_photo_placeholder_bg: mixHexPair('#d4d4d0', ink, 0.12),
    t12_photo_placeholder_color: '#ffffff',
  };
}

/** Layout 13 — dark shell + yellow accent rail + white icons/type (see `template13Html.js`). */
function buildTemplate13PaletteContext(c1, c2, c3, c4) {
  const accent = String(c1 || '#FFD54F').trim();
  const shell = String(c2 || '#1C1C1C').trim();
  const textOn = String(c4 || '#FFFFFF').trim();
  const w = '#ffffff';
  const ic = contactStrokeIconDataUrisCompact(w);
  const liSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${w}"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>`;
  /** Middle slot — Behance “Bē” mark (filled white on dark; URL is portfolio / Behance). */
  const behSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${w}"><path d="M22 7h-7v2h7V7zm1.73 10c-.44 1.3-2.03 3-5.1 3-3.07 0-5.56-1.73-5.56-5.68 0-3.9 2.32-5.92 5.46-5.92 3.09 0 4.97 1.78 5.57 4.09l.07.28h-4.98c-.24-1.35-.91-2.03-2.12-2.03-1.56 0-2.65 1.21-2.65 3.25 0 2.08 1.04 3.32 2.7 3.32 1.28 0 2.12-.67 2.44-1.64H16V17h6.26c.09.64.16 1.28.16 2.03 0 3.25-2.04 5.92-5.64 5.92zM8.5 5H2v14h6.5c1.65 0 3-1.35 3-3V8c0-1.65-1.35-3-3-3zm-1.5 9.5H5V15h2c.83 0 1.5-.67 1.5-1.5S7.83 12 7 12H5v2.5zm1-5H5V8h2C7.83 8 8.5 8.67 8.5 9.5S7.83 11 7 11H5.5V9.5z"/></svg>`;
  const igSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${w}"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16.2a6.2 6.2 0 1 1 0-12.4 6.2 6.2 0 0 1 0 12.4zm5.5-11.7a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z"/></svg>`;
  /** Rounded right chevron (stroke + round caps) — matches reference “>” arrow; uses palette accent on dark shell. */
  const curSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M9 7l11 9-11 9" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const phBg = mixHexPair('#353535', shell, 0.45);
  return {
    t13_shell_bg: shell,
    t13_accent: accent,
    t13_text: textOn,
    t13_soc_li: svgDataUri(liSvg),
    t13_soc_beh: svgDataUri(behSvg),
    t13_soc_ig: svgDataUri(igSvg),
    t13_cursor: svgDataUri(curSvg),
    t13_icon_pin: ic.pin,
    t13_icon_mail: ic.mail,
    t13_icon_globe: ic.globe,
    t13_icon_phone: ic.phone,
    t13_photo_placeholder_bg: phBg,
    t13_photo_placeholder_color: textOn,
  };
}

/** `rgba(r,g,b,a)` helper for Layout 14 glows (follows palette primary orange). */
function template14PrimaryRgbForGlow(hex) {
  const h = String(hex || '').replace('#', '').trim();
  if (h.length === 6 && /^[0-9a-f]+$/i.test(h)) {
    return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
  }
  return '242,113,33';
}

/** Layout 14 — warm canvas + orange photo block + white footer (see `template14Html.js`). */
function buildTemplate14PaletteContext(c1, c2, c3, c4) {
  const orange = String(c1 || '#F27121').trim();
  const canvas = String(c2 || '#EDEAE6').trim();
  const footer = String(c3 || '#FFFFFF').trim();
  const ink = String(c4 || '#0A0A0A').trim();
  const rgb = template14PrimaryRgbForGlow(orange);
  /** Off-white canvas + peach glows (top-left, mid-right, lower-right) + soft horizontal wash — match reference card. */
  const canvasStyle = `background-color:${canvas};background-image:radial-gradient(ellipse 125% 100% at 5% 14%, rgba(${rgb},0.32) 0%, transparent 52%),radial-gradient(ellipse 95% 85% at 88% 50%, rgba(${rgb},0.2) 0%, transparent 48%),radial-gradient(ellipse 110% 90% at 96% 99%, rgba(${rgb},0.24) 0%, transparent 52%),linear-gradient(100deg,rgba(${rgb},0.07) 0%,transparent 44%,rgba(${rgb},0.09) 94%);`;
  const ic = contactStrokeIconDataUrisCompact(ink);
  const subtitle = mixHexWithWhite(ink, 0.36);
  const phBg = mixHexPair('#ffd8c4', orange, 0.42);
  const oSoft = mixHexWithWhite(orange, 0.42);
  const inkFaint = mixHexWithWhite(ink, 0.78);
  /** Thin header strip + name-row rule + footer bars — inline SVG for broad client support. */
  const topbarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="552" height="5" viewBox="0 0 552 5"><rect width="92" height="4" y="0.5" rx="2" fill="${orange}" opacity="0.72"/><rect x="100" width="10" height="4" y="0.5" rx="1.5" fill="${oSoft}" opacity="0.9"/><rect x="116" width="10" height="4" y="0.5" rx="1.5" fill="${oSoft}" opacity="0.65"/><rect x="132" width="10" height="4" y="0.5" rx="1.5" fill="${oSoft}" opacity="0.45"/><rect x="148" width="404" height="1" y="2" fill="${inkFaint}" opacity="0.35"/></svg>`;
  let ruleDots = '';
  for (let i = 0; i < 9; i++) {
    const op = 0.14 + (i % 3) * 0.08;
    ruleDots += `<circle cx="${6 + i * 14}" cy="5" r="2.2" fill="${orange}" opacity="${op.toFixed(2)}"/>`;
  }
  const ruleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="178" height="12" viewBox="0 0 178 12">${ruleDots}<rect x="132" y="2" width="46" height="7" rx="3.5" fill="${orange}" opacity="0.38"/></svg>`;
  const barsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect x="3" y="6" width="6" height="28" rx="3" fill="${orange}" opacity="0.88"/><rect x="16" y="11" width="6" height="22" rx="3" fill="${orange}" opacity="0.55"/><rect x="29" y="4" width="6" height="32" rx="3" fill="${orange}" opacity="0.7"/><circle cx="8" cy="4" r="2" fill="${oSoft}" opacity="0.9"/><circle cx="31" cy="34" r="2.5" fill="${oSoft}" opacity="0.55"/></svg>`;
  return {
    t14_orange: orange,
    t14_footer_bg: footer,
    t14_text: ink,
    t14_subtitle: subtitle,
    t14_canvas_style: canvasStyle,
    t14_divider_color: mixHexPair(canvas, orange, 0.88),
    t14_deco_topbar: svgDataUri(topbarSvg),
    t14_deco_rule: svgDataUri(ruleSvg),
    t14_deco_bars: svgDataUri(barsSvg),
    t14_icon_pin: ic.pin,
    t14_icon_mail: ic.mail,
    t14_icon_globe: ic.globe,
    t14_icon_phone: ic.phone,
    t14_photo_placeholder_bg: phBg,
    t14_photo_placeholder_color: ink,
  };
}

/** Layout 15 — lime field + tab + card colors + tab fallback mark. */
function buildTemplate15PaletteContext(c1, c2, c3, c4) {
  const lime = String(c1 || '#D4FF1F').trim();
  const ink = String(c2 || '#0a0a0a').trim();
  const card = String(c3 || '#ffffff').trim();
  const muted = String(c4 || '#757575').trim();
  const phBg = mixHexPair('#e8f4b8', ink, 0.05);
  const tabIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="30" viewBox="0 0 40 22"><path fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" d="M2 14 Q8 6 14 14 T26 7 T38 14"/><path fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" d="M2 18 Q8 10 14 18 T26 11 T38 18"/><path fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round" d="M2 10 Q8 3 14 10 T26 3 T38 10"/></svg>`;
  return {
    t15_lime: lime,
    t15_card: card,
    t15_ink: ink,
    t15_muted: muted,
    t15_tab_icon: svgDataUri(tabIconSvg),
    t15_photo_placeholder_bg: phBg,
    t15_photo_placeholder_color: ink,
  };
}

/** Layout 16 — 600×~112px banner: #0a192f navy, #555 title, #333 contacts, 4×3 dots (no social URIs). */
function buildTemplate16PaletteContext(c1, c2, c3, c4) {
  const navyRef = '#0a192f';
  const navy = String(c1 || navyRef).trim();
  const ink = String(c2 || '#061a2e').trim();
  const white = String(c3 || '#ffffff').trim();
  const bodyGray = String(c4 || '#555555').trim();
  /** Spec: light gray dot grids (~#e0e0e0); blend slightly if user picks a vivid text color. */
  const dotFill = mixHexPair('#e0e0e0', bodyGray, 0.88);
  const decoFill = mixHexPair('#e0e0e0', white, 0.12);
  const citySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220"><g fill="#ffffff" opacity="0.065"><rect x="6" y="98" width="30" height="122" rx="2"/><rect x="44" y="124" width="24" height="96" rx="2"/><rect x="76" y="76" width="38" height="144" rx="2"/><rect x="120" y="104" width="28" height="116" rx="2"/><rect x="156" y="82" width="32" height="138" rx="2"/><rect x="194" y="112" width="26" height="108" rx="2"/><rect x="228" y="68" width="40" height="152" rx="2"/><rect x="274" y="100" width="24" height="120" rx="2"/></g><g fill="#ffffff" opacity="0.03"><rect x="0" y="162" width="320" height="5" rx="1"/></g></svg>`;
  const hexSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><polygon points="32,6 57.98,21 57.98,43 32,58 6.02,43 6.02,21" fill="none" stroke="#ffffff" stroke-width="2.35" stroke-linejoin="round"/></svg>`;
  const t16Dots = (cols, rows, gap, r) => {
    let body = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        body += `<circle cx="${x * gap + gap / 2}" cy="${y * gap + gap / 2}" r="${r}" fill="${dotFill}"/>`;
      }
    }
    const w = cols * gap;
    const h = rows * gap;
    return svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
    );
  };
  /** Faint diagonal pills — top-right (displayed at 92×56 in template16Html). */
  const decoTrSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="56" viewBox="0 0 108 66" fill="none"><rect x="44" y="-6" width="58" height="18" rx="9" transform="rotate(36 73 3)" fill="${decoFill}" opacity="0.36"/><rect x="52" y="10" width="52" height="15" rx="7.5" transform="rotate(30 78 17.5)" fill="${decoFill}" opacity="0.26"/></svg>`;
  const wicon = contactStrokeIconDataUrisCompact('#ffffff');
  const leftCellStyle = `background-color:${navy};background-image:url(${svgDataUri(citySvg)});background-repeat:no-repeat;background-position:90% 108%;background-size:260% auto;`;
  const phBg = mixHexPair('#0f1f35', ink, 0.4);
  /** Job line — reference `.title` ~#555. */
  const titleMuted = mixHexPair('#555555', bodyGray, 0.28);
  /** Contact rows — reference `.contact-info` ~#333. */
  const contactInk = mixHexPair('#333333', bodyGray, 0.38);
  return {
    t16_navy: navy,
    t16_ring_dark: ink,
    t16_white: white,
    t16_name_color: navy,
    t16_title_color: titleMuted,
    t16_contact_color: contactInk,
    t16_left_cell_style: leftCellStyle,
    t16_hex_uri: svgDataUri(hexSvg),
    t16_dots_tr: t16Dots(4, 3, 8, 1.22),
    t16_dots_br: t16Dots(4, 3, 8, 1.22),
    t16_deco_tr: svgDataUri(decoTrSvg),
    t16_icon_phone: wicon.phone,
    t16_icon_globe: wicon.globe,
    t16_icon_pin: wicon.pin,
    t16_photo_placeholder_bg: phBg,
    t16_photo_placeholder_color: white,
  };
}

/** Layout 17 — 600px lime + ink card (Blue Rayhan–style reference). */
function buildTemplate17PaletteContext(c1, c2, c3, c4) {
  const lime = String(c1 || '#7dc242').trim();
  const ink = String(c2 || '#111111').trim();
  const badge = String(c3 || '#6db33f').trim();
  const body = String(c4 || '#333333').trim();
  const limeSoft = mixHexWithWhite(lime, 0.38);
  const limeGhost = mixHexPair('#e8eee4', lime, 0.5);
  const topLines = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="12" viewBox="0 0 22 12"><rect x="0" y="0" width="19" height="2.2" rx="0.5" fill="${lime}"/><rect x="0" y="4.8" width="15" height="2.2" rx="0.5" fill="${lime}"/><rect x="0" y="9.5" width="12" height="2.2" rx="0.5" fill="${lime}"/></svg>`;
  /** Top-right header cluster — curve, dots, angled bar (palette-driven). */
  const headerClusterSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="36" viewBox="0 0 108 36" fill="none"><path d="M4 30 Q42 8 104 6" stroke="${limeGhost}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.62"/><circle cx="86" cy="11" r="4" fill="${lime}" opacity="0.92"/><circle cx="100" cy="21" r="2.8" fill="${badge}" opacity="0.88"/><rect x="54" y="9" width="34" height="3.2" rx="1.6" transform="rotate(-24 71 10.6)" fill="${lime}" opacity="0.4"/><circle cx="70" cy="26" r="1.9" fill="${limeSoft}" opacity="0.78"/></svg>`;
  /** Thin strip above lime footer — wave + dashed hairline. */
  const footerBandSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="18" viewBox="0 0 560 18" fill="none"><path d="M0 10 C112 4 224 15 336 9 C416 5 496 13 560 8" stroke="${lime}" stroke-width="1.25" fill="none" opacity="0.44" stroke-linecap="round"/><line x1="28" y1="15.5" x2="532" y2="15.5" stroke="#dedede" stroke-width="1" stroke-dasharray="3 8" opacity="0.95"/><circle cx="96" cy="9" r="2.1" fill="${lime}" opacity="0.48"/><circle cx="280" cy="10" r="2" fill="${badge}" opacity="0.52"/><circle cx="464" cy="9" r="2.1" fill="${lime}" opacity="0.48"/></svg>`;
  /** Slim vertical accent for the left rail. */
  const railSpineSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="96" viewBox="0 0 12 96" fill="none"><line x1="6" y1="10" x2="6" y2="86" stroke="${mixHexPair('#ececec', lime, 0.32)}" stroke-width="1.15" stroke-linecap="round"/><circle cx="6" cy="24" r="2.2" fill="${lime}" opacity="0.52"/><circle cx="6" cy="50" r="2.6" fill="${badge}" opacity="0.48"/><circle cx="6" cy="76" r="2.2" fill="${lime}" opacity="0.52"/></svg>`;
  const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="${badge}"/><defs><path id="t17bp" d="M25,25 m-16.5,0 a16.5,16.5 0 1,1 33,0 a16.5,16.5 0 1,1 -33,0"/></defs><text fill="#111111" font-family="Montserrat,Helvetica,Arial,sans-serif" font-size="4.15" font-weight="600" letter-spacing="0.08"><textPath href="#t17bp" startOffset="5%">if you need a design • inbox</textPath></text><path fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M34.5 34.5L15.5 15.5M15.5 15.5H25.25M15.5 15.5V24.25"/></svg>`;
  const arrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20"><path d="M4 10h9M10 6l4 4-4 4" stroke="${lime}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ic = contactStrokeIconDataUrisCompact(lime);
  const phBg = mixHexPair('#e8e8e8', ink, 0.06);
  return {
    t17_lime: lime,
    t17_name_ink: ink,
    t17_body_text: body,
    t17_footer_lime: lime,
    t17_top_lines_uri: svgDataUri(topLines),
    t17_header_cluster_uri: svgDataUri(headerClusterSvg),
    t17_footer_band_uri: svgDataUri(footerBandSvg),
    t17_rail_spine_uri: svgDataUri(railSpineSvg),
    t17_badge_uri: svgDataUri(badgeSvg),
    t17_title_arrow_uri: svgDataUri(arrowSvg),
    t17_icon_pin: ic.pin,
    t17_icon_phone: ic.phone,
    t17_icon_mail: ic.mail,
    t17_icon_globe: ic.globe,
    t17_photo_placeholder_bg: phBg,
    t17_photo_placeholder_color: ink,
  };
}

/**
 * Layout 18 — multi-shade card field: CSS linear ramp (always paints) + SVG mesh (img + optional paint).
 * @returns {{ uri: string, cssGrad: string }}
 */
function buildTemplate18CardBackground(limeHex, navyHex, depthHex, mistHex, w = 521, h = T18_CARD_HEIGHT_PX) {
  const lime = String(limeHex || '#A3B64F').trim();
  const navy = String(navyHex || '#0b131e').trim();
  const depth = String(depthHex || '#1f2a38').trim();
  const mist = String(mistHex || '#b9c2cf').trim();
  const base = mixHexPair(mixHexPair('#0b131e', navy, 0.45), depth, 0.06);
  const s1 = mixHexPair(base, mixHexWithBlack(navy, 0.28), 0.32);
  const s2 = mixHexPair(base, depth, 0.38);
  const s3 = mixHexPair(base, mixHexPair(navy, lime, 0.1), 0.22);
  const s4 = mixHexPair(depth, mixHexWithWhite(mist, 0.08), 0.28);
  const s5 = mixHexPair(base, navy, 0.52);
  const s6 = mixHexWithBlack(mixHexPair(base, depth, 0.72), 0.22);
  const washHi = mixHexPair(mist, mixHexWithWhite(lime, 0.28), 0.45);
  const washLo = mixHexPair(mist, mixHexWithBlack(navy, 0.15), 0.35);
  const meshA = mixHexPair(lime, base, 0.55);
  const meshB = mixHexPair(mist, navy, 0.42);
  const stripeInk = mixHexPair(lime, s3, 0.4);
  const limeGlow = mixHexWithWhite(lime, 0.22);
  const cssGrad = `linear-gradient(148deg, ${s1} 0%, ${s2} 20%, ${s3} 40%, ${s4} 58%, ${s5} 78%, ${s6} 100%)`;
  const yWave = Math.round(h * 0.574);
  const yCtlA = Math.round(h * 0.3);
  const yCtlB = Math.round(h * 0.52);
  const yCtlC = Math.round(h * 0.41);
  const yTopWave = Math.round(h * 0.191);
  const yEll1 = Math.round(h * 0.262);
  const yEll2 = Math.round(h * 0.81);
  const ry1 = Math.round(h * 0.382);
  const ry2 = Math.round(h * 0.338);
  const cxRing = Math.round(w * 0.44);
  const cyRing = Math.round(h * 0.5);
  const rRing = Math.round(h * 0.3);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">` +
    `<defs>` +
    `<linearGradient id="t18lg" x1="0%" y1="0%" x2="100%" y2="100%">` +
    `<stop offset="0%" stop-color="${s1}"/>` +
    `<stop offset="20%" stop-color="${s2}"/>` +
    `<stop offset="40%" stop-color="${s3}"/>` +
    `<stop offset="58%" stop-color="${s4}"/>` +
    `<stop offset="78%" stop-color="${s5}"/>` +
    `<stop offset="100%" stop-color="${s6}"/>` +
    `</linearGradient>` +
    `<linearGradient id="t18beam" x1="0%" y1="100%" x2="58%" y2="0%">` +
    `<stop offset="0%" stop-color="${mist}" stop-opacity="0"/>` +
    `<stop offset="42%" stop-color="${mist}" stop-opacity="0.12"/>` +
    `<stop offset="100%" stop-color="${lime}" stop-opacity="0.07"/>` +
    `</linearGradient>` +
    `<pattern id="t18stripes" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)">` +
    `<path d="M-3 18 L18 -3" stroke="${stripeInk}" stroke-opacity="0.1" stroke-width="1.2" fill="none"/>` +
    `</pattern>` +
    `<pattern id="t18dots" width="26" height="26" patternUnits="userSpaceOnUse">` +
    `<circle cx="3" cy="4" r="0.9" fill="${mist}" fill-opacity="0.14"/>` +
    `<circle cx="17" cy="18" r="0.7" fill="${lime}" fill-opacity="0.09"/>` +
    `</pattern>` +
    `<radialGradient id="t18rg" cx="84%" cy="6%" r="78%" fx="84%" fy="6%">` +
    `<stop offset="0%" stop-color="${washHi}" stop-opacity="0.48"/>` +
    `<stop offset="45%" stop-color="${washHi}" stop-opacity="0.16"/>` +
    `<stop offset="100%" stop-color="${s2}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="t18rg2" cx="8%" cy="92%" r="70%" fx="8%" fy="92%">` +
    `<stop offset="0%" stop-color="${washLo}" stop-opacity="0.34"/>` +
    `<stop offset="55%" stop-color="${washLo}" stop-opacity="0.1"/>` +
    `<stop offset="100%" stop-color="${s5}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="t18rg3" cx="30%" cy="38%" r="58%" fx="30%" fy="38%">` +
    `<stop offset="0%" stop-color="${limeGlow}" stop-opacity="0.2"/>` +
    `<stop offset="70%" stop-color="${s2}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="url(#t18lg)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t18rg)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t18rg2)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t18rg3)"/>` +
    `<path fill="${meshA}" fill-opacity="0.085" d="M0 ${yWave} C140 ${yCtlA} 320 ${yCtlB} ${w} ${yCtlC} L${w} ${h} L0 ${h} Z"/>` +
    `<path fill="${meshB}" fill-opacity="0.09" d="M${w} 0 C360 ${Math.round(h * 0.218)} 200 ${Math.round(h * 0.109)} 0 ${yTopWave} L0 0 Z"/>` +
    `<ellipse cx="392" cy="${yEll1}" rx="160" ry="${ry1}" fill="${lime}" fill-opacity="0.055"/>` +
    `<ellipse cx="118" cy="${yEll2}" rx="140" ry="${ry2}" fill="${mist}" fill-opacity="0.06"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t18stripes)" opacity="0.42"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t18dots)" opacity="0.38"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t18beam)"/>` +
    `<circle cx="${cxRing}" cy="${cyRing}" r="${rRing}" fill="none" stroke="${washHi}" stroke-opacity="0.11" stroke-width="1.35"/>` +
    `<path fill="none" stroke="${mixHexPair(lime, mist, 0.45)}" stroke-opacity="0.13" stroke-width="1.2" stroke-linecap="round" d="M${Math.round(w * 0.66)} ${Math.round(h * 0.92)} A${Math.round(h * 0.36)} ${Math.round(h * 0.36)} 0 0 1 ${Math.round(w * 0.98)} ${Math.round(h * 0.34)}"/>` +
    `<path fill="none" stroke="${depth}" stroke-opacity="0.16" stroke-width="0.95" stroke-linecap="round" d="M0 ${Math.round(h * 0.24)} L${Math.round(w * 0.4)} ${Math.round(h * 0.09)}"/>` +
    `<path fill="none" stroke="${s4}" stroke-opacity="0.12" stroke-width="0.9" stroke-linecap="round" d="M${Math.round(w * 0.52)} ${h} Q${Math.round(w * 0.78)} ${Math.round(h * 0.72)} ${w} ${Math.round(h * 0.58)}"/>` +
    `</svg>`;
  return { uri: svgDataUri(svg), cssGrad };
}

/** Layout 18 — shaded card field + Builder borders + reference greys (no full-bleed photo board). */
function buildTemplate18PaletteContext(c1, c2, c3, c4) {
  const lime = String(c1 || '#A3B64F').trim();
  const navy = String(c2 || '#0b131e').trim();
  const depth = String(c3 || '#1f2a38').trim();
  const mist = String(c4 || '#b9c2cf').trim();
  const cardFill = mixHexPair(mixHexPair('#0b131e', navy, 0.45), depth, 0.06);
  const role = '#838383';
  const addr = '#9B9B9B';
  const phoneC = '#959595';
  const emailC = '#999999';
  const webC = '#9E9E9E';
  const phBg = mixHexWithBlack(cardFill, 0.2);
  const phFg = mixHexWithWhite(mist, 0.48);
  const ic = contactStrokeIconDataUrisCompact(lime);
  const t18Bg = buildTemplate18CardBackground(lime, navy, depth, mist);

  return {
    t18_bg_solid: cardFill,
    t18_bg_layer_uri: t18Bg.uri,
    t18_bg_css_grad: t18Bg.cssGrad,
    t18_brand: lime,
    t18_role: role,
    t18_addr: addr,
    t18_phone: phoneC,
    t18_email: emailC,
    t18_web: webC,
    t18_border_top_url: T18_BORDER_TOP,
    t18_border_right_url: T18_BORDER_RIGHT,
    t18_icon_pin: ic.pin,
    t18_icon_phone: ic.phone,
    t18_icon_mail: ic.mail,
    t18_icon_globe: ic.globe,
    t18_photo_placeholder_bg: phBg,
    t18_photo_placeholder_color: phFg,
  };
}

/**
 * Layout 19 — full-bleed soft mesh: radials + stripe + dot patterns + sage motes (under doodles/portrait).
 */
function buildTemplate19DeckBackground(periHex, periDeepHex, sageHex, whiteHex, w = T19_CARD_WIDTH_PX, h = T19_CARD_HEIGHT_PX) {
  const peri = String(periHex || '#8a94f8').trim();
  const periDeep = String(periDeepHex || '#6f78e8').trim();
  const sage = String(sageHex || '#bed896').trim();
  const white = String(whiteHex || '#ffffff').trim();
  const blob = mixHexPair(periDeep, mixHexWithBlack(peri, 0.18), 0.5);
  const wash = mixHexWithWhite(peri, 0.18);
  const sageMist = mixHexPair(sage, white, 0.5);
  const stripeInk = mixHexWithBlack(peri, 0.14);
  const arcCol = mixHexPair(periDeep, white, 0.35);
  const ellFill = mixHexPair(sage, periDeep, 0.72);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">` +
    `<defs>` +
    `<radialGradient id="t19dk1" cx="14%" cy="82%" r="62%" fx="14%" fy="82%">` +
    `<stop offset="0%" stop-color="${blob}" stop-opacity="0.52"/>` +
    `<stop offset="70%" stop-color="${blob}" stop-opacity="0.12"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="t19dk2" cx="86%" cy="18%" r="52%" fx="86%" fy="18%">` +
    `<stop offset="0%" stop-color="${white}" stop-opacity="0.34"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="t19dk3" cx="52%" cy="6%" r="44%" fx="52%" fy="6%">` +
    `<stop offset="0%" stop-color="${sageMist}" stop-opacity="0.26"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<linearGradient id="t19dkbeam" x1="0%" y1="100%" x2="68%" y2="12%">` +
    `<stop offset="0%" stop-color="${white}" stop-opacity="0"/>` +
    `<stop offset="48%" stop-color="${wash}" stop-opacity="0.22"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<pattern id="t19dkdots" width="24" height="24" patternUnits="userSpaceOnUse">` +
    `<circle cx="4" cy="5" r="0.95" fill="${white}" opacity="0.16"/>` +
    `<circle cx="17" cy="15" r="0.75" fill="${periDeep}" opacity="0.12"/>` +
    `</pattern>` +
    `<pattern id="t19dkstripe" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">` +
    `<path d="M-4 22 L22 -4" stroke="${stripeInk}" stroke-opacity="0.17" stroke-width="1.1"/>` +
    `</pattern>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="url(#t19dk1)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t19dk2)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t19dk3)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t19dkbeam)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t19dkdots)" opacity="0.88"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t19dkstripe)" opacity="0.55"/>` +
    `<path fill="none" stroke="${arcCol}" stroke-width="1.15" stroke-opacity="0.3" stroke-linecap="round" d="M${Math.round(w * 0.74)} ${h} Q${Math.round(w * 0.48)} ${Math.round(h * 0.52)} ${Math.round(w * 0.06)} ${Math.round(h * 0.22)}"/>` +
    `<path fill="none" stroke="${mixHexWithWhite(periDeep, 0.12)}" stroke-width="0.9" stroke-opacity="0.24" stroke-linecap="round" d="M0 ${Math.round(h * 0.38)} Q${Math.round(w * 0.32)} ${Math.round(h * 0.08)} ${Math.round(w * 0.55)} 0"/>` +
    `<ellipse cx="${Math.round(w * 0.2)}" cy="${Math.round(h * 0.58)}" rx="${Math.round(w * 0.24)}" ry="${Math.round(h * 0.34)}" fill="${ellFill}" fill-opacity="0.075"/>` +
    `<ellipse cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.42)}" rx="${Math.round(w * 0.2)}" ry="${Math.round(h * 0.22)}" fill="${white}" fill-opacity="0.065"/>` +
    `<circle cx="${Math.round(w * 0.44)}" cy="${Math.round(h * 0.9)}" r="4.2" fill="${sage}" fill-opacity="0.14"/>` +
    `<circle cx="${Math.round(w * 0.58)}" cy="${Math.round(h * 0.08)}" r="3.2" fill="${white}" fill-opacity="0.16"/>` +
    `<circle cx="${Math.round(w * 0.92)}" cy="${Math.round(h * 0.62)}" r="2.4" fill="${sageMist}" fill-opacity="0.12"/>` +
    `</svg>`;
  return svgDataUri(svg);
}

/** Layout 19 — periwinkle field + sage accents + SVG doodles (Figma creative card reference). */
function buildTemplate19PaletteContext(c1, c2, c3, c4) {
  const peri = String(c1 || '#8a94f8').trim();
  const periDeep = String(c2 || '#6f78e8').trim();
  const sage = String(c3 || '#bed896').trim();
  const ink = String(c4 || '#000000').trim();
  const saturn = '#f5e6a3';
  const white = '#ffffff';
  const swirlStroke = mixHexWithBlack(peri, 0.32);
  const swirl2 = mixHexWithBlack(peri, 0.26);
  const swirlSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">` +
    `<path d="M280 60c40 80-20 200-140 220c-90 14-150-40-130-110c16-58 88-72 150-40" stroke="${swirlStroke}" stroke-width="28" stroke-linecap="round" opacity="0.14"/>` +
    `<path d="M40 340c80-100 180-120 260-200c48-52 72-120 48-168" stroke="${swirl2}" stroke-width="20" stroke-linecap="round" fill="none" opacity="0.09"/>` +
    `</svg>`;
  const h19 = T19_CARD_HEIGHT_PX;
  const moon = mixHexWithWhite(periDeep, 0.12);
  const ringBlend = mixHexPair(white, sage, 0.45);
  const rightPanelSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="${h19}" viewBox="0 0 240 ${h19}" fill="none">` +
    `<defs>` +
    `<radialGradient id="t19rp1" cx="88%" cy="78%" r="58%">` +
    `<stop offset="0%" stop-color="${sage}" stop-opacity="0.32"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="t19rp2" cx="12%" cy="18%" r="48%">` +
    `<stop offset="0%" stop-color="${white}" stop-opacity="0.24"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<linearGradient id="t19rp3" x1="0%" y1="100%" x2="100%" y2="0%">` +
    `<stop offset="0%" stop-color="${periDeep}" stop-opacity="0"/>` +
    `<stop offset="55%" stop-color="${peri}" stop-opacity="0.12"/>` +
    `<stop offset="100%" stop-opacity="0"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<rect width="240" height="${h19}" fill="url(#t19rp1)"/>` +
    `<rect width="240" height="${h19}" fill="url(#t19rp2)"/>` +
    `<rect width="240" height="${h19}" fill="url(#t19rp3)"/>` +
    `<path d="M-12 ${Math.round(h19 * 0.52)} C52 ${Math.round(h19 * 0.22)} 118 ${Math.round(h19 * 0.38)} 252 ${Math.round(h19 * 0.06)}" stroke="${ringBlend}" stroke-width="2.4" stroke-opacity="0.38" stroke-linecap="round" fill="none"/>` +
    `<path d="M8 ${Math.round(h19 * 0.92)} Q96 ${Math.round(h19 * 0.72)} 188 ${Math.round(h19 * 0.78)} T236 ${Math.round(h19 * 0.55)}" stroke="${white}" stroke-width="1.5" stroke-opacity="0.22" stroke-linecap="round" fill="none"/>` +
    `<ellipse cx="198" cy="46" rx="36" ry="32" stroke="${white}" stroke-width="1.5" stroke-opacity="0.34" fill="none"/>` +
    `<ellipse cx="202" cy="50" rx="23" ry="21" stroke="${sage}" stroke-width="1.25" stroke-opacity="0.5" fill="none"/>` +
    `<circle cx="36" cy="${Math.round(h19 * 0.7)}" r="20" fill="${sage}" fill-opacity="0.14"/>` +
    `<circle cx="214" cy="${Math.round(h19 * 0.86)}" r="30" fill="${white}" fill-opacity="0.07"/>` +
    `<circle cx="170" cy="116" r="3.4" fill="${white}" fill-opacity="0.52"/>` +
    `<circle cx="152" cy="92" r="2.1" fill="${sage}" fill-opacity="0.58"/>` +
    `<circle cx="220" cy="128" r="2.6" fill="${white}" fill-opacity="0.42"/>` +
    `<circle cx="138" cy="138" r="1.9" fill="${moon}" fill-opacity="0.4"/>` +
    `<circle cx="192" cy="166" r="2.3" fill="${sage}" fill-opacity="0.45"/>` +
    `<circle cx="230" cy="56" r="2" fill="${white}" fill-opacity="0.48"/>` +
    `<circle cx="124" cy="68" r="1.6" fill="${white}" fill-opacity="0.35"/>` +
    `<path d="M224 20l3.2 7.5 7.8 3.2-7.8 3-3.2 7.8-3-7.8-7.8-3 7.8-3.2z" fill="${white}" fill-opacity="0.36"/>` +
    `</svg>`;
  const saturnSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="10" ry="10" stroke="${saturn}" stroke-width="2.2"/><ellipse cx="24" cy="26" rx="22" ry="7" stroke="${saturn}" stroke-width="2" transform="rotate(-12 24 26)"/></svg>`;
  const puzzleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30" fill="none"><g fill="${white}" fill-opacity="0.95"><rect x="7" y="7" width="17" height="16" rx="2.2"/><circle cx="27.5" cy="15" r="6"/></g><path d="M2 11L0 9M3 6L1 4M6 3L4 1" stroke="${white}" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.78"/></svg>`;
  const scribbleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120" fill="none"><path d="M165 95 C 120 100 70 90 45 55 C 25 30 30 8 55 12 C 85 18 95 55 130 48 C 168 40 188 12 172 4" stroke="${sage}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const sparkleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="${white}" d="M16 2 L18.5 12.5 L29 16 L18.5 19.5 L16 30 L13.5 19.5 L3 16 L13.5 12.5 Z"/></svg>`;
  const phBg = mixHexPair(sage, periDeep, 0.35);
  const ic = contactStrokeIconDataUrisCompact(ink);
  const t19DeckUri = buildTemplate19DeckBackground(peri, periDeep, sage, white);
  return {
    t19_bg: peri,
    t19_sage: sage,
    t19_ink: ink,
    t19_white: white,
    t19_frame_ring: peri,
    t19_deck_uri: t19DeckUri,
    t19_saturn_uri: svgDataUri(saturnSvg),
    t19_puzzle_uri: svgDataUri(puzzleSvg),
    t19_swirl_uri: svgDataUri(swirlSvg),
    t19_right_panel_uri: svgDataUri(rightPanelSvg),
    t19_scribble_uri: svgDataUri(scribbleSvg),
    t19_sparkle_uri: svgDataUri(sparkleSvg),
    t19_photo_placeholder_bg: phBg,
    t19_photo_placeholder_color: ink,
    t19_icon_pin: ic.pin,
    t19_icon_phone: ic.phone,
    t19_icon_mail: ic.mail,
    t19_icon_globe: ic.globe,
  };
}

/** Layout 20 — dark field + accent swirl (palette c1/c2/c3; no fixed green deck). */
function buildTemplate20PaletteContext(c1, c2, c3, c4) {
  const neon = String(c1 || '#39FF14').trim();
  const bg0 = String(c2 || '#051a05').trim();
  const mint = String(c3 || '#9ee89e').trim();
  const meshTint = mixHexPair(neon, bg0, 0.12);
  const w = T20_CARD_WIDTH_PX;
  const h = T20_CARD_HEIGHT_PX;
  /** Radial stops follow primary + secondary so palette swaps re-tint the whole field. */
  const innerGlow = mixHexPair(mixHexWithBlack(neon, 0.36), bg0, 0.38);
  const deepRing = mixHexPair(mixHexWithBlack(neon, 0.2), bg0, 0.58);
  const glowRgb = template14PrimaryRgbForGlow(neon);
  const fieldSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">` +
    `<defs>` +
    `<radialGradient id="t20rg" cx="50%" cy="40%" r="78%" fx="50%" fy="40%">` +
    `<stop offset="0%" stop-color="${innerGlow}"/>` +
    `<stop offset="42%" stop-color="${deepRing}"/>` +
    `<stop offset="100%" stop-color="${mixHexWithBlack(bg0, 0.45)}"/>` +
    `</radialGradient>` +
    `<pattern id="t20hx" width="28" height="48.5" patternUnits="userSpaceOnUse">` +
    `<path d="M14 44L0 36V12L14 4l14 8v24L14 44z" fill="none" stroke="${meshTint}" stroke-width="0.35" opacity="0.55"/>` +
    `</pattern>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="url(#t20rg)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#t20hx)" opacity="0.2"/>` +
    `</svg>`;
  const swirlPath =
    'M210 -36 C135 32 255 68 198 118 C135 168 72 138 48 92 C28 58 102 34 158 58 C222 88 265 158 328 178 C368 190 398 142 408 98';
  const swirlSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="280" viewBox="0 0 420 280" preserveAspectRatio="xMidYMid meet" fill="none">` +
    `<path d="${swirlPath}" stroke="${neon}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.12"/>` +
    `<path d="${swirlPath}" stroke="${neon}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>` +
    `<path d="${swirlPath}" stroke="${neon}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>` +
    `</svg>`;
  const softN = mixHexWithWhite(neon, 0.38);
  const rail = mixHexPair(neon, mint, 0.45);
  const hx = Math.round(w * 0.5);
  const hy = Math.round(h * 0.42);
  const decoSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">` +
    `<path d="M14 32V14h18" stroke="${neon}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.38"/>` +
    `<path d="M14 ${h - 30}v18h16" stroke="${neon}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" opacity="0.26"/>` +
    `<path d="M${w - 20} 18v20h-16" stroke="${neon}" stroke-width="1.35" stroke-linecap="round" opacity="0.28"/>` +
    `<path d="M0 ${Math.round(h * 0.52)} C${Math.round(w * 0.18)} ${Math.round(h * 0.28)} ${Math.round(w * 0.32)} ${Math.round(h * 0.62)} ${Math.round(w * 0.42)} ${Math.round(h * 0.35)}" stroke="${softN}" stroke-width="1" stroke-linecap="round" opacity="0.14"/>` +
    `<path d="M${Math.round(w * 0.48)} 0 Q${hx} ${hy} ${Math.round(w * 0.62)} ${h}" stroke="${softN}" stroke-width="0.9" opacity="0.1"/>` +
    `<circle cx="32" cy="54" r="2" fill="${neon}" opacity="0.42"/>` +
    `<circle cx="48" cy="48" r="1.2" fill="${mint}" opacity="0.5"/>` +
    `<circle cx="40" cy="66" r="1" fill="${softN}" opacity="0.45"/>` +
    `<circle cx="${w - 52}" cy="26" r="2.2" stroke="${neon}" stroke-width="1.1" fill="none" opacity="0.4"/>` +
    `<circle cx="${w - 34}" cy="42" r="1.4" fill="${neon}" opacity="0.32"/>` +
    `<path d="M${w - 28} 72 Q${w - 6} 98 ${w - 58} ${h - 14}" stroke="${rail}" stroke-width="1" stroke-dasharray="3 5" stroke-linecap="round" opacity="0.22"/>` +
    `<path d="M${hx - 6} 8l6 10 6-10-6-10z" fill="${neon}" opacity="0.2"/>` +
    `<path d="M${Math.round(w * 0.56)} ${h - 6} L${Math.round(w * 0.72)} ${h - 10} L${w - 32} ${h - 5}" stroke="${neon}" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" opacity="0.24" fill="none"/>` +
    `</svg>`;
  const ic = contactStrokeIconDataUrisCompact(neon);
  const roleGradStart = mixHexPair(bg0, neon, 0.2);
  const roleGradEnd = mixHexPair(neon, mint, 0.35);
  const phBg = mixHexWithBlack(bg0, 0.32);
  return {
    t20_bg: bg0,
    t20_neon: neon,
    t20_field_uri: svgDataUri(fieldSvg),
    t20_swirl_uri: svgDataUri(swirlSvg),
    t20_deco_uri: svgDataUri(decoSvg),
    t20_name_color: '#f0f4f0',
    t20_row_color: '#ffffff',
    t20_role_grad_start: roleGradStart,
    t20_role_grad_end: roleGradEnd,
    t20_role_text_color: '#ffffff',
    t20_icon_pin: ic.pin,
    t20_icon_mail: ic.mail,
    t20_icon_globe: ic.globe,
    t20_icon_phone: ic.phone,
    t20_photo_placeholder_bg: phBg,
    t20_photo_placeholder_color: '#ffffff',
    /** `r,g,b` for `rgba({{t20_glow_rgb}},a)` on contact icon drop-shadows — matches primary accent. */
    t20_glow_rgb: glowRgb,
  };
}

/**
 * Layout 3 — teal quarters + top arc, 8×3 light-teal dot grids, white-on-black contact icons,
 * social glyphs (FB / mail / dribbble / X).
 */
function buildTemplate3DecorDataUris(primaryHex) {
  const teal = String(primaryHex || '#2bbecb').trim();
  const lightTeal = mixHexWithWhite(teal, 0.52);
  const dotGrid = (fill, cols, rows, gap, r) => {
    let body = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        body += `<circle cx="${x * gap + gap / 2}" cy="${y * gap + gap / 2}" r="${r}" fill="${fill}"/>`;
      }
    }
    const w = cols * gap;
    const h = rows * gap;
    return svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
    );
  };
  const decoTl = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><circle cx="0" cy="0" r="52" fill="${teal}"/></svg>`
  );
  /** Shallow crest (not a full 64px semicircle) so the headshot stays visible when table z-index stacking varies. */
  const decoTopArc = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="24" viewBox="0 0 128 24" preserveAspectRatio="none"><path d="M0 24 Q64 2 128 24 Z" fill="${teal}"/></svg>`
  );
  const decoBr = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70"><circle cx="70" cy="70" r="70" fill="${teal}"/></svg>`
  );
  const wicons = contactStrokeIconDataUrisCompact('#ffffff');
  const fb = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"/></svg>`;
  const mailGlyph = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>`;
  const drib = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><circle cx="7.5" cy="12" r="3.2"/><circle cx="17" cy="7" r="3.2"/><circle cx="15.5" cy="17" r="3.2"/></svg>`;
  const tw = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  return {
    t3_deco_tl: decoTl,
    t3_deco_top_arc: decoTopArc,
    t3_deco_br: decoBr,
    t3_dots_bl: dotGrid(lightTeal, 8, 3, 7, 1.35),
    t3_dots_tr: dotGrid(lightTeal, 8, 3, 7, 1.35),
    t3_icon_phone: wicons.phone,
    t3_icon_globe: wicons.globe,
    t3_icon_mail: wicons.mail,
    t3_icon_pin: wicons.pin,
    t3_soc_facebook: svgDataUri(fb),
    t3_soc_mail: svgDataUri(mailGlyph),
    t3_soc_dribbble: svgDataUri(drib),
    t3_soc_twitter: svgDataUri(tw),
    t3_title_muted: '#9ca3af',
  };
}

function nameInitialsFromFullName(raw) {
  const parts = String(raw || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length) return parts[0].slice(0, 2).toUpperCase();
  return '?';
}

function stripClassAttributes(html) {
  return html.replace(/\sclass\s*=\s*"[^"]*"/gi, '').replace(/\sclass\s*=\s*'[^']*'/gi, '');
}

/**
 * Optional outer shell when there is **no** CTA (single block). `contenteditable="false"` keeps
 * pasted blocks from opening as editable text in Gmail / Outlook compose.
 */
function wrapEmailSignatureRootTable(html) {
  const t = String(html || '').trim();
  if (!t) return t;
  const rootShellStyle =
    'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;max-width:100%;' +
    'width:100%;display:table;float:none;margin:0;padding:0;border:0;';
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" contenteditable="false" data-sig-root="signature" ' +
    `style="${rootShellStyle}">` +
    '<tr><td contenteditable="false" style="padding:0;margin:0;border:0;">' +
    t +
    '</td></tr></table>'
  );
}

function inferBundleRailPxFromSigChunk(sigChunk) {
  const s = String(sigChunk || '');
  const m = s.match(/width\s*:\s*(\d{2,4})\s*px/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (!Number.isNaN(n) && n >= 300 && n <= 1200) return n;
  }
  return SIG_LAYOUT_RAIL_PX;
}

/**
 * Paste-friendly gap: fixed-height spacer `<table>` (own block) + `<br>`. Outlook/Word often merge
 * adjacent presentation tables; the `<br>` + explicit `td height` breaks the run into separate blocks.
 */
function pasteRootBlockSeparator(railPx, gapPx = 20) {
  const w = Number(railPx) || SIG_LAYOUT_RAIL_PX;
  const h = Math.max(12, Math.min(32, Number(gapPx) || 20));
  const t =
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" contenteditable="false" ' +
    `width="${w}" data-sig-root="sig-spacer" ` +
    `style="width:${w}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;` +
    `margin:0;padding:0;border:0;">` +
    `<tr><td contenteditable="false" height="${h}" style="height:${h}px;line-height:${h}px;font-size:${h}px;mso-line-height-rule:exactly;` +
    `padding:0;margin:0;border:0;">&nbsp;</td></tr></table>`;
  return `${t}<br>`;
}

/**
 * With CTA: never wrap signature + banners in one outer table — {@link appendBanner} emits sibling
 * `<table data-sig-part="signature|banner">` only. This step inserts a spacer table + `<br>` after the
 * signature and between each CTA root (paste into Outlook / Apple Mail / Gmail).
 * Signature-only: one optional outer shell via {@link wrapEmailSignatureRootTable}.
 */
function finalizeSignatureRoots(html) {
  const t = String(html || '').trim();
  if (!t) return t;
  const re = /<table\b[^>]*\bdata-sig-part\s*=\s*["']banner["']/i;
  let idx = t.search(re);
  if (idx < 0) {
    const q = t.indexOf('data-sig-part="banner"');
    const q2 = t.indexOf("data-sig-part='banner'");
    const hit = q >= 0 ? q : q2;
    if (hit >= 0) {
      const before = t.slice(0, hit);
      const tableStart = before.lastIndexOf('<table');
      idx = tableStart >= 0 ? tableStart : hit;
    }
  }
  if (idx <= 0) return wrapEmailSignatureRootTable(t);
  const sigChunk = t.slice(0, idx).trim();
  const banChunkRaw = t.slice(idx).trim();
  if (!sigChunk || !banChunkRaw) return wrapEmailSignatureRootTable(t);
  const rail = inferBundleRailPxFromSigChunk(sigChunk);
  const sep = pasteRootBlockSeparator(rail, 20);
  const banChunk = intersperseBrBetweenBannerPartTables(banChunkRaw, sep);
  return sigChunk + sep + banChunk;
}

/**
 * Placeholder content when the user has not filled a field yet — keeps layouts (photo, logo,
 * contact rows) visible in the editor and in email output until replaced.
 * Mirrors client `DEMO_SIGNATURE_DATA` in templatePreviews.js.
 */
const DEMO_FORM_DEFAULTS = {
  fullName: 'James Doe',
  jobTitle: 'Software Engineer',
  companyName: 'Acme Studio',
  phone: '+(91) 9865456739',
  email: 'james.doe@example.com',
  website: 'www.example.com',
  address: 'Office 60,\nCalicut\nkerala, India',
  photoUrl: 'https://i.pravatar.cc/160?img=12',
  logoUrl: 'https://dummyimage.com/180x36/4752c4/ffffff.png&text=Logo',
  signatureImageUrl: '',
};

const DEMO_PALETTE_DEFAULTS = {
  primary: '#5768f3',
  secondary: '#4752c4',
  accent: '#b4b9ff',
  text: '#0f172a',
};

/** Filled with demo text when empty so the editor still looks populated. */
const DEMO_FORM_TEXT_KEYS = [
  'fullName',
  'jobTitle',
  'companyName',
  'photoUrl',
  'logoUrl',
  'signatureImageUrl',
];
/** Contact lines: leave empty when the user clears them so rows stay hidden in templates ({{#if phone}} etc.). */
const DEMO_FORM_CONTACT_KEYS = ['phone', 'email', 'website', 'address'];

function mergeEditorFormWithDemoDefaults(form, options = {}) {
  const { omitLogoDemo = false, omitCompanyDemo = false } = options;
  const f = { ...(form || {}) };
  const d = DEMO_FORM_DEFAULTS;
  for (const key of DEMO_FORM_CONTACT_KEYS) {
    const v = f[key];
    if (v == null || (typeof v === 'string' && !String(v).trim())) {
      f[key] = '';
    }
  }
  for (const key of DEMO_FORM_TEXT_KEYS) {
    if (omitLogoDemo && key === 'logoUrl') {
      const v = f[key];
      if (v == null || (typeof v === 'string' && !String(v).trim())) {
        f[key] = '';
      }
      continue;
    }
    if (omitCompanyDemo && key === 'companyName') {
      const v = f[key];
      if (v == null || (typeof v === 'string' && !String(v).trim())) {
        f[key] = '';
      }
      continue;
    }
    const v = f[key];
    if (v == null || (typeof v === 'string' && !String(v).trim())) {
      f[key] = d[key];
    }
  }
  return f;
}

function mergePaletteWithDemoDefaults(palette) {
  const p = { ...(palette || {}) };
  const d = DEMO_PALETTE_DEFAULTS;
  for (const key of ['primary', 'secondary', 'accent', 'text']) {
    if (!p[key] || !String(p[key]).trim()) {
      p[key] = d[key];
    }
  }
  return p;
}

/** Logo lockup: first word / remainder (e.g. “Globex Records”). */
function splitCompanyLogoLines(raw) {
  const s = String(raw || '').trim();
  if (!s) return { line1: '', line2: '' };
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return { line1: parts[0], line2: parts.slice(1).join(' ') };
  return { line1: s, line2: '' };
}

/** Layout 4 — default logo when user has none (HTTPS). Card bg + icons come from {@link buildTemplate4PaletteContext}. */
const T4_DEFAULT_BRAND_MARK =
  'https://static.codia.ai/s/image_61472c89-03c2-459d-b9dc-362d5ea3c77d.png';

function splitDisplayName(raw) {
  const parts = String(raw || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    name_line1: parts[0] || '',
    name_line2: parts.slice(1).join(' ') || '',
  };
}

/**
 * Layout 15 hero headline: **at most two lines** (explicit `<br>` only; no extra wraps).
 * Honors user newlines; otherwise balances multi-word names across two lines; splits one long token near the middle.
 */
function splitDisplayNameTwoLinesMax(raw) {
  const s = String(raw || '').trim();
  if (!s) return { line1: '', line2: '' };
  const nl = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (nl.length >= 2) {
    return { line1: nl[0], line2: nl.slice(1).join(' ') };
  }
  const words = nl[0].split(/\s+/).filter(Boolean);
  if (words.length === 0) return { line1: '', line2: '' };
  if (words.length === 1) {
    const w = words[0];
    if (w.length <= 16) return { line1: w, line2: '' };
    const mid = Math.ceil(w.length / 2);
    return { line1: w.slice(0, mid), line2: w.slice(mid) };
  }
  if (words.length === 2) return { line1: words[0], line2: words[1] };
  const k = Math.ceil(words.length / 2);
  return { line1: words.slice(0, k).join(' '), line2: words.slice(k).join(' ') };
}

/**
 * **Two lines max** for all signature templates (first `<br>` only; extra chunks folded into line 2).
 * Newlines take priority; otherwise comma-separated segments. `address_line3` stays empty for Handlebars compatibility.
 */
function splitAddressLines(raw) {
  const empty = { address_line1: '', address_line2: '', address_line3: '' };
  const s = String(raw || '').trim();
  if (!s) return empty;
  const lines = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return empty;
  if (lines.length >= 2) {
    return {
      address_line1: lines[0],
      address_line2: lines.slice(1).join(', '),
      address_line3: '',
    };
  }
  const parts = lines[0].split(',').map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      address_line1: parts[0],
      address_line2: parts.slice(1).join(', '),
      address_line3: '',
    };
  }
  if (parts.length === 2) {
    return { address_line1: parts[0], address_line2: parts[1], address_line3: '' };
  }
  return { address_line1: lines[0], address_line2: '', address_line3: '' };
}

/**
 * Layout 20 — address area: merge structured lines, fold to at most one `<br>` (two visual lines),
 * then cap each line so wrapping cannot sprawl in the narrow column.
 * Normalizes commas: {@link splitAddressLines} may leave a trailing comma on line 1; joining with ", "
 * would otherwise produce ",," in the merged string.
 */
function splitAddressTwoLinesForT20(addrRaw) {
  const base = splitAddressLines(addrRaw);
  const segs = [base.address_line1, base.address_line2, base.address_line3]
    .map((x) =>
      String(x || '')
        .trim()
        .replace(/^,+\s*/g, '')
        .replace(/,+\s*$/g, '')
        .trim()
    )
    .filter(Boolean);
  const combined = segs
    .join(', ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,+/g, ', ')
    .replace(/^\s*,\s*/, '')
    .replace(/\s*,\s*$/g, '')
    .trim();
  if (!combined) {
    return { line1: '', line2: '', hasLine2: false };
  }
  const sp = splitIntroTwoLines(combined);
  const cap = (s, max) => {
    const t = String(s || '').trim();
    if (t.length <= max) return t;
    return `${t.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
  };
  const line1 = cap(sp.l1, 52);
  const line2Raw = String(sp.l2 || '').trim();
  const line2 = line2Raw ? cap(line2Raw, 56) : '';
  return {
    line1,
    line2,
    hasLine2: Boolean(line2),
  };
}

/** Layout 11 intro — two short lines (newline or soft wrap) under the name. */
function splitIntroTwoLines(raw) {
  const s = String(raw || '').trim();
  if (!s) return { l1: '', l2: '' };
  const lines = s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  if (lines.length >= 2) return { l1: lines[0], l2: lines.slice(1).join(' ') };
  if (s.length <= 48) return { l1: s, l2: '' };
  let cut = s.slice(0, 48).lastIndexOf(' ');
  if (cut < 24) cut = 48;
  return { l1: s.slice(0, cut).trim(), l2: s.slice(cut).trim() };
}

/** Puts country code like +(91) on its own line above the number when spaced that way. */
function splitPhoneDisplay(raw) {
  const s = String(raw || '').trim();
  if (!s) return { phone_line1: '', phone_line2: '' };
  const m = s.match(/^(\+\(\d{1,4}\))\s+(.+)$/);
  if (m) return { phone_line1: m[1], phone_line2: m[2] };
  const m2 = s.match(/^(\+\(\d{1,4}\))(.+)$/);
  if (m2 && m2[2].trim()) return { phone_line1: m2[1], phone_line2: m2[2].trim() };
  return { phone_line1: s, phone_line2: '' };
}

/** Build Handlebars context from editor API payload: `{ templateId, form, palette, banner }`. */
function contextFromEditorPayload(payload) {
  const templateKey = resolveTemplateKey(payload.templateId || payload.template_id);
  const meta = TEMPLATE_META[templateKey] || TEMPLATE_META.template_1;
  const isTemplate4 = templateKey === 'template_4';
  const isTemplate16 = templateKey === 'template_16';
  const isTemplate17 = templateKey === 'template_17';
  const isTemplate18 = templateKey === 'template_18';
  const isTemplate19 = templateKey === 'template_19';
  const isTemplate20 = templateKey === 'template_20';
  /** Layout 4 uses its own brand mark + no logo/company demo placeholders. */
  const omitLogoDemo = meta.has_logo === false || isTemplate4;
  let f = mergeEditorFormWithDemoDefaults(payload.form || {}, {
    omitLogoDemo,
    omitCompanyDemo: isTemplate4,
  });
  if (isTemplate4) {
    const lu = String(f.logoUrl || '').trim();
    if (/dummyimage\.com[^\s"']*text=(?:Core|Logo)/i.test(lu)) {
      f = { ...f, logoUrl: '' };
    }
  }
  if (isTemplate16 || isTemplate17 || isTemplate18 || isTemplate19 || isTemplate20) {
    const lu16 = String(f.logoUrl || '').trim();
    if (/dummyimage\.com/i.test(lu16)) {
      f = { ...f, logoUrl: '' };
    }
  }
  const p = mergePaletteWithDemoDefaults(payload.palette || {});
  const d = payload.design || {};
  const websiteRaw = String(f.website || '').trim();
  const websiteFull = websiteRaw ? ensureHttps(websiteRaw) : '';
  const websiteDisplay = websiteRaw.replace(/^https?:\/\//i, '');
  const { name_line1, name_line2 } = splitDisplayName(f.fullName || '');

  const linkedinUrl = ensureHttps(String(f.linkedin || '').trim());
  const twitterUrl = ensureHttps(String(f.twitter || '').trim());
  const instagramUrl = ensureHttps(String(f.instagram || '').trim());
  const githubUrl = ensureHttps(String(f.github || '').trim());
  const facebookUrl = ensureHttps(String(f.facebook || '').trim());
  const telegramUrl = ensureHttps(String(f.telegram || '').trim());
  const mediumUrl = ensureHttps(String(f.medium || '').trim());

  const photoUrl = ensureHttps(String(f.photoUrl || '').trim());
  const logoUrl = ensureHttps(String(f.logoUrl || '').trim());

  const linkRaw = String(f.signatureLinkUrl || '').trim();
  const wrapHref =
    (f.entireSignatureClickable || linkRaw) && linkRaw ? ensureHttps(f.signatureLinkUrl) : '';

  const companyRaw = String(f.companyName || '').trim();
  const companyLines = companyRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const t10_company_display = (companyLines[0] || companyRaw).trim();
  const t10_tagline_text =
    companyLines.length > 1
      ? companyLines.slice(1).join(' ').trim()
      : String(f.tagline || '').trim();
  const t11_intro_split = splitIntroTwoLines(t10_tagline_text);
  const jobTitleRaw = String(f.jobTitle || '').trim();
  const jobTitleParts = jobTitleRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const t11_job_primary = jobTitleParts[0] || jobTitleRaw;
  const t11_corner_role = jobTitleParts.length > 1 ? jobTitleParts.slice(1).join(' ') : '';
  const has_t11_corner_role = Boolean(String(t11_corner_role || '').trim());
  const addrRaw = String(f.address || '').trim();
  const { address_line1, address_line2, address_line3 } = splitAddressLines(addrRaw);
  const t20AddrT20 = splitAddressTwoLinesForT20(addrRaw);
  const phoneRaw = String(f.phone || '').trim();
  const { phone_line1, phone_line2 } = splitPhoneDisplay(phoneRaw);

  const c1 = p.primary || '#1e3a5f';
  const c2 = p.secondary || '#2d6a9f';
  const c3 = p.accent || '#a8d4f5';
  const c4 = p.text || p.neutral || '#0f172a';
  const iconPrimary = contactStrokeIconDataUris(c1);
  const bodyStroke = pickContactRowIconStroke(c1, c2);
  const iconBody = contactStrokeIconDataUris(bodyStroke);
  const title_on_card = pickDarkestReadable([c2, c1, c4], 0.52);
  const company_muted = companyMutedColor(c4, c2);
  const divider_soft = mixHexWithWhite(c1, 0.7);
  const photo_ring_bg = photoRingBackground(c3);
  const sig_card_surface = signatureCardSurface(c4);
  const t2_divider_color = '#d1d5db';
  const t2_muted = template2BodyText(c4);
  const icon_l2 = contactStrokeIconDataUrisCompact(c1);
  const deco_geo_url = buildGeoDecoDataUri(c1, c2, c3);
  const deco_floral_url = buildFloralDecoDataUri(c1, c2, c3);
  const header_bar_bg = headerBarBackground(c1, c2);
  const t3 = buildTemplate3DecorDataUris(c1);
  const name_initials = nameInitialsFromFullName(f.fullName || '');
  const t3_name_first_upper = String(name_line1 || '').toUpperCase();
  const t3_name_last_upper = String(name_line2 || '').toUpperCase();
  const t3_has_name_last = Boolean(String(name_line2 || '').trim());
  const t13_has_name_second_line = Boolean(String(name_line2 || '').trim());
  const t13_name_line1_upper = String(name_line1 || '').toUpperCase();
  const t13_name_line2_upper = String(name_line2 || '').toUpperCase();
  const t13_title_upper = String(jobTitleRaw || '').toUpperCase();
  const jobTitlePartsT14 = jobTitleRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  let t14_job_line1 = '';
  let t14_job_line2 = '';
  let t14_has_job_line2 = false;
  if (jobTitlePartsT14.length >= 2) {
    t14_job_line1 = jobTitlePartsT14[0];
    t14_job_line2 = jobTitlePartsT14.slice(1).join(' ');
    t14_has_job_line2 = true;
  } else if (jobTitleRaw.trim()) {
    const sp14 = splitIntroTwoLines(jobTitleRaw);
    t14_job_line1 = sp14.l1;
    t14_job_line2 = sp14.l2;
    t14_has_job_line2 = Boolean(String(sp14.l2 || '').trim());
  }
  const t14_has_name_line2 = Boolean(String(name_line2 || '').trim());
  const t3_company_upper = String(companyRaw || '').toUpperCase();
  const t3_tagline_upper = String(websiteDisplay || '').toUpperCase();
  const has_t3_tagline = Boolean(String(websiteDisplay || '').trim());
  const emailTrim = String(f.email || '').trim();
  const t3_mailto_href = emailTrim ? `mailto:${emailTrim.replace(/^mailto:/i, '')}` : '';
  const t4_mailto_href = t3_mailto_href;
  const t4co = splitCompanyLogoLines(companyRaw);
  const t4_logo_src = logoUrl || T4_DEFAULT_BRAND_MARK;
  const t6FbDisp = displayUrlWithoutScheme(facebookUrl);
  const t6WebDisp = websiteDisplay;
  const t6_row1_right_display = t6FbDisp || t6WebDisp || '';
  const t6_row1_right_href = facebookUrl || (websiteRaw && websiteFull ? websiteFull : '');
  const has_t6_row1_right = Boolean(String(t6_row1_right_display).trim());

  const t15Display = splitDisplayNameTwoLinesMax(f.fullName || '');
  const t15_name_line1_upper = String(t15Display.line1 || '').toUpperCase();
  const t15_name_line2_upper = String(t15Display.line2 || '').toUpperCase();
  const t15_has_name_line2 = Boolean(String(t15Display.line2 || '').trim());
  const t15_job_pill_text = escapeHtml(String(jobTitleRaw || '').trim().toUpperCase());
  const t15_has_contact_body = !!(
    String(phoneRaw || '').trim() ||
    emailTrim ||
    (websiteRaw && websiteFull)
  );

  const t15MutedHex = String(c4 || '#757575').trim();
  const t15AddrParts = [address_line1, address_line2, address_line3]
    .map((x) => String(x || '').trim())
    .filter(Boolean);
  let t15_address_body_html = '';
  if (addrRaw) {
    const nl = addrRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    if (nl.length >= 2) {
      t15_address_body_html = nl.map((p) => escapeHtml(p)).join(' / ');
    } else if (t15AddrParts.length) {
      t15_address_body_html = t15AddrParts.map((p) => escapeHtml(p)).join(' / ');
    }
  }
  const t15ContactChunks = [];
  if (String(phoneRaw || '').trim()) {
    t15ContactChunks.push(escapeHtml(String(phoneRaw).trim()));
  }
  if (emailTrim) {
    t15ContactChunks.push(
      emailTrim && t3_mailto_href
        ? `<a href="${escapeHtml(t3_mailto_href)}" style="color:${t15MutedHex};text-decoration:none;">${escapeHtml(emailTrim)}</a>`
        : escapeHtml(emailTrim)
    );
  }
  if (websiteRaw && websiteFull && websiteDisplay) {
    t15ContactChunks.push(
      `<a href="${escapeHtml(websiteFull)}" style="color:${t15MutedHex};text-decoration:none;">${escapeHtml(websiteDisplay)}</a>`
    );
  }
  const t15_contact_body_html = t15ContactChunks.join(` <span style="color:${t15MutedHex};">/</span> `);
  const t15_show_company_in_tab =
    !!String(companyRaw || '').trim() && !/^core$/i.test(String(companyRaw || '').trim());

  const t16_lockup_upper = escapeHtml(
    String((companyLines[0] || companyRaw || 'LOGO HERE')).trim().toUpperCase()
  );
  const telDigitsRaw = String(phoneRaw || '').replace(/[^\d+]/g, '');
  const t16_tel_href = telDigitsRaw ? `tel:${telDigitsRaw.replace(/^\+{2,}/g, '+')}` : '';
  const t17_tel_href = t16_tel_href;
  const t18_tel_href = t16_tel_href;
  /** Layout 18 headline: person's name (full name → first line → company fallback). */
  const t18_brand_base = String((f.fullName || name_line1 || companyRaw) || '').trim();
  const t18_brand_line = t18_brand_base
    ? t18_brand_base.endsWith('.')
      ? t18_brand_base
      : `${t18_brand_base}.`
    : 'Your brand.';
  /** Layout 18 contact grid: row1 = address | email, row2 = phone | website (aligned baselines). */
  const t18_has_contact_row1 = !!addrRaw || !!emailTrim;
  const t18_has_contact_row2 = !!String(phoneRaw || '').trim() || !!(websiteRaw && websiteFull);
  const t19_tel_href = t16_tel_href;
  const t19_has_contact_row1 = t18_has_contact_row1;
  const t19_has_contact_row2 = t18_has_contact_row2;
  const taglineTrim = String(f.tagline || '').trim();
  const t20NameSplit = splitDisplayNameTwoLinesMax(f.fullName || '');
  const t20_name_line1_upper = String(t20NameSplit.line1 || '').toUpperCase();
  const t20_name_line2_upper = String(t20NameSplit.line2 || '').toUpperCase();
  const t20_has_name_line2 = Boolean(String(t20NameSplit.line2 || '').trim());
  const t20_role_text = String(f.jobTitle || '').trim().toUpperCase();
  const t20_tel_href = t16_tel_href;
  const has_t16_web_mail = Boolean(
    (websiteRaw && websiteFull) || String(f.email || '').trim()
  );
  return {
    primary_color: c1,
    secondary_color: c2,
    name: String(f.fullName || ''),
    title: String(f.jobTitle || ''),
    company_name: companyRaw,
    linkedin: linkedinUrl,
    medium: mediumUrl,
    twitter: twitterUrl,
    github: githubUrl,

    full_name: String(f.fullName || ''),
    job_title: String(f.jobTitle || ''),
    company: companyRaw,
    has_company: !!companyRaw,
    phone: phoneRaw,
    phone_line1,
    phone_line2,
    email: String(f.email || ''),
    address: addrRaw,
    address_line1,
    address_line2,
    address_line3,
    website: websiteDisplay,
    website_full: websiteFull,
    website_url: websiteFull,
    has_website: !!(websiteRaw && websiteFull),
    has_address: !!addrRaw,

    photo_url: photoUrl,
    logo_url: logoUrl,

    color_1: c1,
    color_2: c2,
    color_3: c3,
    color_4: c4,

    primary_on_white: primaryOnWhite(p.primary || '#1e3a5f', p.text || p.neutral || '#0f172a'),
    title_on_card,
    company_muted,
    divider_soft,
    photo_ring_bg,
    sig_card_surface,
    t2_divider_color,
    t2_muted,
    deco_geo_url,
    deco_floral_url,
    header_bar_bg,

    icon_c1_mail: iconPrimary.mail,
    icon_c1_phone: iconPrimary.phone,
    icon_c1_globe: iconPrimary.globe,
    icon_c1_pin: iconPrimary.pin,
    icon_body_mail: iconBody.mail,
    icon_body_phone: iconBody.phone,
    icon_body_globe: iconBody.globe,
    icon_body_pin: iconBody.pin,
    icon_l2_mail: icon_l2.mail,
    icon_l2_phone: icon_l2.phone,
    icon_l2_globe: icon_l2.globe,
    icon_l2_pin: icon_l2.pin,
    font_family: String(d.font || 'Arial, Helvetica, sans-serif'),

    name_line1,
    name_line2,

    linkedin_url: linkedinUrl,
    twitter_url: twitterUrl,
    instagram_url: instagramUrl,
    github_url: githubUrl,
    facebook_url: facebookUrl,
    telegram_url: telegramUrl,
    medium_url: mediumUrl,

    has_linkedin: !!linkedinUrl,
    has_twitter: !!twitterUrl,
    has_instagram: !!instagramUrl,
    has_github: !!githubUrl,
    has_facebook: !!facebookUrl,
    has_telegram: !!telegramUrl,
    has_medium: !!mediumUrl,
    has_socials: !!(
      linkedinUrl ||
      twitterUrl ||
      instagramUrl ||
      githubUrl ||
      facebookUrl ||
      telegramUrl ||
      mediumUrl
    ),

    show_badge: f.showBadge !== false,
    signature_link: wrapHref,
    has_signature_link: !!wrapHref,

    name_initials,
    t3_name_first_upper,
    t3_name_last_upper,
    t3_has_name_last,
    t3_company_upper,
    t3_tagline_upper,
    has_t3_tagline,
    t3_mailto_href,
    has_mailto: !!emailTrim,
    ...buildTemplate4PaletteContext(c1, c2, c3, c4),
    ...buildTemplate5PaletteContext(c1, c2, c3, c4),
    ...buildTemplate6PaletteContext(c1, c2, c3, c4),
    ...buildTemplate7PaletteContext(c1, c2, c3, c4),
    ...buildTemplate8PaletteContext(c1, c2, c3, c4),
    ...buildTemplate9PaletteContext(c1, c2, c3, c4),
    ...buildTemplate10PaletteContext(c1, c2, c3, c4),
    ...buildTemplate11PaletteContext(c1, c2, c3, c4),
    ...buildTemplate12PaletteContext(c1, c2, c3, c4),
    ...buildTemplate13PaletteContext(c1, c2, c3, c4),
    ...buildTemplate14PaletteContext(c1, c2, c3, c4),
    ...buildTemplate15PaletteContext(c1, c2, c3, c4),
    ...buildTemplate16PaletteContext(c1, c2, c3, c4),
    ...buildTemplate17PaletteContext(c1, c2, c3, c4),
    ...buildTemplate18PaletteContext(c1, c2, c3, c4),
    ...buildTemplate19PaletteContext(c1, c2, c3, c4),
    ...buildTemplate20PaletteContext(c1, c2, c3, c4),
    t13_has_name_second_line,
    t13_name_line1_upper,
    t13_name_line2_upper,
    t13_title_upper,
    t14_has_name_line2,
    t14_job_line1,
    t14_job_line2,
    t14_has_job_line2,
    t15_name_line1_upper,
    t15_name_line2_upper,
    t15_has_name_line2,
    t15_job_pill_text,
    t15_has_contact_body,
    t15_address_body_html,
    t15_contact_body_html,
    t15_show_company_in_tab,
    t16_lockup_upper,
    t16_tel_href,
    t17_tel_href,
    t18_tel_href,
    t18_brand_line,
    t18_has_contact_row1,
    t18_has_contact_row2,
    t19_tel_href,
    t19_has_contact_row1,
    t19_has_contact_row2,
    t20_name_line1_upper,
    t20_name_line2_upper,
    t20_has_name_line2,
    t20_address_line1: t20AddrT20.line1,
    t20_address_line2: t20AddrT20.line2,
    t20_has_address_line2: t20AddrT20.hasLine2,
    t20_role_text,
    t20_tel_href,
    has_t16_web_mail,
    t10_company_display,
    has_t10_tagline: Boolean(t10_tagline_text),
    t10_tagline: t10_tagline_text,
    has_t11_intro: Boolean(t11_intro_split.l1),
    t11_intro_line1: t11_intro_split.l1,
    t11_intro_line2: t11_intro_split.l2,
    has_t12_intro: false,
    t12_intro_line1: '',
    t12_intro_line2: '',
    t11_job_primary,
    t11_corner_role,
    has_t11_corner_role,
    t6_row1_right_display,
    t6_row1_right_href,
    has_t6_row1_right,
    has_t6_sparkles: true,
    t4_logo_src,
    t4_company_line1: t4co.line1,
    t4_company_line2: t4co.line2,
    has_t4_company_line2: Boolean(String(t4co.line2 || '').trim()),
    t4_mailto_href,
    ...t3,

    apply_brand_palette_to_cta_banners: d.apply_brand_palette_to_cta_banners === true,
  };
}

/**
 * Build context from DB-style row: { fields, design, social_links, show_badge, signature_link }
 */
function contextFromSignatureRecord(data) {
  const fields = data.fields || {};
  const design = data.design || {};
  const social = data.social_links || {};
  const bundle = fields._bundle;
  const bf = bundle?.form || {};

  const form = {
    fullName: fields.full_name || fields.fullName || bf.fullName || '',
    jobTitle: fields.job_title || fields.jobTitle || bf.jobTitle || '',
    companyName: fields.company || fields.companyName || bf.companyName || '',
    tagline: fields.tagline || fields.tag_line || bf.tagline || '',
    phone: fields.phone || bf.phone || '',
    email: fields.email || bf.email || '',
    website: fields.website || bf.website || '',
    address: fields.address || bf.address || '',
    photoUrl: fields.photo_url || fields.photoUrl || bf.photoUrl || '',
    logoUrl: fields.logo_url || fields.logoUrl || bf.logoUrl || '',
    linkedin: social.linkedin || bf.linkedin || '',
    twitter: social.twitter || bf.twitter || '',
    instagram: social.instagram || bf.instagram || '',
    github: social.github || bf.github || '',
    facebook: social.facebook || bf.facebook || '',
    telegram: social.telegram || bf.telegram || '',
    medium: social.medium || bf.medium || '',
    showBadge: data.show_badge !== false && data.showBadge !== false,
    signatureLinkUrl: data.signature_link || bf.signatureLinkUrl || '',
    entireSignatureClickable: Boolean(String(data.signature_link || bf.signatureLinkUrl || '').trim()),
  };

  const colors = Array.isArray(design.colors) ? design.colors : [];
  const pal = design.palette || {};
  const bundlePal = bundle?.palette || {};
  const palette = {
    primary: colors[0] || pal.primary || bundlePal.primary,
    secondary: colors[1] || pal.secondary || bundlePal.secondary,
    accent: colors[2] || pal.accent || bundlePal.accent,
    text: colors[3] || pal.text || bundlePal.text,
  };

  return contextFromEditorPayload({
    templateId: resolveRowTemplateSlug(data),
    form,
    palette,
    design: {
      font: design.font,
      apply_brand_palette_to_cta_banners: design.apply_brand_palette_to_cta_banners,
    },
  });
}

function buildContext(payload) {
  if (payload.form != null || payload.templateId != null) {
    return contextFromEditorPayload({
      templateId: payload.templateId || payload.template_id,
      form: payload.form,
      palette: payload.palette,
      design: payload.design,
      banner: payload.banner,
    });
  }
  return contextFromSignatureRecord(payload);
}

/** Resolve layout slug: DB `template_id` FK first (gallery selection), then `design`, then legacy bundle (stale _bundle.templateId no longer overrides). */
function resolveRowTemplateSlug(row) {
  const design = row.design || {};
  const bundle = row.fields?._bundle;
  const ordered = [row.template_id, design.templateId, design.template_slug, bundle?.templateId];
  for (const c of ordered) {
    if (c == null || c === '') continue;
    const s = String(c).trim();
    if (!s) continue;
    if (/^template_image$/i.test(s)) return 'template_1';
    if (/^template_2$/i.test(s)) return 'template_2';
    if (/^template_3$/i.test(s)) return 'template_3';
    if (/^template_4$/i.test(s)) return 'template_4';
    if (/^template_5$/i.test(s)) return 'template_5';
    if (/^template_6$/i.test(s)) return 'template_6';
    if (/^template_7$/i.test(s)) return 'template_7';
    if (/^template_8$/i.test(s)) return 'template_8';
    if (/^template_9$/i.test(s)) return 'template_9';
    if (/^template_10$/i.test(s)) return 'template_10';
    if (/^template_11$/i.test(s)) return 'template_11';
    if (/^template_12$/i.test(s)) return 'template_12';
    if (/^template_13$/i.test(s)) return 'template_13';
    if (/^template_14$/i.test(s)) return 'template_14';
    if (/^template_15$/i.test(s)) return 'template_15';
    if (/^template_16$/i.test(s)) return 'template_16';
    if (/^template_17$/i.test(s)) return 'template_17';
    if (/^template_18$/i.test(s)) return 'template_18';
    if (/^template_19$/i.test(s)) return 'template_19';
    if (/^template_20$/i.test(s)) return 'template_20';
    if (/^template_\d+$/i.test(s)) return 'template_1';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)) {
      return uuidToTemplateSlug(s);
    }
  }
  return 'template_1';
}

/**
 * Map a DB `signatures` row to an editor-style payload for {@link generateSignatureHtml}.
 * Merges flat `fields` / `social_links` over stale `fields._bundle.form` so PUT regenerates match the UI.
 */
export function rowToGeneratePayload(row) {
  const fields = row.fields || {};
  const bundle = fields._bundle;
  const design = row.design || {};
  const social = row.social_links || {};
  const bannerCfg = row.banner_config || {};

  const baseForm = bundle && typeof bundle.form === 'object' ? { ...bundle.form } : {};

  const form = {
    ...baseForm,
    signatureName: row.label ?? baseForm.signatureName ?? 'My signature',
    fullName: fields.full_name ?? baseForm.fullName ?? '',
    jobTitle: fields.job_title ?? baseForm.jobTitle ?? '',
    companyName: fields.company ?? baseForm.companyName ?? '',
    tagline: fields.tagline ?? fields.tag_line ?? baseForm.tagline ?? '',
    phone: fields.phone ?? baseForm.phone ?? '',
    email: fields.email ?? baseForm.email ?? '',
    website: fields.website ?? baseForm.website ?? '',
    address: fields.address ?? baseForm.address ?? '',
    photoUrl: fields.photo_url ?? fields.photoUrl ?? baseForm.photoUrl ?? '',
    logoUrl: fields.logo_url ?? fields.logoUrl ?? baseForm.logoUrl ?? '',
    linkedin: social.linkedin ?? baseForm.linkedin ?? '',
    twitter: social.twitter ?? baseForm.twitter ?? '',
    instagram: social.instagram ?? baseForm.instagram ?? '',
    github: social.github ?? baseForm.github ?? '',
    facebook: social.facebook ?? baseForm.facebook ?? '',
    telegram: social.telegram ?? baseForm.telegram ?? '',
    medium: social.medium ?? baseForm.medium ?? '',
    showBadge: row.show_badge !== false && row.showBadge !== false,
    signatureLinkUrl: row.signature_link ?? baseForm.signatureLinkUrl ?? '',
    entireSignatureClickable: Boolean(
      String(row.signature_link || baseForm.signatureLinkUrl || '').trim()
    ),
    customFields: Array.isArray(baseForm.customFields) ? baseForm.customFields : [],
    signatureImageUrl:
      String(design.signatureImageUrl || '').trim() ||
      String(fields.signature_image_url || '').trim() ||
      String(baseForm.signatureImageUrl || '').trim() ||
      '',
  };

  const colors = Array.isArray(design.colors) ? design.colors : [];
  const pal = design.palette || {};
  const bundlePal = bundle?.palette || {};
  const palette = {
    primary: colors[0] || pal.primary || bundlePal.primary || '#2563eb',
    secondary: colors[1] || pal.secondary || bundlePal.secondary || '#1e40af',
    accent: colors[2] || pal.accent || bundlePal.accent || '#64748b',
    text: colors[3] || pal.text || bundlePal.text || '#0f172a',
  };

  const templateId = resolveRowTemplateSlug(row);

  const bannerSecondaryFrom = (b) => ({
    secondary_banner_id: b.secondary_banner_id,
    secondary_link_url: b.secondary_link_url,
    secondary_href: b.secondary_href,
    secondary_text: b.secondary_text,
    secondary_field_1: b.secondary_field_1,
    secondary_field_2: b.secondary_field_2,
    secondary_field_3: b.secondary_field_3,
    secondary_field_4: b.secondary_field_4,
    secondary_field_5: b.secondary_field_5,
    secondary_preset_id: b.secondary_preset_id,
    secondary_banner_image_url: b.secondary_banner_image_url,
    secondary_cta_strip_logo_url: b.secondary_cta_strip_logo_url,
    secondary_cta_strip_icon_url: b.secondary_cta_strip_icon_url,
    secondary_cta_strip_hero_url: b.secondary_cta_strip_hero_url,
  });

  const blankPrimaryRow =
    isBlankImageBannerPreset(bannerCfg.preset_id, row.banner_id) &&
    String(bannerCfg.banner_image_url || '').trim();
  const blankPrimarySelected =
    Boolean(row.banner_id) && isBlankImageBannerPreset(bannerCfg.preset_id, row.banner_id);

  let banner;
  /** DB `banner_config` is authoritative; avoid stale `fields._bundle.banner` after CTAs are cleared. */
  if (bannerCfg.link_url || bannerCfg.href || blankPrimaryRow || blankPrimarySelected) {
    const pid = bannerCfg.preset_id || 'book-call';
    const primaryBannerKey = row.banner_id || pid;
    banner = {
      id: primaryBannerKey,
      preset_id: pid,
      href: bannerCfg.link_url || bannerCfg.href,
      link_url: bannerCfg.link_url || bannerCfg.href,
      text: bannerCfg.text || 'Learn more',
      field_1: bannerCfg.field_1,
      field_2: bannerCfg.field_2,
      field_3: bannerCfg.field_3,
      field_4: bannerCfg.field_4,
      field_5: bannerCfg.field_5,
      banner_image_url: bannerCfg.banner_image_url,
      image_url: bannerCfg.image_url,
      cta_strip_logo_url: bannerCfg.cta_strip_logo_url,
      cta_strip_icon_url: bannerCfg.cta_strip_icon_url,
      cta_strip_hero_url: bannerCfg.cta_strip_hero_url,
      ...bannerSecondaryFrom(bannerCfg),
    };
  } else if (
    row.banner_id &&
    bundle?.banner &&
    (String(bundle.banner.href || bundle.banner.link_url || '').trim() ||
      String(bundle.banner.banner_image_url || '').trim())
  ) {
    const pid = bundle.banner.preset_id || bundle.banner.id || 'book-call';
    banner = {
      id: pid,
      preset_id: pid,
      href: bundle.banner.href || bundle.banner.link_url,
      link_url: bundle.banner.link_url || bundle.banner.href,
      text: bundle.banner.text || 'Learn more',
      field_1: bundle.banner.field_1,
      field_2: bundle.banner.field_2,
      field_3: bundle.banner.field_3,
      field_4: bundle.banner.field_4,
      field_5: bundle.banner.field_5,
      banner_image_url: bundle.banner.banner_image_url,
      image_url: bundle.banner.image_url,
      cta_strip_logo_url: bundle.banner.cta_strip_logo_url,
      cta_strip_icon_url: bundle.banner.cta_strip_icon_url,
      cta_strip_hero_url: bundle.banner.cta_strip_hero_url,
      ...bannerSecondaryFrom(bundle.banner),
    };
  }

  return {
    templateId,
    form,
    palette,
    design: {
      font: design.font,
      apply_brand_palette_to_cta_banners: design.apply_brand_palette_to_cta_banners,
    },
    banner,
  };
}

const WEBINAR_BANNER_DEFAULTS = {
  field_1: 'Digital marketing\nexpert',
  field_2: 'Projecting your brand into\nthe distant.',
  field_3: 'Call to action',
  field_4: '80',
  field_5: '',
};

/** Default right photo for {@link BANNER_TEMPLATES} `banner_2` when no custom image URL is set. */
const BANNER_B2_DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80&auto=format&fit=crop';

/** Root-relative hero on the client; resolved with {@link publicAssetBaseFromEnv} for pasted HTML. */
const BANNER_B9_DEFAULT_HERO_PATH = '/banners/online-loan-banner-hero.png';

/** Last-resort hero if no upload and no `SIGNATURE_PUBLIC_ASSET_BASE` / `PUBLIC_BASE_URL`. */
const BANNER_B9_FALLBACK_HERO =
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=720&q=85&auto=format&fit=crop';

/**
 * @param {string} raw
 * @param {string} rootRelativeFallback path starting with `/`
 */
function resolveBannerHeroAssetUrl(raw, rootRelativeFallback) {
  const t = String(raw || '').trim();
  if (t) {
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith('/')) {
      const base = publicAssetBaseFromEnv();
      return base ? `${base}${t}` : t;
    }
    return ensureHttps(t);
  }
  const base = publicAssetBaseFromEnv();
  if (base) return `${base}${rootRelativeFallback}`;
  return BANNER_B9_FALLBACK_HERO;
}

/** Uploaded CTA strip assets (Explore / Boost) — same resolution rules as {@link resolveBannerHeroAssetUrl}. */
function resolveCtaStripUploadUrl(raw) {
  const t = String(raw || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('/')) {
    const base = publicAssetBaseFromEnv();
    return base ? `${base}${t}` : t;
  }
  return ensureHttps(t);
}

function normalizeWebinarBannerFields(banner) {
  const d = WEBINAR_BANNER_DEFAULTS;
  const f1 = String(banner.field_1 ?? '').trim();
  const f2 = String(banner.field_2 ?? '').trim();
  const f3 = String(banner.field_3 ?? banner.text ?? '').trim();
  const f4 = String(banner.field_4 ?? '').trim();
  const f5 = String(banner.field_5 ?? '').trim();
  return {
    field_1: f1 || d.field_1,
    field_2: f2 || d.field_2,
    field_3: f3 || d.field_3,
    field_4: f4 || d.field_4,
    field_5: f5,
  };
}

/** Banner copy: newlines become `<br>`; each line HTML-escaped. */
function escapeTextWithBr(raw) {
  return String(raw ?? '')
    .split(/\r?\n/)
    .map((line) => escapeHtml(line))
    .join('<br>');
}

function parseBannerMinHeightPx(field4) {
  const raw = String(field4 ?? '').replace(/[^\d]/g, '');
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return 82;
  return Math.min(200, Math.max(64, n));
}

/** CTA inner table width — same as layout rail so the strip matches signature width. */
function bannerStripContentWidthPx(layoutRailPx) {
  const w = Number(layoutRailPx);
  if (!Number.isFinite(w) || w < 1) return layoutRailPx;
  return Math.round(w);
}

/** Blank strip width — same as layout rail / signature content width. */
function blankBannerStripWidthPx(layoutRailPx) {
  const w = bannerStripContentWidthPx(layoutRailPx);
  const n = Number(w);
  if (Number.isFinite(n) && n >= 1) return Math.round(n);
  const fallback = Math.round(Number(layoutRailPx) || 470);
  return Math.max(1, fallback);
}

/** Same aspect as `/upload/banner-image` canvas (720×93) so strip height tracks signature rail width. */
const BLANK_BANNER_REF_W_PX = 720;
const BLANK_BANNER_REF_H_PX = Math.round((BLANK_BANNER_REF_W_PX * 72) / 560);

/**
 * Image-only strip height — scales with {@link blankBannerStripWidthPx} (signature content width)
 * at the fixed upload aspect ratio (720 : {@link BLANK_BANNER_REF_H_PX}).
 */
function blankBannerStripHeightPx(layoutRailPx) {
  const w = blankBannerStripWidthPx(layoutRailPx);
  const n = Math.round(Number(w) || 0);
  const widthPx = Number.isFinite(n) && n >= 1 ? n : 470;
  const h = Math.round((widthPx * BLANK_BANNER_REF_H_PX) / BLANK_BANNER_REF_W_PX);
  return Math.max(48, h);
}

/**
 * Compile one CTA strip (inner HTML only, no data-sig-part wrapper). `railPx` matches the layout rail
 * (see {@link bannerStripContentWidthPx}); outer shell uses the same width for alignment.
 */
/** Marks inner banner `<table>` roots so the editor can show separate preview blocks. */
function tagBannerSlotInner(html, slot) {
  const s = String(html || '').trim();
  if (!s) return '';
  return s.replace(/^<table\b/i, `<table data-sig-banner-slot="${slot}"`);
}

function compileBannerInnerHtml(context, banner, railPx, opts = {}) {
  if (!banner) return '';
  const blankPlaceholder = Boolean(opts.blankPlaceholder);
  const key = resolveBannerKey(banner);
  const tpl = BANNER_TEMPLATES[key];
  if (!tpl) return '';

  if (key === 'banner_blank') {
    const raw = String(banner.banner_image_url || banner.image_url || '').trim();
    const linkRaw = String(banner.href || banner.link_url || '').trim();
    const hasLinked = Boolean(linkRaw);
    if (!raw) {
      if (!blankPlaceholder) return '';
      const blankW = blankBannerStripWidthPx(railPx);
      const blankH = blankBannerStripHeightPx(railPx);
      /* Inset wrapper — px width only: {@link collapseSignatureShellWidth} turns width:100% on presentation tables into width:auto. */
      const blankInnerW = Math.max(1, blankW - 8);
      /* Same pixel rail as signature / CTA shells so the dashed placeholder matches live preview width. */
      return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="${blankW}" style="width:${blankW}px;max-width:100%;table-layout:fixed;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="padding:0 4px;margin:0;vertical-align:middle;line-height:0;font-size:0;"><table cellpadding="0" cellspacing="0" border="0" role="presentation" width="${blankInnerW}" style="width:${blankInnerW}px;max-width:100%;table-layout:fixed;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td align="center" valign="middle" style="padding:6px 10px;width:${blankInnerW}px;max-width:100%;height:${blankH}px;min-height:${blankH}px;max-height:${blankH}px;box-sizing:border-box;border:2px dashed #94a3b8;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.35;color:#64748b;">${escapeHtml(
        'Upload a banner image under My information → Banner.'
      )}</td></tr></table></td></tr></table>`;
    }
    const compiled = Handlebars.compile(tpl, { strict: false });
    const blankW = blankBannerStripWidthPx(railPx);
    const blankH = blankBannerStripHeightPx(railPx);
    const hbIn = {
      ...context,
      banner_rail_w_px: blankW,
      banner_blank_h_px: blankH,
      banner_full_image: ensureHttps(raw),
      banner_blank_linked: hasLinked,
      banner_link: hasLinked ? ensureHttps(banner.href || banner.link_url) || '#' : '#',
    };
    return compiled(hbIn);
  }

  const hasHref = String(banner.href || banner.link_url || '').trim();
  if (!hasHref) return '';

  const bannerLink = ensureHttps(String(banner.href || banner.link_url || '').trim()) || '#';
  const compiled = Handlebars.compile(tpl, { strict: false });
  const hbIn = {
    ...context,
    banner_rail_w_px: railPx,
    banner_link: bannerLink,
    banner_text: escapeHtml(String(banner.text ?? '')),
  };

  const sideImg = String(banner.banner_image_url || banner.image_url || '').trim();
  hbIn.banner_side_image = sideImg ? ensureHttps(sideImg) : '';

  if (key === 'banner_1') {
    const w = normalizeWebinarBannerFields(banner);
    const brandFromField = String(w.field_5 || '').trim();
    const company = String(context.company_name || '').trim();
    hbIn.banner_brand_label = escapeHtml(brandFromField || company || 'My Brand');
    hbIn.banner_headline_html = escapeTextWithBr(w.field_1);
    hbIn.banner_subline_html = escapeTextWithBr(w.field_2);
    hbIn.banner_text = escapeHtml(w.field_3);
    hbIn.banner_min_height = parseBannerMinHeightPx(w.field_4);
    const [w1, w2, w3, w4] = ctaBannerTintStops(context, 'webinar');
    Object.assign(hbIn, webinarBannerStyleVars(w1, w2, w3, w4, railPx));
  }
  if (key === 'banner_2') {
    const headline =
      String(banner.field_1 ?? '')
        .trim() ||
      String(banner.text ?? '')
        .trim() ||
      'Book a call today';
    hbIn.banner_b2_headline = escapeHtml(headline);
    const rawImg = String(banner.banner_image_url || banner.field_2 || banner.image_url || '').trim();
    hbIn.banner_b2_image =
      rawImg.length > 0 ? ensureHttps(rawImg) : BANNER_B2_DEFAULT_IMAGE;
    const [b1, b2, b3, b4] = ctaBannerTintStops(context, 'bookCall');
    Object.assign(hbIn, bookCallBannerStyleVars(b1, b2, b3, b4));
  }
  if (key === 'banner_3') {
    const left =
      String(banner.field_1 ?? '')
        .trim() || 'Download my Resume';
    hbIn.banner_b3_left_text = escapeHtml(left);
    hbIn.banner_text = escapeHtml(String(banner.text ?? '').trim() || 'Download');
  }
  if (key === 'banner_4') {
    const label = String(banner.field_1 ?? '').trim() || 'Need a call?';
    hbIn.banner_4_label = escapeHtml(label);
    hbIn.banner_text = escapeHtml(String(banner.text ?? '').trim() || 'Pick a slot now');
    const [n1, n2, n3, n4] = ctaBannerTintStops(context, 'needCall');
    Object.assign(hbIn, needCallBannerStyleVars(n1, n2, n3, n4));
  }
  if (key === 'banner_5') {
    const personRaw = String(banner.banner_image_url || banner.image_url || '').trim();
    hbIn.banner_b5_has_person = personRaw.length > 0;
    hbIn.banner_b5_person = personRaw ? ensureHttps(personRaw) : '';
    const company = String(context.company_name || '').trim();
    hbIn.banner_b5_brand = escapeHtml(String(banner.field_5 ?? '').trim() || company || 'MINDSCOPE');
    const headlineRaw =
      String(banner.field_1 ?? '').trim() || 'Applicant Tracking\nSystem & Recruiting CRM';
    hbIn.banner_b5_headline_html = escapeTextWithBr(headlineRaw);
    hbIn.banner_b5_tagline_pre = escapeHtml(String(banner.field_2 ?? '').trim() || 'Make Hiring ');
    hbIn.banner_b5_tagline_accent = escapeHtml(String(banner.field_3 ?? '').trim() || 'Easy!');
    hbIn.banner_b5_fineprint = escapeHtml(
      String(banner.field_4 ?? '').trim() || 'No credit card required'
    );
    const cta = String(banner.text ?? '').trim() || 'Try For Free!';
    hbIn.banner_b5_cta = escapeHtml(cta);
    hbIn.banner_text = hbIn.banner_b5_cta;
    hbIn.banner_b5_min_h = personRaw.length > 0 ? 94 : 78;
  }
  if (key === 'banner_6') {
    const panelRaw =
      String(banner.field_1 ?? '').trim() ||
      "The industry's leading email marketing solution.";
    hbIn.banner_b6_panel = escapeHtml(panelRaw);
    const cta = String(banner.text ?? '').trim() || 'Get Started';
    hbIn.banner_b6_cta = escapeHtml(cta);
    hbIn.banner_text = hbIn.banner_b6_cta;
    const scene = String(banner.banner_image_url || banner.image_url || '').trim();
    hbIn.banner_b6_scene_image = scene ? ensureHttps(scene) : '';
  }
  if (key === 'banner_7') {
    hbIn.banner_b7_brand_small = escapeHtml(String(banner.field_1 ?? '').trim() || 'explore');
    hbIn.banner_b7_logo_word = escapeHtml(String(banner.field_2 ?? '').trim() || 'log');
    hbIn.banner_b7_headline = escapeHtml(String(banner.field_3 ?? '').trim() || 'Explore Your');
    hbIn.banner_b7_world = escapeHtml(String(banner.field_4 ?? '').trim() || 'WORLD');
    hbIn.banner_b7_url = escapeHtml(String(banner.field_5 ?? '').trim() || 'www.example.com');
    const cta7 = String(banner.text ?? '').trim() || 'Learn More';
    hbIn.banner_b7_cta = escapeHtml(cta7);
    hbIn.banner_text = hbIn.banner_b7_cta;
    const railLogo = String(banner.cta_strip_logo_url || '').trim();
    const heroImg = String(banner.cta_strip_hero_url || '').trim();
    const railSrc = railLogo ? resolveCtaStripUploadUrl(railLogo) : '';
    const heroSrc = heroImg ? resolveCtaStripUploadUrl(heroImg) : '';
    hbIn.banner_b7_rail_logo_html = railSrc
      ? `<img src="${railSrc}" alt="" style="display:block;width:100%;max-width:110px;height:auto;max-height:30px;margin:0 0 4px 0;object-fit:contain;object-position:left center;border:0;line-height:0;" />`
      : '';
    hbIn.banner_b7_rail_decor = EXPLORE_WORLD_B7_RAIL_DECOR_SVG;
    hbIn.banner_b7_center_accent = EXPLORE_WORLD_B7_CENTER_ACCENT_SVG;
    hbIn.banner_b7_traveler_inner = heroSrc
      ? `<img src="${heroSrc}" alt="" width="58" style="display:block;width:58px;max-width:58px;height:auto;border:0;vertical-align:bottom;line-height:0;" />`
      : EXPLORE_WORLD_TRAVELER_SVG;
  }
  if (key === 'banner_8') {
    hbIn.banner_b8_logo_small = escapeHtml(String(banner.field_1 ?? '').trim() || 'Mighty');
    hbIn.banner_b8_logo_main = escapeHtml(String(banner.field_2 ?? '').trim() || 'LOGO');
    hbIn.banner_b8_headline = escapeHtml(String(banner.field_3 ?? '').trim() || 'Boost and Improve');
    hbIn.banner_b8_subline = escapeHtml(String(banner.field_4 ?? '').trim() || 'Your Immune System');
    const cta8 = String(banner.text ?? '').trim() || 'Click Here';
    hbIn.banner_b8_cta = escapeHtml(cta8);
    hbIn.banner_text = hbIn.banner_b8_cta;
    const leafBrandImg = String(banner.cta_strip_logo_url || '').trim();
    const sceneImg = String(banner.cta_strip_hero_url || '').trim();
    const leafSrc = leafBrandImg ? resolveCtaStripUploadUrl(leafBrandImg) : '';
    const sceneSrc = sceneImg ? resolveCtaStripUploadUrl(sceneImg) : '';
    hbIn.banner_b8_leaf_inner = leafSrc
      ? `<img src="${leafSrc}" alt="" style="display:block;margin:0 auto;max-width:100%;width:auto;height:auto;max-height:120px;object-fit:contain;object-position:center;border:0;line-height:normal;vertical-align:middle;" />`
      : BOOST_LOGO_LEAF_SVG;
    hbIn.banner_b8_scene_inner = sceneSrc
      ? `<img src="${sceneSrc}" alt="" style="display:block;width:100%;max-width:100%;height:auto;max-height:96px;object-fit:contain;object-position:center;border:0;vertical-align:middle;line-height:0;margin:0 auto;" />`
      : BOOST_WELLNESS_SCENE_SVG;
  }
  if (key === 'banner_9') {
    hbIn.banner_b9_line1 = escapeHtml(
      String(banner.field_1 ?? '').trim() || 'Online půjčka pro'
    );
    hbIn.banner_b9_line2 = escapeHtml(String(banner.field_2 ?? '').trim() || 'každého');
    hbIn.banner_b9_brand = escapeHtml(String(banner.field_3 ?? '').trim() || 'REVOLIO');
    const cta9 = String(banner.text ?? '').trim() || 'CHCI PŮJČIT';
    hbIn.banner_b9_cta = escapeHtml(cta9);
    hbIn.banner_text = hbIn.banner_b9_cta;
    const railN = Number(railPx);
    const railRef = Number.isFinite(railN) && railN > 0 ? railN : 728;
    const sc = Math.min(1.05, Math.max(0.72, railRef / 728));
    hbIn.banner_b9_fs_h = Math.max(13, Math.round(22 * sc));
    hbIn.banner_b9_fs_cta = Math.max(10, Math.round(13.5 * sc * 10) / 10);
    hbIn.banner_b9_fs_b = Math.max(10, Math.round(13 * sc));
    const heroRaw = String(banner.banner_image_url || banner.image_url || '').trim();
    const defaultHeroPath = BANNER_B9_DEFAULT_HERO_PATH;
    const isBundledDefault =
      !heroRaw ||
      heroRaw === defaultHeroPath ||
      heroRaw.endsWith('/online-loan-banner-hero.png');
    hbIn.banner_b9_custom_hero = Boolean(heroRaw) && !isBundledDefault;
    hbIn.banner_b9_hero = hbIn.banner_b9_custom_hero
      ? resolveBannerHeroAssetUrl(heroRaw, defaultHeroPath)
      : '';
  }
  if (key === 'banner_10') {
    hbIn.banner_b10_business = escapeHtml(String(banner.field_1 ?? '').trim() || 'BUSINESS');
    hbIn.banner_b10_banner = escapeHtml(String(banner.field_2 ?? '').trim() || 'BANNER');
    hbIn.banner_b10_design = escapeHtml(String(banner.field_3 ?? '').trim() || 'DESIGN');
    hbIn.banner_b10_company = escapeHtml(String(banner.field_5 ?? '').trim() || 'COMPANY');
    const b10Logo = String(banner.banner_image_url || banner.image_url || '').trim();
    hbIn.banner_b10_logo_img = b10Logo ? ensureHttps(b10Logo) : '';
    const cta10 = String(banner.text ?? '').trim() || 'LEARN MORE';
    hbIn.banner_b10_cta = escapeHtml(cta10);
    hbIn.banner_text = hbIn.banner_b10_cta;
    const railB10 = Number(railPx);
    const railRef10 = Number.isFinite(railB10) && railB10 > 0 ? railB10 : 728;
    const sc10 = Math.min(1.05, Math.max(0.72, railRef10 / 728));
    hbIn.banner_b10_fs_bus = Math.max(7, Math.round(8.5 * sc10 * 10) / 10);
    hbIn.banner_b10_fs_title = Math.max(12, Math.round(16 * sc10));
    hbIn.banner_b10_fs_cta = Math.max(5, Math.round(6.5 * sc10 * 10) / 10);
    hbIn.banner_b10_fs_logo = Math.max(5, Math.round(5.5 * sc10 * 10) / 10);
  }
  if (key === 'banner_11') {
    const t11 = String(banner.field_1 ?? '').trim() || 'Leave us a review';
    const s11 = String(banner.field_2 ?? '').trim() || 'on Trustpilot';
    hbIn.banner_b11_title = escapeHtml(t11);
    hbIn.banner_b11_subtitle = escapeHtml(s11);
    hbIn.banner_b11_a_title = escapeHtml(s11 ? `${t11} — ${s11}` : t11);
    hbIn.banner_text = hbIn.banner_b11_title;
    const railB11 = Number(railPx);
    const railRef11 = Number.isFinite(railB11) && railB11 > 0 ? railB11 : 600;
    const sc11 = Math.min(1.08, Math.max(0.72, railRef11 / 600));
    hbIn.banner_b11_min_h = Math.max(100, Math.round(130 * sc11));
    hbIn.banner_b11_fs_title = Math.max(15, Math.round(20 * sc11));
    hbIn.banner_b11_fs_sub = Math.max(11, Math.round(14 * sc11));
    hbIn.banner_b11_art_w = Math.max(240, Math.round(340 * sc11));
  }
  if (key === 'banner_12') {
    const t12 = String(banner.field_1 ?? '').trim() || 'SEO Whitepaper';
    const s12 = String(banner.field_2 ?? '').trim() || 'Free top 10 SEO tips PDF';
    hbIn.banner_b12_title = escapeHtml(t12);
    hbIn.banner_b12_subtitle = escapeHtml(s12);
    hbIn.banner_b12_a_title = escapeHtml(s12 ? `${t12} — ${s12}` : t12);
    hbIn.banner_text = hbIn.banner_b12_title;
    const railB12 = Number(railPx);
    const railRef12 = Number.isFinite(railB12) && railB12 > 0 ? railB12 : 640;
    const sc12 = Math.min(1.06, Math.max(0.78, railRef12 / 640));
    hbIn.banner_b12_min_h = Math.max(52, Math.round(72 * sc12));
    hbIn.banner_b12_fs_title = Math.max(11, Math.round(15 * sc12));
    hbIn.banner_b12_fs_sub = Math.max(9, Math.round(12.5 * sc12 * 10) / 10);
    hbIn.banner_b12_grid_w = Math.max(160, Math.round(440 * sc12));
  }
  if (key === 'banner_13') {
    const headlineRaw =
      String(banner.field_1 ?? '').trim() || 'A better\nfuture awaits';
    hbIn.banner_b13_title_html = escapeTextWithBr(headlineRaw);
    const cta13 = String(banner.text ?? '').trim() || 'Book a call';
    hbIn.banner_b13_cta = escapeHtml(cta13);
    hbIn.banner_text = hbIn.banner_b13_cta;
    const plainHead = headlineRaw.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    hbIn.banner_b13_a_title = escapeHtml(`${plainHead} — ${cta13}`);
    const railB13 = Number(railPx);
    const railRef13 = Number.isFinite(railB13) && railB13 > 0 ? railB13 : 640;
    const sc13 = Math.min(1.06, Math.max(0.78, railRef13 / 640));
    hbIn.banner_b13_min_h = Math.max(64, Math.round(90 * sc13));
    hbIn.banner_b13_fs_title = Math.max(14, Math.round(19 * sc13));
    hbIn.banner_b13_fs_cta = Math.max(12, Math.round(15 * sc13));
    hbIn.banner_b13_fs_arrow = Math.max(14, Math.round(18 * sc13));
    hbIn.banner_b13_decor_w = Math.max(72, Math.min(140, Math.round(120 * sc13)));
  }
  return compiled(hbIn);
}

function editorBannerStub(editorBanner) {
  return {
    id: editorBanner.id || editorBanner.preset_id,
    preset_id: editorBanner.preset_id || editorBanner.id,
  };
}

function editorPrimaryBannerRenderable(editorBanner, previewSlotsMode = false) {
  if (!editorBanner) return false;
  if (resolveBannerKey(editorBannerStub(editorBanner)) === 'banner_blank') {
    if (previewSlotsMode) return true;
    return Boolean(String(editorBanner.banner_image_url || editorBanner.image_url || '').trim());
  }
  return Boolean(String(editorBanner.href || editorBanner.link_url || '').trim());
}

function editorSecondaryBannerRenderable(editorBanner, previewSlotsMode = false) {
  if (!editorBanner) return false;
  if (!String(editorBanner.secondary_banner_id || '').trim()) return false;
  const stub = {
    id: editorBanner.secondary_banner_id || editorBanner.secondary_preset_id,
    preset_id: editorBanner.secondary_preset_id || editorBanner.preset_id,
  };
  const secHref = String(
    editorBanner.secondary_link_url || editorBanner.secondary_href || ''
  ).trim();
  if (resolveBannerKey(stub) === 'banner_blank') {
    if (previewSlotsMode) return true;
    return Boolean(String(editorBanner.secondary_banner_image_url || '').trim());
  }
  return Boolean(secHref);
}

function appendBanner(html, context, editorBanner, templateId, appendOpts = {}) {
  const blankPlaceholder = Boolean(appendOpts.blankPlaceholder);
  if (!editorBanner || !editorPrimaryBannerRenderable(editorBanner, blankPlaceholder)) return html;
  const layoutW = bundleRailPxForEngineSlug(resolveTemplateKey(templateId));
  const stripW = bannerStripContentWidthPx(layoutW);

  const primaryBanner = {
    id: editorBanner.id || editorBanner.preset_id || 'book-call',
    preset_id: editorBanner.preset_id || editorBanner.id,
    href: editorBanner.href || editorBanner.link_url,
    link_url: editorBanner.link_url || editorBanner.href,
    text: editorBanner.text || '',
    field_1: editorBanner.field_1,
    field_2: editorBanner.field_2,
    field_3: editorBanner.field_3,
    field_4: editorBanner.field_4,
    field_5: editorBanner.field_5,
    banner_image_url: editorBanner.banner_image_url,
    image_url: editorBanner.image_url,
    cta_strip_logo_url: editorBanner.cta_strip_logo_url,
    cta_strip_icon_url: editorBanner.cta_strip_icon_url,
    cta_strip_hero_url: editorBanner.cta_strip_hero_url,
  };
  const primaryInner = tagBannerSlotInner(
    compileBannerInnerHtml(context, primaryBanner, stripW, { blankPlaceholder }),
    1
  );
  if (!String(primaryInner || '').trim()) return html;

  const shellOpenAttrs = () =>
    `cellpadding="0" cellspacing="0" border="0" contenteditable="false" width="${layoutW}" style="width:${layoutW}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0;padding:0;border:0;"`;
  const sigBlock = `<table role="presentation" data-sig-root="signature" data-sig-part="signature" ${shellOpenAttrs()}><tr><td width="${layoutW}" contenteditable="false" style="padding:0;margin:0;border:0;width:${layoutW}px;max-width:100%;vertical-align:top;">${html}</td></tr></table>`;
  const banShell = (inner, slotIndex = 1, padTop = false) => {
    const tdPad = padTop ? 'padding:10px 0 0 0;margin:0;border:0;' : 'padding:0;margin:0;border:0;';
    return `<table role="presentation" data-sig-root="${slotIndex === 2 ? 'banner-secondary' : 'banner'}" data-sig-part="banner" data-sig-cta-slot="${slotIndex}" ${shellOpenAttrs()}><tr><td width="${layoutW}" contenteditable="false" align="left" style="${tdPad}width:${layoutW}px;max-width:100%;vertical-align:top;text-align:left;">${inner}</td></tr></table>`;
  };

  if (editorSecondaryBannerRenderable(editorBanner, blankPlaceholder)) {
    const secHref = String(
      editorBanner.secondary_link_url || editorBanner.secondary_href || ''
    ).trim();
    const secondaryBanner = {
      id: editorBanner.secondary_banner_id || editorBanner.secondary_preset_id || 'book-call',
      preset_id: editorBanner.secondary_preset_id || editorBanner.preset_id,
      href: secHref,
      link_url: secHref,
      text: editorBanner.secondary_text ?? '',
      field_1: editorBanner.secondary_field_1,
      field_2: editorBanner.secondary_field_2,
      field_3: editorBanner.secondary_field_3,
      field_4: editorBanner.secondary_field_4,
      field_5: editorBanner.secondary_field_5,
      banner_image_url: editorBanner.secondary_banner_image_url,
      image_url: editorBanner.secondary_banner_image_url,
      cta_strip_logo_url: editorBanner.secondary_cta_strip_logo_url,
      cta_strip_icon_url: editorBanner.secondary_cta_strip_icon_url,
      cta_strip_hero_url: editorBanner.secondary_cta_strip_hero_url,
    };
    const secHtml = compileBannerInnerHtml(context, secondaryBanner, stripW, { blankPlaceholder });
    if (secHtml) {
      const secondaryInner = tagBannerSlotInner(secHtml, 2);
      return `${sigBlock}${banShell(primaryInner, 1, false)}${banShell(secondaryInner, 2, true)}`;
    }
  }

  return `${sigBlock}${banShell(primaryInner, 1)}`;
}

/**
 * Wrapping the whole signature in `<a href="…">` is invalid if the template already contains `<a href>…</a>`
 * (nested anchors). Many clients strip inner links or route all clicks to the outer URL, so social icons
 * appear “dead”. Skip the global wrap when the compiled fragment already has its own anchors.
 */
function htmlFragmentHasLinkAnchors(html) {
  return /<a\b[^>]*\bhref\s*=/i.test(String(html || ''));
}

/**
 * Email-client-safe HTML fragment (single run): Handlebars → optional link wrap → banner →
 * juice (inline only) → strip classes → minify → root <table> shells (signature + one or more banners).
 * Preview and DB use full-size output. `{ forPaste: true }` narrows max-widths for Gmail/Outlook paste.
 */
export async function generateSignatureHtml(payload, options = {}) {
  const {
    skipJuice = false,
    skipMinify = false,
    forPaste = false,
    includePreviewSlots = false,
    persistIncompleteBlank = false,
  } = options;

  const templateId = payload.templateId || payload.template_id || 'template_1';
  const context = buildContext(payload);
  const tpl = getTemplateHtml(templateId);
  const compiled = Handlebars.compile(tpl, { strict: false });
  let html = compiled(context);

  // Whole-signature click-through: wrap the compiled layout in one <a> (same pattern as CTA strips).
  // Do not wrap the root <table> in <span style="display:inline-block"> — <span> only allows phrasing
  // content; a layout <table> is flow content, so parsers hoist the table out and the <a> stays empty
  // (clicks on the visible design never hit href). A block-level <a> around the root table is valid
  // HTML5 and matches banner templates (<a style="display:block"> … inner table … </a>).
  if (context.has_signature_link && context.signature_link && !htmlFragmentHasLinkAnchors(html)) {
    const href = escapeHtml(context.signature_link);
    html = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;max-width:100%;color:inherit;line-height:normal;border:0;margin:0;padding:0;outline:none;">${html}</a>`;
  }

  const editorBanner = payload.banner;
  const allowBlankShell = includePreviewSlots || persistIncompleteBlank;
  if (editorBanner && editorPrimaryBannerRenderable(editorBanner, allowBlankShell)) {
    html = appendBanner(html, context, editorBanner, templateId, {
      blankPlaceholder: allowBlankShell,
    });
  }

  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;

  let out = doc;
  if (!skipJuice) {
    out = juice(out, {
      removeStyleTags: true,
      preserveMediaQueries: false,
      applyStyleTags: true,
    });
  }

  const bodyMatch = out.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let fragment = bodyMatch ? bodyMatch[1].trim() : out;
  fragment = stripClassAttributes(fragment);

  if (!skipMinify) {
    try {
      fragment = await minify(fragment, {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: false,
        minifyCSS: false,
        keepClosingSlash: true,
      });
    } catch {
      /* keep un-minified */
    }
  }

  fragment = finalizeSignatureRoots(fragment.trim());
  fragment = collapseSignatureShellWidth(fragment);
  if (forPaste) {
    const pasteClipMax = bundleRailPxForEngineSlug(resolveTemplateKey(templateId));
    fragment = applyPasteFootprint(fragment, pasteClipMax);
  }

  if (Buffer.byteLength(fragment, 'utf8') > MAX_OUTPUT_BYTES) {
    fragment = fragment.slice(0, MAX_OUTPUT_BYTES - 80) + '<!-- truncated -->';
  }

  const assetBase = publicAssetBaseFromEnv();
  if (assetBase) {
    fragment = resolveRelativeAssetUrls(fragment, assetBase);
  }

  fragment = validateHTML(fragment);

  if (includePreviewSlots) {
    return {
      html: fragment,
      previewSlots: splitSignaturePreviewSlots(fragment),
    };
  }

  return fragment;
}

/** Alias for callers expecting this name */
export const generateSignatureHTML = generateSignatureHtml;
