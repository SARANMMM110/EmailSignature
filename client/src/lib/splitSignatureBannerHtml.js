/**
 * Pull each inner CTA `<table>` when tagged with `data-sig-banner-slot` (dual-strip output).
 * Otherwise one combined string (legacy or single strip).
 */
function extractBannerSlotHtmls(banInner) {
  const inner = String(banInner || '').trim();
  if (!inner) return [];
  try {
    const doc = new DOMParser().parseFromString(
      `<div id="sig-slot-root">${inner}</div>`,
      'text/html'
    );
    const r = doc.getElementById('sig-slot-root');
    if (!r) return [inner];
    const tables = r.querySelectorAll('table[data-sig-banner-slot]');
    if (!tables.length) return [inner];
    return Array.from(tables, (t) => t.outerHTML.trim());
  } catch {
    return [inner];
  }
}

/** Index of `>` closing the `<table ...>` open tag starting at `openLt`. */
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

/** End offset (exclusive) of the outer `<table>...</table>` whose `<table` starts at `tableOpenStart`. */
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

/** Root CTA shell from the generator: `data-sig-part="banner"` + `data-sig-cta-slot="1"|"2"`. */
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

/** Full outer `<table … data-sig-cta-slot>` — one root per preview iframe (matches server split). */
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

/** Prefer explicit CTA slot markers so banner 1 / 2 never collapse into one preview block. */
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

/** First `<td>...</td>` inner HTML of the first row (string walk — matches server preview split). */
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

/**
 * Split sibling root `<table data-sig-part="signature|banner">` blocks without relying on
 * `querySelectorAll` over a wrapped fragment (some engines merge sibling tables incorrectly).
 */
function splitByStackTableWalker(raw) {
  const html = String(raw || '').trim();
  if (!html) return null;

  const sigStart = findFirstTableOpenWithDataPartFrom(html, 'signature', 0);
  if (sigStart < 0) return null;
  const sigEnd = findMatchingTableCloseEnd(html, sigStart);
  if (sigEnd <= sigStart) return null;

  const sigOuter = html.slice(sigStart, sigEnd);
  const sigInner = getFirstCellInnerString(sigOuter);
  if (!sigInner) return null;

  const ctaShells = extractBannerShellOutersByCtaMarkers(html);
  if (ctaShells.length >= 2) {
    return {
      signatureHtml: sigInner,
      bannerHtml: ctaShells.join(''),
      bannerSlotHtmls: [...ctaShells],
    };
  }
  const ctaSlots = extractBannerSlotInnersByCtaMarkers(html);
  if (ctaSlots.length >= 2) {
    return { signatureHtml: sigInner, bannerHtml: ctaSlots.join(''), bannerSlotHtmls: [...ctaSlots] };
  }
  if (ctaSlots.length === 1) {
    const inner0 = ctaSlots[0];
    const sub = extractBannerSlotHtmls(inner0);
    const bannerSlotHtmls = sub.length ? sub : [inner0];
    if (bannerSlotHtmls.length) {
      return { signatureHtml: sigInner, bannerHtml: bannerSlotHtmls.join(''), bannerSlotHtmls };
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
    const slots = extractBannerSlotHtmls(inner);
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
  const combinedBanInner = bannerSlotHtmls.join('');
  return { signatureHtml: sigInner, bannerHtml: combinedBanInner, bannerSlotHtmls };
}

/**
 * Editor preview: bundled HTML uses `data-sig-part` on either:
 * - legacy: one outer `<table>` with two `<td data-sig-part>` rows, or
 * - current: sibling `<table data-sig-part>` wrappers — signature plus one or more banner roots
 *   (separate paste blocks, matched widths).
 *
 * Uses a string-based table walker first so each root `data-sig-part="banner"` becomes its own
 * preview slot (same isolation model as the signature block).
 *
 * @returns {{ signatureHtml: string, bannerHtml: string | null, bannerSlotHtmls: string[] }}
 */
export function splitSignatureAndBannerHtml(fragment) {
  const raw = String(fragment || '').trim();
  const empty = { signatureHtml: raw, bannerHtml: null, bannerSlotHtmls: [] };
  if (!raw || typeof DOMParser === 'undefined') {
    return raw ? { ...empty, signatureHtml: raw } : { signatureHtml: '', bannerHtml: null, bannerSlotHtmls: [] };
  }

  const stacked = splitByStackTableWalker(raw);
  if (stacked) return stacked;

  try {
    const doc = new DOMParser().parseFromString(
      `<div id="sig-split-root">${raw}</div>`,
      'text/html'
    );
    const root = doc.getElementById('sig-split-root');
    if (!root) return empty;

    const sigTable = root.querySelector('table[data-sig-part="signature"]');
    const banTables = root.querySelectorAll('table[data-sig-part="banner"]');
    if (sigTable && banTables.length > 0) {
      const sigCell = sigTable.rows[0]?.cells[0];
      if (!sigCell) return empty;
      const sigInner = sigCell.innerHTML.trim();
      const bannerSlotHtmls = [];
      const banInners = [];
      for (const banTable of banTables) {
        const banCell = banTable.rows[0]?.cells[0];
        if (!banCell) continue;
        const banInner = banCell.innerHTML.trim();
        if (!banInner) continue;
        banInners.push(banInner);
        if (banTables.length > 1) {
          bannerSlotHtmls.push(banInner);
        } else {
          for (const slot of extractBannerSlotHtmls(banInner)) {
            const s = String(slot || '').trim();
            if (s) bannerSlotHtmls.push(s);
          }
        }
      }
      if (!banInners.length) return empty;
      const combinedBanInner = banInners.join('');
      return { signatureHtml: sigInner, bannerHtml: combinedBanInner, bannerSlotHtmls };
    }

    const sigTd = root.querySelector('td[data-sig-part="signature"]');
    const banTd = root.querySelector('td[data-sig-part="banner"]');
    if (sigTd && banTd) {
      const sigInner = sigTd.innerHTML.trim();
      const banInner = banTd.innerHTML.trim();
      if (banInner) {
        const bannerSlotHtmls = extractBannerSlotHtmls(banInner);
        return { signatureHtml: sigInner, bannerHtml: banInner, bannerSlotHtmls };
      }
    }
  } catch {
    /* ignore */
  }
  return empty;
}
