import { HiArrowUpTray } from 'react-icons/hi2';
import { EDITOR_BLANK_BANNER_ASPECT_RATIO } from '../../../data/templatePreviews.js';
import { buildCtaBannerImageStyleObject } from '../../../lib/ctaBannerImageStyle.js';
import { Input } from '../../ui/Input.jsx';
import { CtaStripAssetUploadRows } from './CtaStripAssetUploadRows.jsx';

const TEXTAREA_CLASS =
  'w-full resize-y rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.22)]';

/**
 * First banner slot fields (link, image when applicable, type-specific copy).
 * Used from My information (banner section) and from the Banner styles tab.
 */
export function PrimaryBannerFields({
  bc,
  mergeBannerCfg,
  bannerLabelClass,
  bannerImgDrop,
  uploadKind,
  isWebinarBanner,
  isBlankBanner,
  isBookCallBanner,
  isBoostImproveBanner = false,
  isOnlineLoanBanner = false,
  isBusinessCityBanner = false,
  isLeaveReviewBanner = false,
  isSeoWhitepaperBanner = false,
  isGreenGradientCtaBanner = false,
  isDownloadBanner,
  isNeedCallBanner,
  isSimpleBanner,
  idPrefix = '',
  /** Layout rail (px) — blank strip preview matches signature width when set (My information). */
  blankStripRailPx = null,
}) {
  const blankPreviewRail =
    typeof blankStripRailPx === 'number' && blankStripRailPx > 0 ? blankStripRailPx : 280;
  const blankStripPreviewH = Math.max(48, Math.round((blankPreviewRail * 72) / 560));
  const blankPreviewStyle = buildCtaBannerImageStyleObject({
    fluidWidth: true,
    heightPx: blankStripPreviewH,
    extra: ['min-width:100%', `max-width:${blankPreviewRail}px`],
  });

  const h = idPrefix ? `${idPrefix}-webinar-headline` : 'webinar-banner-headline';
  const s = idPrefix ? `${idPrefix}-webinar-subtext` : 'webinar-banner-subtext';
  /** Omit divider when only link + compact fields (no optional image block). */
  const showFieldsDivider =
    isWebinarBanner ||
    isBusinessCityBanner ||
    (!isWebinarBanner &&
      !isBoostImproveBanner &&
      !isOnlineLoanBanner &&
      !isBookCallBanner &&
      !isLeaveReviewBanner &&
      !isSeoWhitepaperBanner &&
      !isGreenGradientCtaBanner);

  return (
    <>
      <Input
        label={isBlankBanner ? 'Optional link (wraps image)' : 'Link on banner'}
        labelClassName={bannerLabelClass}
        placeholder="https://"
        value={bc.link_url || bc.href || ''}
        onChange={(e) => mergeBannerCfg({ link_url: e.target.value })}
      />
      {!isWebinarBanner &&
      !isBoostImproveBanner &&
      !isOnlineLoanBanner &&
      !isBookCallBanner &&
      !isLeaveReviewBanner &&
      !isSeoWhitepaperBanner &&
      !isGreenGradientCtaBanner ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>
            {isBlankBanner ? 'Banner image' : isBusinessCityBanner ? 'Optional logo' : 'Optional banner image'}
          </span>
          {isBlankBanner ? (
            <p className="text-[11px] leading-relaxed text-slate-500">
              Fixed banner size; your image scales to fit inside the strip (full image visible, no crop).
            </p>
          ) : null}
          {isDownloadBanner || isNeedCallBanner ? (
            <p className="text-[11px] leading-relaxed text-slate-500">
              Optional left promo thumb — about <span className="font-medium">120×90</span>; the whole image stays visible.
            </p>
          ) : null}
          <div
            {...bannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              bannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...bannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.banner_image_url || '').trim() ? (
              isBlankBanner ? (
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
                  <img src={bc.banner_image_url} alt="" className="rounded-lg" style={blankPreviewStyle} />
                </div>
              ) : isBusinessCityBanner ? (
                <div className="flex min-h-[72px] w-full max-w-[200px] items-center justify-end rounded-lg bg-[#1a1a2e] px-3 py-2">
                  <img
                    src={bc.banner_image_url}
                    alt=""
                    style={buildCtaBannerImageStyleObject({
                      widthPx: 180,
                      heightPx: 56,
                    })}
                  />
                </div>
              ) : (
                <img
                  src={bc.banner_image_url}
                  alt=""
                  style={buildCtaBannerImageStyleObject({
                    widthPx: 200,
                    heightPx: 112,
                  })}
                  className="max-w-full rounded-lg"
                />
              )
            ) : (
              <>
                <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
                <span className="mt-2 text-xs font-medium text-slate-600">
                  {isBusinessCityBanner ? 'Drop logo or click' : 'Drop image or click'}
                </span>
                <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
              </>
            )}
          </div>
          {String(bc.banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ banner_image_url: '' })}
            >
              {isBusinessCityBanner ? 'Remove logo' : 'Remove banner image'}
            </button>
          ) : null}
        </div>
      ) : null}
      {showFieldsDivider ? <hr className="border-slate-200/90" /> : null}
      {isWebinarBanner ? (
        <div className="space-y-4">
          <Input
            label="Brand line"
            labelClassName={bannerLabelClass}
            value={bc.field_5 ?? ''}
            placeholder="Acme Studio"
            onChange={(e) => mergeBannerCfg({ field_5: e.target.value })}
          />
          <div className="w-full">
            <label htmlFor={h} className={bannerLabelClass}>
              Headline
            </label>
            <textarea
              id={h}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.field_1 ?? ''}
              placeholder={'Book more clients without the hustle'}
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
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
              value={bc.field_2 ?? ''}
              placeholder={'Free 15-minute fit call — we reply the same business day.'}
              onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? bc.text ?? ''}
            placeholder="Book free strategy call"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
        </div>
      ) : isBoostImproveBanner ? (
        <div className="space-y-4">
          <CtaStripAssetUploadRows presetKind="boost" mergeBannerCfg={mergeBannerCfg} bc={bc} />
          <Input
            label="Logo word (gold)"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="BRAND"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Clear to hide the gold word; the left column shows only the mark.
          </p>
          <div>
            <label className={`block ${bannerLabelClass}`}>Headline (center)</label>
            <textarea
              className={TEXTAREA_CLASS}
              rows={3}
              value={bc.field_3 ?? ''}
              placeholder={'Better|Solutions.\nStronger|Results.'}
              onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
            />
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Each line: text before <code className="text-slate-600">|</code> is navy; after is gold. New line = second
              row. Clear the field to remove the headline block from the preview.
            </p>
          </div>
          <Input
            label="Supporting line (next to gold bar)"
            labelClassName={bannerLabelClass}
            value={bc.field_4 ?? ''}
            placeholder="Smart solutions for every department."
            onChange={(e) => mergeBannerCfg({ field_4: e.target.value })}
          />
          <p className="text-[11px] leading-relaxed text-slate-400 -mt-2">
            Clear to hide the gold bar row; the center column stays balanced.
          </p>
          <Input
            label='Right column blurb (white, small) — demo below'
            labelClassName={bannerLabelClass}
            value={bc.field_6 ?? ''}
            placeholder="Explore smart solutions designed for impact. See how teams align strategy, execution, and measurement to ship outcomes faster."
            onChange={(e) => mergeBannerCfg({ field_6: e.target.value })}
          />
          <p className="text-[11px] leading-relaxed text-slate-400 -mt-2">
            Demo copy fills the right rail beside the rocket. Clear the field to hide it; the rocket then centers above
            the button.
          </p>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Explore now"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isBusinessCityBanner ? (
        <div className="space-y-4">
          <Input
            label="Small upper label"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="LIMITED"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Accent headline (gold)"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="SPOTS"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <Input
            label="Headline (dark)"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? ''}
            placeholder="THIS MONTH"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
          <Input
            label="Fallback badge text (when no logo)"
            labelClassName={bannerLabelClass}
            value={bc.field_5 ?? ''}
            placeholder="YOUR BRAND"
            onChange={(e) => mergeBannerCfg({ field_5: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="See pricing"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isLeaveReviewBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the review link above. Optionally upload a promo image (about 280×140) to replace the built-in
            illustration in the center; the arrow stays on the right.
          </p>
          <span className={bannerLabelClass}>Promo image (optional)</span>
          <div
            {...bannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              bannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...bannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.banner_image_url || '').trim() ? (
              <img
                src={bc.banner_image_url}
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
          {String(bc.banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ banner_image_url: '' })}
            >
              Remove promo image
            </button>
          ) : null}
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="Loved working with us?"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="Leave a quick Google review — it helps others find us."
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
        </div>
      ) : isSeoWhitepaperBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the PDF or landing URL above. Optionally upload a wide promo image (about 280×90) to replace the
            grid art next to the arrow.
          </p>
          <span className={bannerLabelClass}>Promo image (optional)</span>
          <div
            {...bannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              bannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...bannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.banner_image_url || '').trim() ? (
              <img
                src={bc.banner_image_url}
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
          {String(bc.banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ banner_image_url: '' })}
            >
              Remove promo image
            </button>
          ) : null}
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="Free SEO checklist"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="PDF: 10 fixes that lift rankings this week"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
        </div>
      ) : isGreenGradientCtaBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set your link above. Optionally upload a promo image (about 220×140) to replace the decorative shapes
            beside the CTA. Use a line break in the headline for a second line.
          </p>
          <span className={bannerLabelClass}>Promo image (optional)</span>
          <div
            {...bannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              bannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...bannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.banner_image_url || '').trim() ? (
              <img
                src={bc.banner_image_url}
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
          {String(bc.banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ banner_image_url: '' })}
            >
              Remove promo image
            </button>
          ) : null}
          <div className="w-full">
            <label htmlFor={idPrefix ? `${idPrefix}-b13-headline` : 'banner-b13-headline'} className={bannerLabelClass}>
              Headline
            </label>
            <textarea
              id={idPrefix ? `${idPrefix}-b13-headline` : 'banner-b13-headline'}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.field_1 ?? ''}
              placeholder={'Ready to grow\nyour business?'}
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Book free strategy call"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isOnlineLoanBanner ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Center hero image</span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Defaults to the built-in illustration. Upload a wide promo (about 280×140); the full image stays visible in
            the center column.
          </p>
          <div
            {...bannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              bannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...bannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.banner_image_url || '').trim() ? (
              <img
                src={bc.banner_image_url}
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
          {String(bc.banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ banner_image_url: '' })}
            >
              Use built-in illustration
            </button>
          ) : null}
          <div className="space-y-4 pt-2">
            <Input
              label="Headline line 1"
              labelClassName={bannerLabelClass}
              value={bc.field_1 ?? ''}
              placeholder="Fast funding"
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
            <Input
              label="Headline line 2"
              labelClassName={bannerLabelClass}
              value={bc.field_2 ?? ''}
              placeholder="for your next move"
              onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
            />
            <Input
              label="Brand name (wordmark)"
              labelClassName={bannerLabelClass}
              value={bc.field_3 ?? ''}
              placeholder="YOUR BRAND"
              onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
            />
            <Input
              label="Button label"
              labelClassName={bannerLabelClass}
              value={bc.text || ''}
              placeholder="Get pre-approved"
              onChange={(e) => mergeBannerCfg({ text: e.target.value })}
            />
          </div>
        </div>
      ) : isBookCallBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Blue gradient banner: white headline (line breaks allowed), yellow accent line, subtitle, pill button
            label, then a wide photo on the right. Upload an image or paste a URL — upload wins.
          </p>
          <div>
            <label htmlFor={idPrefix ? `${idPrefix}-book-head-white` : 'book-head-white'} className={bannerLabelClass}>
              Headline — white text (line breaks)
            </label>
            <textarea
              id={idPrefix ? `${idPrefix}-book-head-white` : 'book-head-white'}
              rows={2}
              className={TEXTAREA_CLASS}
              placeholder={'Book your\nfree'}
              value={bc.field_1 ?? ''}
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
          </div>
          <Input
            label="Headline — yellow accent"
            labelClassName={bannerLabelClass}
            placeholder="strategy call"
            value={bc.field_2 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <div>
            <label htmlFor={idPrefix ? `${idPrefix}-book-sub` : 'book-sub'} className={bannerLabelClass}>
              Subtitle
            </label>
            <textarea
              id={idPrefix ? `${idPrefix}-book-sub` : 'book-sub'}
              rows={3}
              className={TEXTAREA_CLASS}
              placeholder={'Get expert advice. Discover opportunities.\nGrow your business.'}
              value={bc.field_3 ?? ''}
              onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            placeholder="BOOK NOW"
            value={bc.text || ''}
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
          <span className={bannerLabelClass}>Right photo (wide, about 3∶1)</span>
          <div
            {...bannerImgDrop.getRootProps()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition ${
              bannerImgDrop.isDragActive
                ? 'border-[#3b5bdb] bg-blue-50/80'
                : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
            }`}
          >
            <input {...bannerImgDrop.getInputProps()} />
            {uploadKind === 'bannerImg' ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
            ) : String(bc.banner_image_url || '').trim() ? (
              <img
                src={bc.banner_image_url}
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
          {String(bc.banner_image_url || '').trim() ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
              onClick={() => mergeBannerCfg({ banner_image_url: '' })}
            >
              Remove uploaded image
            </button>
          ) : null}
          <Input
            label="Image URL (optional, if no upload)"
            labelClassName={bannerLabelClass}
            placeholder="https://…"
            value={bc.field_5 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_5: e.target.value })}
          />
        </div>
      ) : isDownloadBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            The strip has two text areas: a headline on the left and a pill-shaped button on the right. Both are
            editable; the whole row uses the link you set above.
          </p>
          <Input
            label="Headline (left)"
            labelClassName={bannerLabelClass}
            placeholder="Download your free lead magnet (PDF)"
            value={bc.field_1 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            placeholder="Get it now"
            value={bc.text || ''}
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isNeedCallBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Headline: use line breaks (e.g. first line &quot;Turn subscribers&quot;, second &quot;into&quot;). The
            accent phrase is highlighted in your palette accent color. If you use an em dash in the headline
            and leave supporting line empty, text after the dash becomes the gray subline.
          </p>
          <label className="block">
            <span className={bannerLabelClass}>Headline (before accent)</span>
            <textarea
              className={`${TEXTAREA_CLASS} mt-1 min-h-[72px]`}
              rows={3}
              placeholder={'Turn subscribers\ninto'}
              value={bc.field_1 ?? ''}
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
          </label>
          <Input
            label="Accent phrase (e.g. buyers.)"
            labelClassName={bannerLabelClass}
            placeholder="buyers."
            value={bc.field_2 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <Input
            label="Supporting line (below headline)"
            labelClassName={bannerLabelClass}
            placeholder="Email marketing that engages, nurtures, and converts."
            value={bc.field_3 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
          <Input
            label="Button text"
            labelClassName={bannerLabelClass}
            placeholder="Start free trial"
            value={bc.text || ''}
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isBlankBanner ? (
        <p className="text-xs leading-relaxed text-slate-600">
          This strip is only your uploaded image. Add an optional link above to make the whole image
          clickable.
        </p>
      ) : isSimpleBanner ? (
        <Input
          label="Banner button text"
          labelClassName={bannerLabelClass}
          value={bc.text || ''}
          onChange={(e) => mergeBannerCfg({ text: e.target.value })}
        />
      ) : null}
    </>
  );
}
