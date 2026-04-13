/**
 * Editor preview: bundled HTML uses `data-sig-part` on either:
 * - legacy: one outer `<table>` with two `<td data-sig-part>` rows, or
 * - current: sibling `<table data-sig-part>` wrappers (separate paste blocks, matched widths).
 */
export function splitSignatureAndBannerHtml(fragment) {
  const raw = String(fragment || '').trim();
  if (!raw || typeof DOMParser === 'undefined') {
    return { signatureHtml: raw, bannerHtml: null };
  }
  try {
    const doc = new DOMParser().parseFromString(
      `<div id="sig-split-root">${raw}</div>`,
      'text/html'
    );
    const root = doc.getElementById('sig-split-root');
    if (!root) return { signatureHtml: raw, bannerHtml: null };

    const sigTable = root.querySelector('table[data-sig-part="signature"]');
    const banTable = root.querySelector('table[data-sig-part="banner"]');
    if (sigTable && banTable) {
      const sigCell = sigTable.rows[0]?.cells[0];
      const banCell = banTable.rows[0]?.cells[0];
      if (sigCell && banCell) {
        const sigInner = sigCell.innerHTML.trim();
        const banInner = banCell.innerHTML.trim();
        if (banInner) return { signatureHtml: sigInner, bannerHtml: banInner };
      }
    }

    const sigTd = root.querySelector('td[data-sig-part="signature"]');
    const banTd = root.querySelector('td[data-sig-part="banner"]');
    if (sigTd && banTd) {
      const sigInner = sigTd.innerHTML.trim();
      const banInner = banTd.innerHTML.trim();
      if (banInner) return { signatureHtml: sigInner, bannerHtml: banInner };
    }
  } catch {
    /* ignore */
  }
  return { signatureHtml: raw, bannerHtml: null };
}
