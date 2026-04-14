import { WEBINAR_BANNER_UUID, BANNER_SLUG_TO_UUID } from './templateIds.js';

/** CTA rows shown in the editor (Banners tab + banner picker cache) — stable DB UUIDs. */
export const EDITOR_BANNER_SORT_IDS = [
  WEBINAR_BANNER_UUID,
  BANNER_SLUG_TO_UUID['book-call'],
  BANNER_SLUG_TO_UUID.download,
  BANNER_SLUG_TO_UUID['need-call'],
].map((id) => String(id).toLowerCase());

const ALLOWED = new Set(EDITOR_BANNER_SORT_IDS);

/**
 * @param {Array<{ id?: string }>} rows
 * @returns {typeof rows}
 */
export function filterAndSortEditorBanners(rows) {
  const filtered = (rows || []).filter((b) => ALLOWED.has(String(b.id).toLowerCase()));
  const order = new Map(EDITOR_BANNER_SORT_IDS.map((id, i) => [id, i]));
  return filtered.sort((a, b) => {
    const ia = order.get(String(a.id).toLowerCase()) ?? 999;
    const ib = order.get(String(b.id).toLowerCase()) ?? 999;
    return ia - ib;
  });
}
