import Handlebars from 'handlebars';
import juice from 'juice';
import { minify } from 'html-minifier-terser';
import { bundleRailPxForEngineSlug, uuidToTemplateSlug } from '../lib/templateIds.js';
import { resolveTemplateKey, TEMPLATE_META, getTemplateHtml } from '../templates/signatureTemplates.js';
import { BANNER_TEMPLATES, resolveBannerKey } from '../templates/bannerTemplates.js';

const MAX_OUTPUT_BYTES = 15 * 1024;

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
  if (bytes > 15 * 1024) issues.push('WARNING: HTML exceeds 15KB');
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

export function ensureHttps(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
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
 * Webinar banner (banner_1) — uses all four palette stops (primary, secondary, accent, text/surface).
 */
function webinarBannerStyleVars(color1, color2, color3, color4) {
  const c1 = String(color1 || '#1a1d21').trim();
  const c2 = String(color2 || c1).trim();
  const c3 = String(color3 || '#94a3b8').trim();
  const c4 = String(color4 || '#0f172a').trim();
  const L = relativeLuminance(c1);
  const darkBg = L < 0.55;

  if (darkBg) {
    const cta = bannerCtaOnDark(c1, c2, c3, c4);
    return {
      banner_bg_start: mixHexWithWhite(c1, 0.06),
      banner_bg_mid: c1,
      banner_bg_end: mixHexWithBlack(c2, 0.38),
      banner_headline_color: bannerHeadlineOnDark(c4),
      banner_subline_color: bannerSublineOnDark(c3),
      banner_cta_bg: cta.bg,
      banner_cta_text: cta.text,
      banner_bar_1: c2,
      banner_bar_2: mixHexWithWhite(c2, 0.12),
      banner_bar_3: c3,
      banner_bar_4: mixHexWithWhite(c3, relativeLuminance(c3) > 0.55 ? 0.06 : 0.28),
      banner_bar_5:
        relativeLuminance(c4) > 0.85 ? mixHexWithWhite(c2, 0.22) : mixHexWithWhite(c4, 0.35),
    };
  }

  const headline = pickDarkestReadable([c4, c1, mixHexWithBlack(c2, 0.12)], 0.48);
  const subline = companyMutedColor(c4, c2);
  const ctaBg = pickDarkestReadable([c3, c2, mixHexWithBlack(c1, 0.18)], 0.44);

  return {
    banner_bg_start: mixHexWithWhite(c3, 0.35),
    banner_bg_mid: mixHexWithWhite(c1, 0.28),
    banner_bg_end: mixHexWithWhite(c2, 0.14),
    banner_headline_color: headline,
    banner_subline_color: subline,
    banner_cta_bg: ctaBg,
    banner_cta_text: '#ffffff',
    banner_bar_1: mixHexWithBlack(c1, 0.08),
    banner_bar_2: c1,
    banner_bar_3: c2,
    banner_bar_4: mixHexWithWhite(c3, 0.12),
    banner_bar_5: pickDarkestReadable([c4, c2], 0.45),
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
 * Layout 9 — “mini card”: 88px round photo | name + title + compact contacts | logo top-right (Helvetica-style).
 */
function buildTemplate9PaletteContext(c1, _c2, _c3, c4) {
  const primary = String(c1 || '#0071ce').trim();
  const titleMuted = '#878787';
  const p4 = String(c4 || '#525252').trim();
  const contactText = mixHexPair('#525252', p4, 0.12);
  const borderSoft = mixHexPair('#e5e7eb', mixHexWithWhite(p4, 0.85), 0.55);
  const icons = contactStrokeIconDataUrisCompact(contactText);
  const sw = '1.65';
  const linkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${contactText}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.07.07l3-3a5 5 0 00-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 00-7.07-.07l-3 3a5 5 0 007.07 7.07l1.5-1.5"/></svg>`;
  const initialsBg = mixHexPair('#f4f4f5', p4, 0.08);
  const initialsColor = pickDarkestReadable([primary, p4], 0.42);
  return {
    t9_shell_bg: '#ffffff',
    t9_border_color: borderSoft,
    t9_name_color: primary,
    t9_title_color: titleMuted,
    t9_contact_color: contactText,
    t9_icon_mail: icons.mail,
    t9_icon_link: svgDataUri(linkSvg),
    t9_icon_phone: icons.phone,
    t9_icon_pin: icons.pin,
    t9_initials_bg: initialsBg,
    t9_initials_color: initialsColor,
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
  const decoTopArc = svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" viewBox="0 0 128 64"><circle cx="64" cy="0" r="64" fill="${teal}"/></svg>`
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
 * Optional outer shell when there is **no** CTA (single block). No `contenteditable="false"` —
 * Gmail groups locked nodes with the next block.
 */
function wrapEmailSignatureRootTable(html) {
  const t = String(html || '').trim();
  if (!t) return t;
  const rootShellStyle =
    'mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;max-width:100%;' +
    'width:100%;display:table;float:none;margin:0;padding:0;border:0;';
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" data-sig-root="signature" ' +
    `style="${rootShellStyle}">` +
    '<tr><td style="padding:0;margin:0;border:0;">' +
    t +
    '</td></tr></table>'
  );
}

/** Between signature and CTA: line break only — no wrapper around both tables. */
const DUAL_ROOT_SEPARATOR = '<br>';

/**
 * With CTA: two sibling root `<table>` elements only (from {@link appendBanner}) + `<br>` between.
 * No single parent wrapping both — Gmail can select/delete each block independently.
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
  const banChunk = t.slice(idx).trim();
  if (!sigChunk || !banChunk) return wrapEmailSignatureRootTable(t);
  return sigChunk + DUAL_ROOT_SEPARATOR + banChunk;
}

/**
 * Placeholder content when the user has not filled a field yet — keeps layouts (photo, logo,
 * contact rows) visible in the editor and in email output until replaced.
 * Mirrors client `DEMO_SIGNATURE_DATA` in templatePreviews.js.
 */
const DEMO_FORM_DEFAULTS = {
  fullName: 'James Doe',
  jobTitle: 'Software Engineer',
  companyName: 'Core',
  phone: '+(91) 9865456739',
  email: 'James@core.com',
  website: 'www.core.com',
  address: 'Office 60,\nCalicut\nkerala, India',
  photoUrl: 'https://i.pravatar.cc/160?img=12',
  logoUrl: 'https://dummyimage.com/180x36/4752c4/ffffff.png&text=Core',
  signatureImageUrl: '',
};

const DEMO_PALETTE_DEFAULTS = {
  primary: '#5768f3',
  secondary: '#4752c4',
  accent: '#b4b9ff',
  text: '#0f172a',
};

const DEMO_FORM_TEXT_KEYS = [
  'fullName',
  'jobTitle',
  'companyName',
  'phone',
  'email',
  'website',
  'address',
  'photoUrl',
  'logoUrl',
  'signatureImageUrl',
];

function mergeEditorFormWithDemoDefaults(form, options = {}) {
  const { omitLogoDemo = false, omitCompanyDemo = false } = options;
  const f = { ...(form || {}) };
  const d = DEMO_FORM_DEFAULTS;
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
 * Up to three lines for split-card address (newlines first; else comma chunks).
 * Trailing comma on line1 (e.g. "Office 60,") is preserved when user types it.
 */
function splitAddressLines(raw) {
  const empty = { address_line1: '', address_line2: '', address_line3: '' };
  const s = String(raw || '').trim();
  if (!s) return empty;
  const lines = s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return empty;
  if (lines.length >= 3) {
    return {
      address_line1: lines[0],
      address_line2: lines[1],
      address_line3: lines.slice(2).join(', '),
    };
  }
  if (lines.length === 2) {
    return { address_line1: lines[0], address_line2: lines[1], address_line3: '' };
  }
  const parts = lines[0].split(',').map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      address_line1: `${parts[0]},`,
      address_line2: parts[1],
      address_line3: parts.slice(2).join(', '),
    };
  }
  if (parts.length === 2) {
    return { address_line1: parts[0], address_line2: parts[1], address_line3: '' };
  }
  return { address_line1: lines[0], address_line2: '', address_line3: '' };
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
  /** Layout 4 uses its own brand mark + no “Core” demo in company/logo placeholders. */
  const omitLogoDemo = meta.has_logo === false || isTemplate4;
  let f = mergeEditorFormWithDemoDefaults(payload.form || {}, {
    omitLogoDemo,
    omitCompanyDemo: isTemplate4,
  });
  if (isTemplate4) {
    if (/^core$/i.test(String(f.companyName || '').trim())) {
      f = { ...f, companyName: '' };
    }
    const lu = String(f.logoUrl || '').trim();
    if (/dummyimage\.com[^\s"']*text=Core/i.test(lu)) {
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
  const mediumUrl = ensureHttps(String(f.medium || '').trim());

  const photoUrl = ensureHttps(String(f.photoUrl || '').trim());
  const logoUrl = ensureHttps(String(f.logoUrl || '').trim());

  const linkRaw = String(f.signatureLinkUrl || '').trim();
  const wrapHref =
    (f.entireSignatureClickable || linkRaw) && linkRaw ? ensureHttps(f.signatureLinkUrl) : '';

  const companyRaw = String(f.companyName || '').trim();
  const company_is_core = /^core$/i.test(companyRaw);
  const addrRaw = String(f.address || '').trim();
  const { address_line1, address_line2, address_line3 } = splitAddressLines(addrRaw);
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

  return {
    primary_color: c1,
    secondary_color: c2,
    name: String(f.fullName || ''),
    title: String(f.jobTitle || ''),
    company_name: companyRaw,
    company_is_core,
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
    medium_url: mediumUrl,

    has_linkedin: !!linkedinUrl,
    has_twitter: !!twitterUrl,
    has_instagram: !!instagramUrl,
    has_github: !!githubUrl,
    has_facebook: !!facebookUrl,
    has_medium: !!mediumUrl,
    has_socials: !!(linkedinUrl || twitterUrl || instagramUrl || githubUrl || facebookUrl || mediumUrl),

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
    design: { font: design.font },
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

  let banner;
  if (bundle?.banner && String(bundle.banner.href || bundle.banner.link_url || '').trim()) {
    const pid = bundle.banner.preset_id || bundle.banner.id || 'book-call';
    banner = {
      id: pid,
      preset_id: pid,
      href: bundle.banner.href || bundle.banner.link_url,
      text: bundle.banner.text || 'Learn more',
      field_1: bundle.banner.field_1,
      field_2: bundle.banner.field_2,
      field_3: bundle.banner.field_3,
      field_4: bundle.banner.field_4,
    };
  } else if (bannerCfg.link_url || bannerCfg.href) {
    const pid = bannerCfg.preset_id || 'book-call';
    banner = {
      id: pid,
      preset_id: pid,
      href: bannerCfg.link_url || bannerCfg.href,
      text: bannerCfg.text || 'Learn more',
      field_1: bannerCfg.field_1,
      field_2: bannerCfg.field_2,
      field_3: bannerCfg.field_3,
      field_4: bannerCfg.field_4,
    };
  }

  return {
    templateId,
    form,
    palette,
    design: { font: design.font },
    banner,
  };
}

const WEBINAR_BANNER_DEFAULTS = {
  field_1: 'Email Marketing 101 Webinar',
  field_2: 'Only 10 seats available!',
  field_3: 'Book my seat',
  field_4: '88',
};

function normalizeWebinarBannerFields(banner) {
  const d = WEBINAR_BANNER_DEFAULTS;
  const f1 = String(banner.field_1 ?? '').trim();
  const f2 = String(banner.field_2 ?? '').trim();
  const f3 = String(banner.field_3 ?? banner.text ?? '').trim();
  const f4 = String(banner.field_4 ?? '').trim();
  return {
    field_1: f1 || d.field_1,
    field_2: f2 || d.field_2,
    field_3: f3 || d.field_3,
    field_4: f4 || d.field_4,
  };
}

function parseBannerMinHeightPx(field4) {
  const raw = String(field4 ?? '').replace(/[^\d]/g, '');
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return 88;
  return Math.min(180, Math.max(64, n));
}

function appendBanner(html, context, banner, templateId) {
  const hasHref = String(banner?.href || banner?.link_url || '').trim();
  if (!banner || !hasHref) return html;
  const key = resolveBannerKey(banner);
  const tpl = BANNER_TEMPLATES[key];
  if (!tpl) return html;
  const bannerLink = ensureHttps(banner.href || banner.link_url || '#');
  const compiled = Handlebars.compile(tpl, { strict: false });
  const hbIn = {
    ...context,
    banner_link: bannerLink,
    banner_text: escapeHtml(String(banner.text ?? '')),
  };
  if (key === 'banner_1') {
    const w = normalizeWebinarBannerFields(banner);
    hbIn.banner_headline = escapeHtml(w.field_1);
    hbIn.banner_subline = escapeHtml(w.field_2);
    hbIn.banner_text = escapeHtml(w.field_3);
    hbIn.banner_min_height = parseBannerMinHeightPx(w.field_4);
    Object.assign(
      hbIn,
      webinarBannerStyleVars(
        context.color_1,
        context.color_2,
        context.color_3,
        context.color_4
      )
    );
  }
  const bannerHtml = compiled(hbIn);
  const w = bundleRailPxForEngineSlug(resolveTemplateKey(templateId));
  // Sibling wrapper tables before finalize: split point for two outer paste shells (see finalizeSignatureRoots).
  const wrapOpen = `cellpadding="0" cellspacing="0" border="0" width="${w}" style="width:${w}px;max-width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;"`;
  const sigBlock = `<table role="presentation" data-sig-root="signature" data-sig-part="signature" ${wrapOpen}><tr><td width="${w}" style="padding:0;margin:0;border:0;width:${w}px;max-width:100%;vertical-align:top;">${html}</td></tr></table>`;
  const banBlock = `<table role="presentation" data-sig-root="banner" data-sig-part="banner" ${wrapOpen}><tr><td width="${w}" style="padding:0;margin:0;border:0;width:${w}px;max-width:100%;vertical-align:top;">${bannerHtml}</td></tr></table>`;
  return `${sigBlock}${banBlock}`;
}

/**
 * Email-client-safe HTML fragment (single run): Handlebars → optional link wrap → banner →
 * juice (inline only) → strip classes → minify → one or two root <table> shells (signature + banner).
 * Preview and DB use full-size output. `{ forPaste: true }` narrows max-widths for Gmail/Outlook paste.
 */
export async function generateSignatureHtml(payload, options = {}) {
  const { skipJuice = false, skipMinify = false, forPaste = false } = options;

  const templateId = payload.templateId || payload.template_id || 'template_1';
  const context = buildContext(payload);
  const tpl = getTemplateHtml(templateId);
  const compiled = Handlebars.compile(tpl, { strict: false });
  let html = compiled(context);

  // Do not place <table> directly inside <a> — Gmail can normalize that into duplicate blocks on
  // paste. Use an inline-block wrapper (span) — div/block <a> wrappers are more likely to break
  // remote images inside the signature for recipients.
  if (context.has_signature_link && context.signature_link) {
    const href = escapeHtml(context.signature_link);
    html = `<a href="${href}" style="text-decoration:none;color:inherit;"><span style="display:inline-block;max-width:100%;margin:0;padding:0;border:0;line-height:normal;">${html}</span></a>`;
  }

  const editorBanner = payload.banner;
  if (editorBanner && String(editorBanner.href || '').trim()) {
    html = appendBanner(
      html,
      context,
      {
        id: editorBanner.id || editorBanner.preset_id || 'book-call',
        preset_id: editorBanner.preset_id || editorBanner.id,
        href: editorBanner.href,
        text: editorBanner.text || '',
        field_1: editorBanner.field_1,
        field_2: editorBanner.field_2,
        field_3: editorBanner.field_3,
        field_4: editorBanner.field_4,
      },
      templateId
    );
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

  return validateHTML(fragment);
}

/** Alias for callers expecting this name */
export const generateSignatureHTML = generateSignatureHtml;
