import { useEffect, useMemo, useState } from 'react';
import { bannersAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { WEBINAR_BANNER_UUID, BANNER_SLUG_TO_UUID } from '../../../lib/templateIds.js';
import { filterAndSortEditorBanners } from '../../../lib/editorBanners.js';
import { webinarBannerThumbnailSrcDoc } from '../../../data/webinarBannerStaticHtml.js';
import {
  bookCallBannerThumbnailSrcDoc,
  downloadBannerThumbnailSrcDoc,
  needCallBannerThumbnailSrcDoc,
} from '../../../data/ctaBannerThumbnails.js';
import { resolvePaletteColorsFromDesign } from '../../../lib/resolveDesignPalette.js';
import { HiPlus, HiXMark } from 'react-icons/hi2';

const BANNER_DOC_W = 470;
const BANNER_DOC_H = 128;
const CARD_THUMB_W = 320;
const CARD_THUMB_H = 88;
const CARD_THUMB_SCALE = Math.min(CARD_THUMB_W / BANNER_DOC_W, CARD_THUMB_H / BANNER_DOC_H);

function WebinarBannerDesignPreview({ design, thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => {
    const [c1, c2, c3, c4] = resolvePaletteColorsFromDesign(design);
    return webinarBannerThumbnailSrcDoc(c1, c2, c3, c4);
  }, [design]);
  return (
    <div
      className="relative mx-auto shrink-0 overflow-hidden rounded-[10px] border border-slate-400/30 bg-transparent ring-1 ring-black/[0.04]"
      style={{ width: thumbW, height: thumbH }}
    >
      <iframe
        title="Webinar banner preview"
        loading="lazy"
        srcDoc={srcDoc}
        className="pointer-events-none absolute left-0 top-0 border-0 bg-transparent"
        style={{
          width: BANNER_DOC_W,
          height: BANNER_DOC_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

function StaticBannerIframePreview({ title, srcDoc, thumbW, thumbH, scale }) {
  return (
    <div
      className="relative mx-auto shrink-0 overflow-hidden rounded-[10px] border border-slate-400/30 bg-transparent ring-1 ring-black/[0.04]"
      style={{ width: thumbW, height: thumbH }}
    >
      <iframe
        title={title}
        loading="lazy"
        srcDoc={srcDoc}
        className="pointer-events-none absolute left-0 top-0 border-0 bg-transparent"
        style={{
          width: BANNER_DOC_W,
          height: BANNER_DOC_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

function BookCallBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => bookCallBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Book a call banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function DownloadBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => downloadBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Download banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function NeedCallBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => needCallBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Need a call banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function BannerThumbnail({ banner, design }) {
  const id = String(banner.id).toLowerCase();
  const thumbW = CARD_THUMB_W;
  const thumbH = CARD_THUMB_H;
  const scale = CARD_THUMB_SCALE;
  if (id === WEBINAR_BANNER_UUID.toLowerCase()) {
    return <WebinarBannerDesignPreview design={design} thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BANNER_SLUG_TO_UUID['book-call'].toLowerCase()) {
    return <BookCallBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BANNER_SLUG_TO_UUID.download.toLowerCase()) {
    return <DownloadBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BANNER_SLUG_TO_UUID['need-call'].toLowerCase()) {
    return <NeedCallBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  return (
    <div
      className="mx-auto flex shrink-0 items-center justify-center rounded-[10px] border border-slate-300/60 bg-slate-100 text-[10px] text-slate-500"
      style={{ width: thumbW, height: thumbH }}
    >
      Preview
    </div>
  );
}

const PLUS_BTN =
  'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#3b5bdb] text-white shadow-[0_6px_24px_-4px_rgba(59,91,219,0.65)] transition hover:bg-[#324fcc] active:scale-[0.98]';

export function BannersTab() {
  const [banners, setBanners] = useState([]);

  const signature = useEditorStore((s) => s.signature);
  const setBanner = useEditorStore((s) => s.setBanner);
  const setSecondaryBanner = useEditorStore((s) => s.setSecondaryBanner);
  const editorSaving = useEditorStore((s) => s.isSaving);

  const activeId = signature?.banner_id;
  const activeSecondaryId = signature?.banner_config?.secondary_banner_id;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await bannersAPI.getAll();
        const raw = data?.banners || [];
        setBanners(filterAndSortEditorBanners(raw));
      } catch {
        setBanners([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      {banners.length === 0 ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          No CTA banners returned from the API. With Supabase, run{' '}
          <code className="rounded bg-white/80 px-1">node src/scripts/seedTemplates.js</code> or ensure
          banner rows exist (ids <code className="rounded bg-white/80 px-1">b0000001</code> …{' '}
          <code className="rounded bg-white/80 px-1">b0000004</code>).
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {banners.map((b) => {
          const isPrimary = String(activeId) === String(b.id);
          const isStacked = String(activeSecondaryId) === String(b.id);
          const canAddSecond = Boolean(activeId) && !isPrimary;

          return (
            <li key={b.id}>
              <div
                className={`rounded-2xl border bg-white p-3 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.12)] transition ${
                  isPrimary
                    ? 'border-[#3b5bdb] ring-1 ring-[#3b5bdb]/20'
                    : isStacked
                      ? 'border-slate-300 ring-2 ring-[#3b5bdb]/15'
                      : 'border-slate-200/90'
                }`}
              >
                <div
                  className="group relative mx-auto rounded-[10px]"
                  style={{ width: CARD_THUMB_W, height: CARD_THUMB_H }}
                >
                  <button
                    type="button"
                    disabled={editorSaving}
                    onClick={() => setBanner(b.id)}
                    className="absolute inset-0 z-0 flex cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent p-0 transition disabled:opacity-50"
                    aria-label={`Use ${b.name || 'banner'} as main strip`}
                  >
                    <BannerThumbnail banner={b} design={signature?.design} />
                  </button>

                  {canAddSecond ? (
                    <button
                      type="button"
                      disabled={editorSaving}
                      title="Add as second banner"
                      aria-label="Add as second banner"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSecondaryBanner(b.id);
                      }}
                      className={`${PLUS_BTN} pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 disabled:opacity-0`}
                    >
                      <HiPlus className="h-8 w-8" strokeWidth={2.25} aria-hidden />
                    </button>
                  ) : null}

                  {isStacked ? (
                    <button
                      type="button"
                      disabled={editorSaving}
                      title="Remove second banner"
                      aria-label="Remove second banner"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSecondaryBanner(null);
                      }}
                      className={`${PLUS_BTN} pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-slate-700 opacity-0 shadow-[0_6px_24px_-4px_rgba(30,41,59,0.5)] transition duration-200 hover:bg-slate-800 group-hover:pointer-events-auto group-hover:opacity-100 disabled:opacity-0`}
                    >
                      <HiXMark className="h-7 w-7" strokeWidth={2} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {banners.length > 0 && (activeId || activeSecondaryId) ? (
        <p className="text-center">
          <button
            type="button"
            disabled={editorSaving}
            onClick={() => setBanner(null)}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
          >
            Clear all banners
          </button>
        </p>
      ) : null}
    </div>
  );
}
