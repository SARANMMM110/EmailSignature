/**
 * Canonical brand surfaces from the four engine palette stops (primary, secondary, accent, text).
 * Signatures, Banner 1 (webinar), Banner 2 (book-a-call), Layout 7, and premium CTA strips use the same
 * strip gradient math so backgrounds stay in one family — keep the client mirror in sync when editing.
 */
import { ENGINE_PALETTE_DEFAULTS } from './enginePaletteDefaults.js';

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mixHexWithWhite(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#f1f5f9';
  const u = Math.max(0, Math.min(1, Number(t) || 0));
  const r = Math.round(base[0] * (1 - u) + 255 * u);
  const g = Math.round(base[1] * (1 - u) + 255 * u);
  const b = Math.round(base[2] * (1 - u) + 255 * u);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function mixHexWithBlack(hex, t) {
  const base = hexToRgb(hex);
  if (!base) return '#0f172a';
  const u = Math.max(0, Math.min(1, Number(t) || 0));
  const r = Math.round(base[0] * (1 - u));
  const g = Math.round(base[1] * (1 - u));
  const b = Math.round(base[2] * (1 - u));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

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
 * Horizontal strip gradient: background 1 + 2 with text nudges when the mid-tone is too light for type.
 * Same recipe everywhere (book-a-call row, webinar card fill, Layout 7 shell, premium dark panels).
 */
export function brandStripGradientFromStops(primaryHex, secondaryHex, textHex) {
  const De = ENGINE_PALETTE_DEFAULTS;
  const a = String(primaryHex || De.primary).trim();
  const b = String(secondaryHex || De.secondary).trim();
  const tx = String(textHex || De.text).trim();
  let gradEnd = mixHexPair(mixHexWithBlack(b, 0.14), mixHexWithBlack(a, 0.2), 0.52);
  let gradStart = mixHexPair(mixHexWithWhite(a, 0.14), mixHexWithWhite(b, 0.1), 0.48);
  let mid = mixHexPair(gradStart, gradEnd, 0.5);
  if (relativeLuminance(mid) > 0.38) {
    gradEnd = mixHexPair(gradEnd, mixHexWithBlack(tx, 0.12), 0.4);
    gradStart = mixHexPair(gradStart, mixHexWithBlack(tx, 0.06), 0.28);
    mid = mixHexPair(gradStart, gradEnd, 0.5);
  }
  if (relativeLuminance(mid) > 0.38) {
    gradEnd = mixHexWithBlack(gradEnd, 0.18);
    gradStart = mixHexWithBlack(gradStart, 0.08);
    mid = mixHexPair(gradStart, gradEnd, 0.5);
  }
  return { gradStart, gradEnd, mid, a, b, tx };
}

/** Single flat fill for tables that do not use a gradient (matches strip midpoint). */
export function brandFieldMidFromStops(primaryHex, secondaryHex, textHex) {
  return brandStripGradientFromStops(primaryHex, secondaryHex, textHex).mid;
}

/** Light companion surface for split layouts (e.g. subscriber left column) — same hue family as the strip. */
export function brandLightWashFromStops(primaryHex, secondaryHex, textHex) {
  const { gradStart, gradEnd } = brandStripGradientFromStops(primaryHex, secondaryHex, textHex);
  const blend = mixHexPair(gradStart, gradEnd, 0.42);
  const Lb = relativeLuminance(blend);
  if (Lb >= 0.78) return mixHexWithWhite(blend, 0.55);
  if (Lb <= 0.035) return mixHexWithWhite(blend, 0.04);
  return mixHexWithWhite(blend, 0.62);
}
