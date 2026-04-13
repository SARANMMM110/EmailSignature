/**
 * Gallery tile: prefers live HTML from /html/generate (sample name, photo, logo, contacts).
 * Falls back to `preview_img_url` / `thumbnail` when HTML is not available.
 */
import { useMemo } from 'react';
import { wrapSignatureHtmlForIframe } from '../../data/templatePreviews.js';
import { uuidToTemplateSlug } from '../../lib/templateIds.js';

export function TemplateCard({
  template,
  onSelect,
  disabled = false,
  busy = false,
  /** Highlight when this layout is applied (e.g. editor Layouts tab). */
  selected = false,
  paletteColors,
  /** Rendered signature HTML (demo payload) */
  liveHtml = '',
  /** Still fetching live HTML for this row */
  liveLoading = false,
}) {
  if (!template?.id) return null;

  const previewUrl = template.preview_img_url || template.thumbnail;
  const colorCount = Math.max(1, Number(template.color_count) || 6);
  const swatches =
    Array.isArray(paletteColors) && paletteColors.length > 0
      ? paletteColors.slice(0, Math.min(5, paletteColors.length))
      : [];

  const appBaseHref =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/`
      : '';

  const previewWidthPx = useMemo(() => {
    const slug = uuidToTemplateSlug(template.id);
    if (slug === 'template_2' || slug === 'template_4') return 470;
    if (slug === 'template_1' || slug === 'template_5') return 520;
    return 600;
  }, [template.id]);

  const srcDoc = useMemo(() => {
    if (!liveHtml?.trim()) return '';
    return wrapSignatureHtmlForIframe(liveHtml, {
      baseHref: appBaseHref,
      galleryCard: true,
      previewWidthPx,
    });
  }, [liveHtml, appBaseHref, previewWidthPx]);

  const showIframe = Boolean(srcDoc);
  const showImage = !showIframe && Boolean(previewUrl);

  const handleClick = () => {
    if (disabled || busy) return;
    onSelect?.(template);
  };

  const handleKeyDown = (e) => {
    if (disabled || busy) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(template);
    }
  };

  const pKey = swatches.join('|');

  return (
    <button
      type="button"
      tabIndex={disabled || busy ? -1 : 0}
      aria-label={template.name ? `Choose layout: ${template.name}` : 'Choose layout'}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || busy}
      className={`group/tpl block w-full cursor-pointer overflow-hidden rounded-2xl border bg-white text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 ${
        selected
          ? 'border-[#3b5bdb] ring-2 ring-[#3b5bdb] shadow-[0_8px_28px_-6px_rgba(59,91,219,0.22)]'
          : 'border-[#e6e8ec] shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)]'
      } ${
        disabled || busy
          ? 'pointer-events-none opacity-50'
          : 'hover:border-[#dce0e6] hover:shadow-[0_8px_28px_-6px_rgba(15,23,42,0.12)] active:scale-[0.998]'
      }`}
      aria-busy={busy || liveLoading}
    >
      {/* Wide aspect: signature is horizontal; tall boxes waste height */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f4f5f7]">
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-5">
          {showIframe ? (
            <iframe
              title=""
              sandbox="allow-same-origin allow-scripts"
              scrolling="no"
              srcDoc={srcDoc}
              className="pointer-events-none h-full w-full min-h-0 border-0 bg-transparent"
            />
          ) : liveLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#2563eb] border-t-transparent" />
              <span className="px-3 text-[11px] font-medium text-[#6b7280]">
                Loading sample preview…
              </span>
            </div>
          ) : showImage ? (
            <img
              src={previewUrl}
              alt=""
              className="max-h-full max-w-full object-contain object-center transition duration-200 group-hover/tpl:brightness-[1.02]"
            />
          ) : (
            <div className="px-4 text-center text-[12px] text-[#9ca3af]">Preview unavailable</div>
          )}
        </div>

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#2563eb] border-t-transparent" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2.5 border-t border-[#eceef1] px-4 py-3.5 sm:px-5">
        <span className="flex shrink-0 gap-1">
          {swatches.map((c, i) => (
            <span
              key={`${pKey}-${i}`}
              title={c}
              className="h-4 w-4 rounded-[3px] border border-white shadow-sm ring-1 ring-black/[0.06]"
              style={{ backgroundColor: c }}
            />
          ))}
        </span>
        <span className="text-[12px] font-medium tabular-nums text-[#6b7280]">
          {colorCount} {colorCount === 1 ? 'color' : 'colors'}
        </span>
      </div>
    </button>
  );
}
