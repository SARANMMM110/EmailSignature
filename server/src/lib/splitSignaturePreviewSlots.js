/**
 * String-only split of generated signature HTML into preview iframes (signature + each CTA).
 * Mirrors client `splitSignatureBannerHtml.js` logic without `DOMParser` so it runs on Node
 * after juice/minify and always matches the shipped HTML.
 */

function findHtmlTagEnd(html, openLt) {
  if (html[openLt] !== '<') return -1;
  let j = openLt + 1;
  let inQuote = null;
  while (j < html.length) {
    const c = html[j];
    if (inQuote) {
      if (c === inQuote) inQuote = null;
      j++;
      continue;
    }
    if (c === '"' || c === "'") {
      inQuote = c;
      j++;
      continue;
    }
    if (c === '>') return j;
    j++;
  }
  return -1;
}

function findMatchingTableCloseEnd(html, tableOpenStart) {
  const lower = html.toLowerCase();
  const openTagEnd = findHtmlTagEnd(html, tableOpenStart);
  if (openTagEnd < 0) return -1;
  let depth = 1;
  let pos = openTagEnd + 1;
  while (pos < html.length) {
    const nextTable = lower.indexOf('<table', pos);
    const nextClose = lower.indexOf('</table>', pos);
    if (nextClose < 0) return -1;
    if (nextTable !== -1 && nextTable < nextClose) {
      const oe = findHtmlTagEnd(html, nextTable);
      if (oe < 0) return -1;
      depth++;
      pos = oe + 1;
    } else {
      depth--;
      if (depth === 0) return nextClose + '</table>'.length;
      pos = nextClose + '</table>'.length;
    }
  }
  return -1;
}

/**
 * Inserts `separator` before each 2nd+ top-level `<table … data-sig-part="banner">…</table>` so email
 * clients keep each CTA as a separate composition block (same pattern as signature ↔ first CTA).
 */
export function intersperseBrBetweenBannerPartTables(html, separator = '<br>') {
  const t = String(html || '');
  const sep = String(separator || '<br>');
  let out = '';
  let pos = 0;
  let bannerShellCount = 0;
  const lower = t.toLowerCase();
  while (pos < t.length) {
    const i = lower.indexOf('<table', pos);
    if (i < 0) {
      out += t.slice(pos);
      break;
    }
    out += t.slice(pos, i);
    const tagEnd = findHtmlTagEnd(t, i);
    if (tagEnd < 0) {
      out += t.slice(i);
      break;
    }
    const closeEnd = findMatchingTableCloseEnd(t, i);
    if (closeEnd <= i) {
      out += t.slice(i);
      break;
    }
    const openSlice = t.slice(i, tagEnd + 1);
    const isBannerShell = /\bdata-sig-part\s*=\s*["']banner["']/i.test(openSlice);
    const fullTable = t.slice(i, closeEnd);
    if (isBannerShell) {
      if (bannerShellCount > 0) out += sep;
      bannerShellCount += 1;
    }
    out += fullTable;
    pos = closeEnd;
  }
  return out;
}

function tableOpenHasDataSigPart(html, openStart, openEndExclusive, part) {
  const slice = html.slice(openStart, openEndExclusive);
  const re =
    part === 'banner'
      ? /\bdata-sig-part\s*=\s*["']banner["']/i
      : /\bdata-sig-part\s*=\s*["']signature["']/i;
  return re.test(slice);
}

function findFirstTableOpenWithDataPartFrom(html, part, fromIndex) {
  const lower = html.toLowerCase();
  let pos = Math.max(0, fromIndex);
  while (pos < html.length) {
    const i = lower.indexOf('<table', pos);
    if (i < 0) return -1;
    const end = findHtmlTagEnd(html, i);
    if (end < 0) return -1;
    if (tableOpenHasDataSigPart(html, i, end + 1, part)) return i;
    pos = i + 1;
  }
  return -1;
}

function tableOpenHasBannerCtaSlot(html, openStart, openEndExclusive, slotNum) {
  const slice = html.slice(openStart, openEndExclusive);
  if (!/\bdata-sig-part\s*=\s*["']banner["']/i.test(slice)) return false;
  return new RegExp(`\\bdata-sig-cta-slot\\s*=\\s*["']?${slotNum}["']?`, 'i').test(slice);
}

function findFirstTableOpenWithCtaSlotFrom(html, slotNum, fromIndex) {
  const lower = html.toLowerCase();
  let pos = Math.max(0, fromIndex);
  while (pos < html.length) {
    const i = lower.indexOf('<table', pos);
    if (i < 0) return -1;
    const end = findHtmlTagEnd(html, i);
    if (end < 0) return -1;
    if (tableOpenHasBannerCtaSlot(html, i, end + 1, slotNum)) return i;
    pos = i + 1;
  }
  return -1;
}

/** First `<td>...</td>` body of the first row (handles nested `<td>`). */
function getFirstCellInnerString(tableOuter) {
  const t = String(tableOuter || '').trim();
  if (!t) return '';
  const lower = t.toLowerCase();
  const trIdx = lower.indexOf('<tr');
  if (trIdx < 0) return '';
  const tdIdx = lower.indexOf('<td', trIdx);
  if (tdIdx < 0) return '';
  const tdOpenEnd = findHtmlTagEnd(t, tdIdx);
  if (tdOpenEnd < 0) return '';
  let tdDepth = 1;
  let pos = tdOpenEnd + 1;
  while (pos < t.length) {
    const nextTdOpen = lower.indexOf('<td', pos);
    const nextTdClose = lower.indexOf('</td>', pos);
    if (nextTdClose < 0) return '';
    const absOpen = nextTdOpen === -1 ? Infinity : nextTdOpen;
    const absClose = nextTdClose;
    if (absOpen < absClose) {
      tdDepth++;
      const oe = findHtmlTagEnd(t, nextTdOpen);
      if (oe < 0) return '';
      pos = oe + 1;
    } else {
      tdDepth--;
      if (tdDepth === 0) return t.slice(tdOpenEnd + 1, absClose).trim();
      pos = absClose + '</td>'.length;
    }
  }
  return '';
}

function extractBannerSlotHtmlsStringOnly(banInner) {
  const inner = String(banInner || '').trim();
  if (!inner) return [];
  if (!/\bdata-sig-banner-slot\b/i.test(inner)) return [inner];
  const lower = inner.toLowerCase();
  const out = [];
  let from = 0;
  while (from < inner.length) {
    const i = lower.indexOf('<table', from);
    if (i < 0) break;
    const end = findHtmlTagEnd(inner, i);
    if (end < 0) break;
    if (!/\bdata-sig-banner-slot\b/i.test(inner.slice(i, end + 1))) {
      from = i + 1;
      continue;
    }
    const closeEnd = findMatchingTableCloseEnd(inner, i);
    if (closeEnd <= i) break;
    out.push(inner.slice(i, closeEnd).trim());
    from = closeEnd;
  }
  return out.length ? out : [inner];
}

/** Full outer `<table … data-sig-cta-slot>` per CTA — one root table per editor/dashboard iframe. */
function extractBannerShellOutersByCtaMarkers(html) {
  const out = [];
  const s1 = findFirstTableOpenWithCtaSlotFrom(html, 1, 0);
  if (s1 < 0) return out;
  const e1 = findMatchingTableCloseEnd(html, s1);
  if (e1 <= s1) return out;
  const s2 = findFirstTableOpenWithCtaSlotFrom(html, 2, e1);
  if (s2 < 0) return out;
  const e2 = findMatchingTableCloseEnd(html, s2);
  if (e2 <= s2) return out;
  out.push(html.slice(s1, e1).trim());
  out.push(html.slice(s2, e2).trim());
  return out;
}

function extractBannerSlotInnersByCtaMarkers(html) {
  const out = [];
  const start1 = findFirstTableOpenWithCtaSlotFrom(html, 1, 0);
  if (start1 < 0) return out;
  const end1 = findMatchingTableCloseEnd(html, start1);
  if (end1 <= start1) return out;
  const inner1 = getFirstCellInnerString(html.slice(start1, end1));
  if (inner1) out.push(inner1);

  const start2 = findFirstTableOpenWithCtaSlotFrom(html, 2, end1);
  if (start2 < 0) return out;
  const end2 = findMatchingTableCloseEnd(html, start2);
  if (end2 <= start2) return out;
  const inner2 = getFirstCellInnerString(html.slice(start2, end2));
  if (inner2) out.push(inner2);
  return out;
}

/**
 * @param {string} fragment
 * @returns {{ signatureHtml: string, bannerSlotHtmls: string[] } | null}
 */
export function splitSignaturePreviewSlots(fragment) {
  const html = String(fragment || '').trim();
  if (!html) return null;

  const sigStart = findFirstTableOpenWithDataPartFrom(html, 'signature', 0);
  if (sigStart < 0) return null;
  const sigEnd = findMatchingTableCloseEnd(html, sigStart);
  if (sigEnd <= sigStart) return null;

  const sigInner = getFirstCellInnerString(html.slice(sigStart, sigEnd));
  if (!sigInner) return null;

  const ctaShells = extractBannerShellOutersByCtaMarkers(html);
  if (ctaShells.length >= 2) {
    return { signatureHtml: sigInner, bannerSlotHtmls: [...ctaShells] };
  }
  const ctaSlots = extractBannerSlotInnersByCtaMarkers(html);
  if (ctaSlots.length >= 2) {
    return { signatureHtml: sigInner, bannerSlotHtmls: [...ctaSlots] };
  }
  if (ctaSlots.length === 1) {
    const inner0 = ctaSlots[0];
    const sub = extractBannerSlotHtmlsStringOnly(inner0);
    const bannerSlotHtmls = sub.length ? sub : [inner0];
    if (bannerSlotHtmls.length) {
      return { signatureHtml: sigInner, bannerSlotHtmls };
    }
  }

  const bannerOuters = [];
  let searchFrom = sigEnd;
  while (searchFrom < html.length) {
    const bStart = findFirstTableOpenWithDataPartFrom(html, 'banner', searchFrom);
    if (bStart < 0) break;
    const bEnd = findMatchingTableCloseEnd(html, bStart);
    if (bEnd <= bStart) break;
    bannerOuters.push(html.slice(bStart, bEnd));
    searchFrom = bEnd;
  }
  if (!bannerOuters.length) return null;

  const bannerSlotHtmls = [];
  if (bannerOuters.length > 1) {
    for (const outer of bannerOuters) {
      const shell = String(outer || '').trim();
      if (shell) bannerSlotHtmls.push(shell);
    }
  } else {
    const inner = getFirstCellInnerString(bannerOuters[0]);
    const slots = extractBannerSlotHtmlsStringOnly(inner);
    if (slots.length) {
      for (const slot of slots) {
        const t = String(slot || '').trim();
        if (t) bannerSlotHtmls.push(t);
      }
    } else if (inner) {
      bannerSlotHtmls.push(inner);
    }
  }

  if (!bannerSlotHtmls.length) return null;
  return { signatureHtml: sigInner, bannerSlotHtmls };
}
