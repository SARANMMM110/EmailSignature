import { useEffect, useMemo, useState } from 'react';
import { bannersAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { WEBINAR_BANNER_UUID } from '../../../lib/templateIds.js';
import { webinarBannerThumbnailSrcDoc } from '../../../data/webinarBannerStaticHtml.js';
import { resolvePaletteColorsFromDesign } from '../../../lib/resolveDesignPalette.js';

const THUMB_BOX_W = 176;
const THUMB_BOX_H = 76;
const BANNER_DOC_W = 470;
const BANNER_DOC_H = 128;
const THUMB_SCALE = Math.min(THUMB_BOX_W / BANNER_DOC_W, THUMB_BOX_H / BANNER_DOC_H);

function WebinarBannerDesignPreview({ design }) {
  const srcDoc = useMemo(() => {
    const [c1, c2, c3, c4] = resolvePaletteColorsFromDesign(design);
    return webinarBannerThumbnailSrcDoc(c1, c2, c3, c4);
  }, [design]);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[10px] border border-slate-400/30 bg-transparent ring-1 ring-black/[0.04]"
      style={{ width: THUMB_BOX_W, height: THUMB_BOX_H }}
    >
      <iframe
        title="Webinar banner preview"
        loading="lazy"
        srcDoc={srcDoc}
        className="pointer-events-none absolute left-0 top-0 border-0 bg-transparent"
        style={{
          width: BANNER_DOC_W,
          height: BANNER_DOC_H,
          transform: `scale(${THUMB_SCALE})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

/** Reference card palette (terracotta → purple). */
function webinarSwatches() {
  return ['#c45c4a', '#6b7c3f', '#4a8f5c', '#2d9b8a', '#5b7fd1', '#7c6bbd'];
}

export function BannersTab() {
  const [banners, setBanners] = useState([]);
  const signature = useEditorStore((s) => s.signature);
  const setBanner = useEditorStore((s) => s.setBanner);
  const editorSaving = useEditorStore((s) => s.isSaving);

  const activeId = signature?.banner_id;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await bannersAPI.getAll();
        const raw = data?.banners || [];
        const onlyWebinar = raw.filter(
          (b) =>
            String(b.id).toLowerCase() === WEBINAR_BANNER_UUID.toLowerCase() ||
            /webinar/i.test(String(b.name || ''))
        );
        setBanners(onlyWebinar);
      } catch {
        setBanners([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={editorSaving}
        onClick={() => setBanner(null)}
        className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Remove banner
      </button>

      <p className="text-xs text-slate-600">
        Webinar CTA strip — uses the same color palette as your signature (headline area, button,
        and accents). Text and link are editable under My information → Banner.
      </p>

      {banners.length === 0 ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          No Webinar banner is available from the API. With Supabase, run{' '}
          <code className="rounded bg-white/80 px-1">node src/scripts/seedTemplates.js</code> or ensure a
          banner row named Webinar (id <code className="rounded bg-white/80 px-1">b0000003-…</code>) exists.
        </p>
      ) : null}

      <ul className="space-y-3">
        {banners.map((b) => {
          const sw = webinarSwatches();
          const selected = String(activeId) === String(b.id);
          return (
            <li key={b.id}>
              <button
                type="button"
                disabled={editorSaving}
                onClick={() => setBanner(b.id)}
                className={`flex w-full gap-3 rounded-xl border-2 p-3 text-left transition hover:shadow-sm disabled:opacity-50 ${
                  selected ? 'border-[#3b5bdb] bg-transparent' : 'border-slate-300/60 bg-transparent'
                }`}
              >
                <WebinarBannerDesignPreview design={signature?.design} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{b.name || 'Webinar'}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sw.map((c, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-full border border-white shadow-sm ring-1 ring-slate-200/80"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
