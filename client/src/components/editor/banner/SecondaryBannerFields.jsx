import { HiArrowUpTray } from 'react-icons/hi2';
import { EDITOR_BLANK_BANNER_ASPECT_RATIO } from '../../../data/templatePreviews.js';
import { buildCtaBannerImageStyleObject } from '../../../lib/ctaBannerImageStyle.js';
import { Input } from '../../ui/Input.jsx';
import { CtaStripAssetUploadRows } from './CtaStripAssetUploadRows.jsx';
import {
  isDownloadBannerPreset,
  isNeedCallBannerPreset,
  isBoostImproveBannerPreset,
  isOnlineLoanBannerPreset,
  isBusinessCityBannerPreset,
  isLeaveReviewBannerPreset,
  isSeoWhitepaperBannerPreset,
  isGreenGradientCtaBannerPreset,
} from '../../../lib/templateIds.js';

const TEXTAREA_CLASS =
  'w-full resize-y rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.22)]';

/**
 * Second banner slot (below the first) — same field patterns as {@link PrimaryBannerFields}.
 */
export function SecondaryBannerFields({
  bc,
  mergeBannerCfg,
  bannerLabelClass,
  secondaryBannerImgDrop,
  uploadKind,
  isSecondaryWebinar,
  isSecondaryBlank,
  isSecondaryBookCall,
  isSecondaryBoostImprove = false,
  isSecondaryOnlineLoan = false,
  isSecondaryBusinessCity = false,
  isSecondaryLeaveReview = false,
  isSecondarySeoWhitepaper = false,
  isSecondaryGreenGradientCta = false,
  idPrefix = 'myinfo-2',
  blankStripRailPx = null,
}) {
  const blankPreviewRail =
    typeof blankStripRailPx === 'number' && blankStripRailPx > 0 ? blankStripRailPx : 280;
  const blankStripPreviewH = Math.max(48, Math.round((blankPreviewRail * 72) / 560));
  const blankSecPreviewStyle = buildCtaBannerImageStyleObject({
    fluidWidth: true,
    heightPx: blankStripPreviewH,
    extra: ['min-width:100%', `max-width:${blankPreviewRail}px`],
  });

  const isSecondaryDownload =
    Boolean(bc.secondary_banner_id) &&
    isDownloadBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryNeedCall =
    Boolean(bc.secondary_banner_id) &&
    isNeedCallBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryBoostImproveResolved =
    isSecondaryBoostImprove ||
    (Boolean(bc.secondary_banner_id) &&
      isBoostImproveBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondaryOnlineLoanResolved =
    isSecondaryOnlineLoan ||
    (Boolean(bc.secondary_banner_id) &&
      isOnlineLoanBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondaryBusinessCityResolved =
    isSecondaryBusinessCity ||
    (Boolean(bc.secondary_banner_id) &&
      isBusinessCityBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondaryLeaveReviewResolved =
    isSecondaryLeaveReview ||
    (Boolean(bc.secondary_banner_id) &&
      isLeaveReviewBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondarySeoWhitepaperResolved =
    isSecondarySeoWhitepaper ||
    (Boolean(bc.secondary_banner_id) &&
      isSeoWhitepaperBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondaryGreenGradientCtaResolved =
    isSecondaryGreenGradientCta ||
    (Boolean(bc.secondary_banner_id) &&
      isGreenGradientCtaBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondarySimple =
    Boolean(bc.secondary_banner_id) &&
    !isSecondaryWebinar &&
    !isSecondaryBookCall &&
    !isSecondaryBlank &&
    !isSecondaryDownload &&
    !isSecondaryNeedCall &&
    !isSecondaryBoostImproveResolved &&
    !isSecondaryOnlineLoanResolved &&
    !isSecondaryBusinessCityResolved &&
    !isSecondaryLeaveReviewResolved &&
    !isSecondarySeoWhitepaperResolved &&
    !isSecondaryGreenGradientCtaResolved;
  const h = `${idPrefix}-headline`;
  const s = `${idPrefix}-subtext`;
  const showFieldsDivider =
    !isSecondaryBoostImproveResolved &&
    !isSecondaryOnlineLoanResolved &&
    !isSecondaryLeaveReviewResolved &&
    !isSecondarySeoWhitepaperResolved &&
    !isSecondaryGreenGradientCtaResolved &&
    (isSecondaryWebinar ||
      isSecondaryBlank ||
      isSecondaryBookCall ||
      isSecondaryDownload ||
      isSecondaryNeedCall ||
      isSecondaryBusinessCityResolved ||
      isSecondarySimple);

  return (
    <>
      <Input
        label={isSecondaryBlank ? 'Optional link (wraps image)' : 'Link on this strip'}
        labelClassName={bannerLabelClass}
        placeholder="https://"
        value={bc.secondary_link_url || bc.secondary_href || ''}
        onChange={(e) =>
          mergeBannerCfg({ secondary_link_url: e.target.value, secondary_href: '' })
        }
      />
      {isSecondaryDownload ||
      isSecondaryNeedCall ||
      isSecondaryBusinessCityResolved ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>
            {isSecondaryBusinessCityResolved ? 'Optional logo' : 'Optional banner image'}
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            {isSecondaryBusinessCityResolved
              ? 'Top-right logo (replaces the yellow hex + COMPANY block). Fits the corner with compact sizing.'
              : 'Left promo thumb about 120×90; the whole image stays visible in the slot.'}
          </p>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              isSecondaryBusinessCityResolved ? (
                <div className="flex min-h-[72px] w-full max-w-[200px] items-center justify-end rounded-lg bg-[#1a1a2e] px-3 py-2">
                  <img
                    src={bc.secondary_banner_image_url}
                    alt=""
                    style={buildCtaBannerImageStyleObject({
                      widthPx: 180,
                      heightPx: 56,
                    })}
                  />
                </div>
              ) : (
                <img
                  src={bc.secondary_banner_image_url}
                  alt=""
                  className="max-w-full rounded-lg"
                  style={buildCtaBannerImageStyleObject({
                    widthPx: 120,
                    heightPx: 90,
                  })}
                />
              )
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">
                  {isSecondaryBusinessCityResolved ? 'Drop logo or click' : 'Drop image or click'}
                </span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ secondary_banner_image_url: '' })}
            >
              {isSecondaryBusinessCityResolved ? 'Remove logo' : 'Remove banner image'}
            </button>
          ) : null}
        </div>
      ) : null}
      {isSecondaryOnlineLoanResolved ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Center hero image</span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Defaults to the built-in illustration. Upload a wide promo (about 280×140); the full image stays visible in
            the center column.
          </p>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              <img
                src={bc.secondary_banner_image_url}
                alt=""
                className="max-w-full rounded-lg"
                style={buildCtaBannerImageStyleObject({
                  widthPx: 280,
                  heightPx: 140,
                })}
              />
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() =>
                mergeBannerCfg({
                  secondary_banner_image_url: '/banners/online-loan-banner-hero.png',
                })
              }
            >
              Reset to default hero
            </button>
          ) : null}
          <div className="space-y-4 pt-2">
            <Input
              label="Headline line 1"
              labelClassName={bannerLabelClass}
              value={bc.secondary_field_1 ?? ''}
              placeholder="Fast funding"
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
            <Input
              label="Headline line 2"
              labelClassName={bannerLabelClass}
              value={bc.secondary_field_2 ?? ''}
              placeholder="for your next move"
              onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
            />
            <Input
              label="Brand name (wordmark)"
              labelClassName={bannerLabelClass}
              value={bc.secondary_field_3 ?? ''}
              placeholder="YOUR BRAND"
              onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
            />
            <Input
              label="Button label"
              labelClassName={bannerLabelClass}
              value={bc.secondary_text ?? ''}
              placeholder="Get pre-approved"
              onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
            />
          </div>
        </div>
      ) : isSecondaryBusinessCityResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Decorative dots are fixed. Use optional logo above for the top-right; if empty, hex + badge text below
            are used.
          </p>
          <Input
            label="Small upper label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="LIMITED"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Accent headline (gold)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="SPOTS"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <Input
            label="Headline (dark)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? ''}
            placeholder="THIS MONTH"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
          <Input
            label="Fallback badge text (when no logo)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_5 ?? ''}
            placeholder="YOUR BRAND"
            onChange={(e) => mergeBannerCfg({ secondary_field_5: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="See pricing"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryLeaveReviewResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the review link above. Optionally upload a promo image (about 280×140) to replace the center
            illustration.
          </p>
          <span className={bannerLabelClass}>Promo image (optional)</span>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              <img
                src={bc.secondary_banner_image_url}
                alt=""
                className="max-w-full rounded-lg"
                style={buildCtaBannerImageStyleObject({
                  widthPx: 280,
                  heightPx: 140,
                })}
              />
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ secondary_banner_image_url: '' })}
            >
              Remove promo image
            </button>
          ) : null}
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="Loved working with us?"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="Leave a quick Google review — it helps others find us."
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
        </div>
      ) : isSecondarySeoWhitepaperResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the PDF or landing URL above. Optionally upload a wide promo image (about 280×90) to replace the grid
            art.
          </p>
          <span className={bannerLabelClass}>Promo image (optional)</span>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              <img
                src={bc.secondary_banner_image_url}
                alt=""
                className="max-w-full rounded-lg"
                style={buildCtaBannerImageStyleObject({
                  widthPx: 280,
                  heightPx: 90,
                })}
              />
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ secondary_banner_image_url: '' })}
            >
              Remove promo image
            </button>
          ) : null}
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="Free SEO checklist"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="PDF: 10 fixes that lift rankings this week"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
        </div>
      ) : isSecondaryGreenGradientCtaResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set your link above. Optionally upload a promo image (about 220×140) to replace the decorative shapes beside
            the CTA.
          </p>
          <span className={bannerLabelClass}>Promo image (optional)</span>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              <img
                src={bc.secondary_banner_image_url}
                alt=""
                className="max-w-full rounded-lg"
                style={buildCtaBannerImageStyleObject({
                  widthPx: 220,
                  heightPx: 140,
                })}
              />
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ secondary_banner_image_url: '' })}
            >
              Remove promo image
            </button>
          ) : null}
          <div className="w-full">
            <label htmlFor={`${idPrefix}-b13-headline`} className={bannerLabelClass}>
              Headline
            </label>
            <textarea
              id={`${idPrefix}-b13-headline`}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.secondary_field_1 ?? ''}
              placeholder={'Ready to grow\nyour business?'}
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Book free strategy call"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : null}
      {isSecondaryBlank ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Banner image</span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Fixed banner size (same width as your signature); the whole image is shown inside the strip—no crop.
          </p>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              <div
                className="mx-auto w-full overflow-hidden rounded-lg bg-[#f8fafc]"
                style={{
                  aspectRatio: EDITOR_BLANK_BANNER_ASPECT_RATIO,
                  width: '100%',
                  ...(typeof blankStripRailPx === 'number' && blankStripRailPx > 0
                    ? { maxWidth: `${blankStripRailPx}px` }
                    : {}),
                }}
              >
                <img src={bc.secondary_banner_image_url} alt="" className="rounded-lg" style={blankSecPreviewStyle} />
              </div>
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ secondary_banner_image_url: '' })}
            >
              Remove banner image
            </button>
          ) : null}
        </div>
      ) : null}
      {showFieldsDivider ? <hr className="border-slate-200/90" /> : null}
      {isSecondaryWebinar ? (
        <div className="space-y-4">
          <Input
            label="Brand line"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_5 ?? ''}
            placeholder="Acme Studio"
            onChange={(e) => mergeBannerCfg({ secondary_field_5: e.target.value })}
          />
          <div className="w-full">
            <label htmlFor={h} className={bannerLabelClass}>
              Headline
            </label>
            <textarea
              id={h}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.secondary_field_1 ?? ''}
              placeholder={'Book more clients without the hustle'}
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
          </div>
          <div className="w-full">
            <label htmlFor={s} className={bannerLabelClass}>
              Subtext
            </label>
            <textarea
              id={s}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.secondary_field_2 ?? ''}
              placeholder={'Free 15-minute fit call — we reply the same business day.'}
              onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? bc.secondary_text ?? ''}
            placeholder="Book free strategy call"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
        </div>
      ) : isSecondaryBoostImproveResolved ? (
        <div className="space-y-4">
          <CtaStripAssetUploadRows presetKind="boost" secondary mergeBannerCfg={mergeBannerCfg} bc={bc} />
          <Input
            label="Logo word (gold)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="BRAND"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Clear to hide the gold word; the left column shows only the mark.
          </p>
          <div>
            <label className={`block ${bannerLabelClass}`}>Headline (center)</label>
            <textarea
              className={TEXTAREA_CLASS}
              rows={3}
              value={bc.secondary_field_3 ?? ''}
              placeholder={'Better|Solutions.\nStronger|Results.'}
              onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
            />
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Each line: before <code className="text-slate-600">|</code> is navy; after is gold. Clear the field to hide
              the headline.
            </p>
          </div>
          <Input
            label="Supporting line (next to gold bar)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_4 ?? ''}
            placeholder="Smart solutions for every department."
            onChange={(e) => mergeBannerCfg({ secondary_field_4: e.target.value })}
          />
          <p className="text-[11px] leading-relaxed text-slate-400 -mt-2">Clear to hide the gold bar row.</p>
          <Input
            label='Right column blurb (white, small) — demo below'
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_6 ?? ''}
            placeholder="Explore smart solutions designed for impact. See how teams align strategy, execution, and measurement to ship outcomes faster."
            onChange={(e) => mergeBannerCfg({ secondary_field_6: e.target.value })}
          />
          <p className="text-[11px] leading-relaxed text-slate-400 -mt-2">
            Demo copy fills the right rail. Clear to hide; the rocket centers above the button.
          </p>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Explore now"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryBookCall ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Same layout as the main book-a-call strip: white + yellow headline, subtitle, button, wide photo.
          </p>
          <div>
            <label htmlFor={`${idPrefix}-sec-book-head-white`} className={bannerLabelClass}>
              Headline — white text (line breaks)
            </label>
            <textarea
              id={`${idPrefix}-sec-book-head-white`}
              rows={2}
              className={TEXTAREA_CLASS}
              placeholder={'Book your\nfree'}
              value={bc.secondary_field_1 ?? ''}
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
          </div>
          <Input
            label="Headline — yellow accent"
            labelClassName={bannerLabelClass}
            placeholder="strategy call"
            value={bc.secondary_field_2 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <div>
            <label htmlFor={`${idPrefix}-sec-book-sub`} className={bannerLabelClass}>
              Subtitle
            </label>
            <textarea
              id={`${idPrefix}-sec-book-sub`}
              rows={3}
              className={TEXTAREA_CLASS}
              placeholder={'Get expert advice. Discover opportunities.\nGrow your business.'}
              value={bc.secondary_field_3 ?? ''}
              onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            placeholder="BOOK NOW"
            value={bc.secondary_text ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
          <span className={bannerLabelClass}>Right photo (wide, about 3∶1)</span>
          <div
            {...secondaryBannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              secondaryBannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...secondaryBannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg2' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.secondary_banner_image_url || '').trim() ? (
              <img
                src={bc.secondary_banner_image_url}
                alt=""
                className="max-w-full rounded-lg"
                style={buildCtaBannerImageStyleObject({
                  widthPx: 160,
                  heightPx: 55,
                })}
              />
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.secondary_banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ secondary_banner_image_url: '' })}
            >
              Remove uploaded image
            </button>
          ) : null}
          <Input
            label="Image URL (optional, if no upload)"
            labelClassName={bannerLabelClass}
            placeholder="https://…"
            value={bc.secondary_field_5 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_5: e.target.value })}
          />
        </div>
      ) : isSecondaryDownload ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Second CTA: headline on the left, button label on the right. The row uses the secondary link above.
          </p>
          <Input
            label="Headline (left)"
            labelClassName={bannerLabelClass}
            placeholder="Download your free lead magnet (PDF)"
            value={bc.secondary_field_1 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            placeholder="Get it now"
            value={bc.secondary_text ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryNeedCall ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Same layout as the subscriber strip: headline lines, accent phrase, supporting line, then button.
          </p>
          <label className="block">
            <span className={bannerLabelClass}>Headline (before accent)</span>
            <textarea
              className={`${TEXTAREA_CLASS} mt-1 min-h-[72px]`}
              rows={3}
              placeholder={'Turn subscribers\ninto'}
              value={bc.secondary_field_1 ?? ''}
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
          </label>
          <Input
            label="Accent phrase"
            labelClassName={bannerLabelClass}
            placeholder="buyers."
            value={bc.secondary_field_2 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <Input
            label="Supporting line"
            labelClassName={bannerLabelClass}
            placeholder="Email marketing that engages, nurtures, and converts."
            value={bc.secondary_field_3 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
          <Input
            label="Button text"
            labelClassName={bannerLabelClass}
            placeholder="Start free trial"
            value={bc.secondary_text ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryBlank ? (
        <p className="text-xs leading-relaxed text-slate-600">
          This strip is only your uploaded image. Add an optional link above to make the whole image
          clickable.
        </p>
      ) : isSecondarySimple ? (
        <Input
          label="Banner button text"
          labelClassName={bannerLabelClass}
          placeholder="Book free strategy call"
          value={bc.secondary_text ?? ''}
          onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
        />
      ) : null}
    </>
  );
}
