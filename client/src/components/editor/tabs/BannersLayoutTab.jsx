import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi2';
import { bannersAPI } from '../../../lib/api.js';
import { useEditorStore, signatureHasRenderablePrimaryBanner } from '../../../store/editorStore.js';
import {
  WEBINAR_BANNER_UUID,
  BANNER_SLUG_TO_UUID,
  BLANK_IMAGE_BANNER_UUID,
  MINDSCOPE_BANNER_UUID,
  MAILCHIMP_BANNER_UUID,
  EXPLORE_WORLD_BANNER_UUID,
  BOOST_IMPROVE_BANNER_UUID,
  ONLINE_LOAN_BANNER_UUID,
  LEAVE_REVIEW_BANNER_UUID,
  SEO_WHITEPAPER_BANNER_UUID,
  GREEN_GRADIENT_CTA_BANNER_UUID,
} from '../../../lib/templateIds.js';
import { filterAndSortEditorBanners } from '../../../lib/editorBanners.js';
import { webinarBannerThumbnailSrcDoc } from '../../../data/webinarBannerStaticHtml.js';
import {
  bookCallBannerThumbnailSrcDoc,
  downloadBannerThumbnailSrcDoc,
  needCallBannerThumbnailSrcDoc,
  blankImageBannerThumbnailSrcDoc,
  mindscopeBannerThumbnailSrcDoc,
  mailchimpCampaignBannerThumbnailSrcDoc,
  exploreWorldBannerThumbnailSrcDoc,
  boostImproveBannerThumbnailSrcDoc,
  onlineLoanBannerThumbnailSrcDoc,
  leaveReviewBannerThumbnailSrcDoc,
  seoWhitepaperBannerThumbnailSrcDoc,
  greenGradientCtaBannerThumbnailSrcDoc,
} from '../../../data/ctaBannerThumbnails.js';
import { resolvePaletteColorsFromDesign } from '../../../lib/resolveDesignPalette.js';
import { useI18n } from '../../../hooks/useI18n.js';
import { usePlanGate } from '../../../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../../../store/upgradeModalStore.js';
import { PLANS } from '../../../data/plans.js';

const BANNER_DOC_W = 470;
const BANNER_DOC_H = 136;
const CARD_THUMB_W = 320;
const CARD_THUMB_H = 88;
const CARD_THUMB_SCALE = Math.min(CARD_THUMB_W / BANNER_DOC_W, CARD_THUMB_H / BANNER_DOC_H);

function normBannerId(x) {
  return String(x || '').trim().toLowerCase();
}

const WEBINAR_CTA_SHOWCASE_COLORS = ['#e8630a', '#e8630a', '#94a3b8', '#0f172a'];

function WebinarBannerDesignPreview({ design, thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => {
    const [c1, c2, c3, c4] =
      design?.apply_brand_palette_to_cta_banners === true
        ? resolvePaletteColorsFromDesign(design)
        : WEBINAR_CTA_SHOWCASE_COLORS;
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

function BlankImageBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => blankImageBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Image-only banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function MindscopeBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => mindscopeBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Mindscope-style banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function MailchimpCampaignBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => mailchimpCampaignBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Campaign strip banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function ExploreWorldBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => exploreWorldBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Explore your world banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function BoostImproveBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => boostImproveBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Boost and improve banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function OnlineLoanBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => onlineLoanBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Online loan banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function LeaveReviewBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => leaveReviewBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Leave a review banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function SeoWhitepaperBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => seoWhitepaperBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="SEO whitepaper banner preview"
      srcDoc={srcDoc}
      thumbW={thumbW}
      thumbH={thumbH}
      scale={scale}
    />
  );
}

function GreenGradientCtaBannerThumb({ thumbW, thumbH, scale }) {
  const srcDoc = useMemo(() => greenGradientCtaBannerThumbnailSrcDoc(), []);
  return (
    <StaticBannerIframePreview
      title="Green gradient CTA banner preview"
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
  if (id === MINDSCOPE_BANNER_UUID.toLowerCase()) {
    return <MindscopeBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === MAILCHIMP_BANNER_UUID.toLowerCase()) {
    return <MailchimpCampaignBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === EXPLORE_WORLD_BANNER_UUID.toLowerCase()) {
    return <ExploreWorldBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BOOST_IMPROVE_BANNER_UUID.toLowerCase()) {
    return <BoostImproveBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === ONLINE_LOAN_BANNER_UUID.toLowerCase()) {
    return <OnlineLoanBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === LEAVE_REVIEW_BANNER_UUID.toLowerCase()) {
    return <LeaveReviewBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === SEO_WHITEPAPER_BANNER_UUID.toLowerCase()) {
    return <SeoWhitepaperBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === GREEN_GRADIENT_CTA_BANNER_UUID.toLowerCase()) {
    return <GreenGradientCtaBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BANNER_SLUG_TO_UUID.download.toLowerCase()) {
    return <DownloadBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BANNER_SLUG_TO_UUID['need-call'].toLowerCase()) {
    return <NeedCallBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
  }
  if (id === BLANK_IMAGE_BANNER_UUID.toLowerCase()) {
    return <BlankImageBannerThumb thumbW={thumbW} thumbH={thumbH} scale={scale} />;
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

/**
 * One card per banner style. Hover shows + ; click fills slot 1 or slot 2 (max two banners).
 */
function BannerStripRow({
  banner,
  design,
  selectedPrimary,
  selectedSecondary,
  disabled,
  locked,
  onPick,
  onLocked,
  ariaPickLabel,
}) {
  const selected = selectedPrimary || selectedSecondary;
  return (
    <li>
      <button
        type="button"
        disabled={disabled && !locked}
        onClick={() => {
          if (locked) {
            onLocked?.();
            return;
          }
          onPick(banner.id);
        }}
        aria-label={ariaPickLabel}
        aria-pressed={selected}
        className={`group relative w-full overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-[0_2px_12px_-4px_rgba(15,23,42,0.12)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b5bdb]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
          selectedPrimary
            ? 'border-[#3b5bdb] ring-2 ring-[#3b5bdb]/22'
            : selectedSecondary
              ? 'border-violet-500 ring-2 ring-violet-400/25'
              : 'border-slate-200/90 hover:border-slate-300/90'
        }`}
      >
        <div
          className="relative mx-auto rounded-[10px]"
          style={{ width: CARD_THUMB_W, height: CARD_THUMB_H }}
        >
          <BannerThumbnail banner={banner} design={design} />
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[10px] bg-slate-900/0 transition-colors duration-200 group-hover:bg-slate-900/35"
            aria-hidden
          >
            <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-[#3b5bdb] text-white opacity-0 shadow-lg ring-2 ring-white/90 transition duration-200 group-hover:scale-100 group-hover:opacity-100">
              <HiPlus className="h-6 w-6" strokeWidth={2.25} />
            </span>
          </div>
          {locked ? (
            <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-1 rounded-[10px] bg-white/88 px-2 text-center">
              <span className="text-lg" aria-hidden>
                🔒
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-600">Upgrade</span>
            </div>
          ) : null}
        </div>
      </button>
    </li>
  );
}

/** Banner style cards only — links and text are edited under My information. */
export function BannersLayoutTab({ onToast }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const maxBanners = gate.limit('cta_banner_templates');
  const [banners, setBanners] = useState([]);
  /** Avoid flashing the empty-state warning before `bannersAPI.getAll()` resolves. */
  const [bannersReady, setBannersReady] = useState(false);

  const signature = useEditorStore((s) => s.signature);
  const setBanner = useEditorStore((s) => s.setBanner);
  const setSecondaryBanner = useEditorStore((s) => s.setSecondaryBanner);
  const clearPrimaryBanner = useEditorStore((s) => s.clearPrimaryBanner);
  const editorSaving = useEditorStore((s) => s.isSaving);

  const activeId = signature?.banner_id;
  const activeSecondaryId = signature?.banner_config?.secondary_banner_id;

  const handlePickBanner = useCallback(
    async (bannerId) => {
      if (!bannerId || editorSaving) return;
      /** `banner_id` can exist without `banner_config` (stale row) — fill first slot, not the second. */
      const primaryReady = signatureHasRenderablePrimaryBanner(signature);
      if (!activeId || !primaryReady) {
        await setBanner(bannerId);
        return;
      }
      if (normBannerId(activeId) === normBannerId(bannerId)) return;
      if (!activeSecondaryId) {
        await setSecondaryBanner(bannerId);
        return;
      }
      if (normBannerId(activeSecondaryId) === normBannerId(bannerId)) return;
      onToast?.(t('editor.bannersMaxReached'), 'error');
    },
    [activeId, activeSecondaryId, editorSaving, onToast, setBanner, setSecondaryBanner, signature, t]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await bannersAPI.getAll();
        if (cancelled) return;
        const raw = data?.banners || [];
        setBanners(filterAndSortEditorBanners(raw));
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setBannersReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (maxBanners === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#0f172a]">{t('editor.banners')}</h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <div className="text-3xl" aria-hidden>
            📢
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">{`CTA Banners — ${PLANS.advanced.name} and ${PLANS.ultimate.name}`}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Add clickable call-to-action banners below your signature. This feature is included on {PLANS.advanced.name}{' '}
            (5 templates) and {PLANS.ultimate.name} (all templates).
          </p>
          <button
            type="button"
            className="mt-6 inline-flex rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1d4ed8]"
            onClick={() => navigate('/settings#plan')}
          >
            {`Upgrade to ${PLANS.advanced.name} →`}
          </button>
          <p className="mt-3 text-xs text-slate-400">
            {PLANS.advanced.name}: 5 banner templates · {PLANS.ultimate.name}: all banner templates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-[#0f172a]">{t('editor.banners')}</h1>
      </div>

      {bannersReady && banners.length === 0 ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          No CTA banners returned from the API. With Supabase, run{' '}
          <code className="rounded bg-white/80 px-1">node src/scripts/seedTemplates.js</code> or ensure banner rows
          exist (ids <code className="rounded bg-white/80 px-1">b0000001</code> …{' '}
          <code className="rounded bg-white/80 px-1">b0000010</code>).
        </p>
      ) : null}

      <section className="space-y-3">
        <ul className="flex flex-col gap-3">
          {banners.map((b, idx) => {
            const slotLocked = idx >= maxBanners;
            const nid = normBannerId(b.id);
            const isBlank = nid === String(BLANK_IMAGE_BANNER_UUID).toLowerCase();
            const tier = String(b.tier || 'free').toLowerCase();
            const premiumLocked = tier !== 'free' && !gate.can('premium_banner_presets');
            const customLocked = isBlank && !gate.can('custom_banner_image_upload');
            const locked = slotLocked || premiumLocked || customLocked;
            return (
              <BannerStripRow
                key={b.id}
                banner={b}
                design={signature?.design}
                selectedPrimary={normBannerId(activeId) === normBannerId(b.id)}
                selectedSecondary={normBannerId(activeSecondaryId) === normBannerId(b.id)}
                disabled={editorSaving}
                locked={locked}
                onPick={handlePickBanner}
                onLocked={() => {
                  if (slotLocked) {
                    showUpgradeModal({
                      feature: 'cta_banner_templates',
                      requiredPlan: gate.planId === 'personal' ? 'advanced' : 'ultimate',
                      message:
                        gate.planId === 'personal'
                          ? `Upgrade to ${PLANS.advanced.name} to unlock CTA banner templates.`
                          : `Upgrade to ${PLANS.ultimate.name} for more banner templates.`,
                    });
                  } else if (customLocked) {
                    showUpgradeModal({
                      feature: 'custom_banner_image_upload',
                      requiredPlan: 'advanced',
                      message: `Upload a custom image for your banner strip on ${PLANS.advanced.name} or ${PLANS.ultimate.name}.`,
                    });
                  } else if (premiumLocked) {
                    showUpgradeModal({
                      feature: 'premium_banner_presets',
                      requiredPlan: 'advanced',
                      message: `Premium banner styles are included on ${PLANS.advanced.name} and ${PLANS.ultimate.name}.`,
                    });
                  }
                }}
                ariaPickLabel={`Choose ${b.name || 'banner'} for your CTA strip`}
              />
            );
          })}
        </ul>
      </section>

      {banners.length > 0 && (activeId || activeSecondaryId) ? (
        <div className="flex flex-col items-center gap-2 border-t border-slate-200/80 pt-4 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 sm:gap-y-2">
          {activeSecondaryId ? (
            <button
              type="button"
              disabled={editorSaving}
              onClick={() => setSecondaryBanner(null)}
              className="text-xs font-medium text-slate-600 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
            >
              {t('editor.removeBottomBanner')}
            </button>
          ) : null}
          {activeId ? (
            <button
              type="button"
              disabled={editorSaving}
              onClick={() => clearPrimaryBanner()}
              className="text-xs font-medium text-slate-600 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50"
            >
              {activeSecondaryId ? t('editor.removeTopBannerPromote') : t('editor.removeCta')}
            </button>
          ) : null}
          {activeId && activeSecondaryId ? (
            <button
              type="button"
              disabled={editorSaving}
              onClick={() => setBanner(null)}
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
            >
              {t('editor.removeBothBanners')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
