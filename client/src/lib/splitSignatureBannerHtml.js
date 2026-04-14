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

/**
 * Editor preview: bundled HTML uses `data-sig-part` on either:
 * - legacy: one outer `<table>` with two `<td data-sig-part>` rows, or
 * - current: sibling `<table data-sig-part>` wrappers (separate paste blocks, matched widths).
 *
 * @returns {{ signatureHtml: string, bannerHtml: string | null, bannerSlotHtmls: string[] }}
 */
export function splitSignatureAndBannerHtml(fragment) {
  const empty = { signatureHtml: String(fragment || '').trim(), bannerHtml: null, bannerSlotHtmls: [] };
  const raw = String(fragment || '').trim();
  if (!raw || typeof DOMParser === 'undefined') {
    return empty;
  }
  try {
    const doc = new DOMParser().parseFromString(
      `<div id="sig-split-root">${raw}</div>`,
      'text/html'
    );
    const root = doc.getElementById('sig-split-root');
    if (!root) return empty;

    const sigTable = root.querySelector('table[data-sig-part="signature"]');
    const banTable = root.querySelector('table[data-sig-part="banner"]');
    if (sigTable && banTable) {
      const sigCell = sigTable.rows[0]?.cells[0];
      const banCell = banTable.rows[0]?.cells[0];
      if (sigCell && banCell) {
        const sigInner = sigCell.innerHTML.trim();
        const banInner = banCell.innerHTML.trim();
        if (banInner) {
          const bannerSlotHtmls = extractBannerSlotHtmls(banInner);
          return { signatureHtml: sigInner, bannerHtml: banInner, bannerSlotHtmls };
        }
      }
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
