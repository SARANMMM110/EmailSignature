import { HiArrowUpTray } from 'react-icons/hi2';
import { EDITOR_BLANK_BANNER_ASPECT_RATIO } from '../../../data/templatePreviews.js';
import { Input } from '../../ui/Input.jsx';
import {
  isDownloadBannerPreset,
  isNeedCallBannerPreset,
  isMindscopeBannerPreset,
  isMailchimpBannerPreset,
  isExploreWorldBannerPreset,
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
  isSecondaryMailchimp = false,
  isSecondaryExploreWorld = false,
  isSecondaryBoostImprove = false,
  isSecondaryOnlineLoan = false,
  isSecondaryBusinessCity = false,
  isSecondaryLeaveReview = false,
  isSecondarySeoWhitepaper = false,
  isSecondaryGreenGradientCta = false,
  idPrefix = 'myinfo-2',
  blankStripRailPx = null,
}) {
  const isSecondaryDownload =
    Boolean(bc.secondary_banner_id) &&
    isDownloadBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryNeedCall =
    Boolean(bc.secondary_banner_id) &&
    isNeedCallBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryMindscope =
    Boolean(bc.secondary_banner_id) &&
    isMindscopeBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryMailchimpResolved =
    isSecondaryMailchimp ||
    (Boolean(bc.secondary_banner_id) &&
      isMailchimpBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
  const isSecondaryExploreWorldResolved =
    isSecondaryExploreWorld ||
    (Boolean(bc.secondary_banner_id) &&
      isExploreWorldBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id));
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
    !isSecondaryMindscope &&
    !isSecondaryMailchimpResolved &&
    !isSecondaryExploreWorldResolved &&
    !isSecondaryBoostImproveResolved &&
    !isSecondaryOnlineLoanResolved &&
    !isSecondaryBusinessCityResolved &&
    !isSecondaryLeaveReviewResolved &&
    !isSecondarySeoWhitepaperResolved &&
    !isSecondaryGreenGradientCtaResolved;
  const h = `${idPrefix}-headline`;
  const s = `${idPrefix}-subtext`;
  const showFieldsDivider =
    !isSecondaryMailchimpResolved &&
    !isSecondaryExploreWorldResolved &&
    !isSecondaryBoostImproveResolved &&
    !isSecondaryOnlineLoanResolved &&
    !isSecondaryBusinessCityResolved &&
    !isSecondaryLeaveReviewResolved &&
    !isSecondarySeoWhitepaperResolved &&
    !isSecondaryGreenGradientCtaResolved &&
    (isSecondaryWebinar ||
      isSecondaryMindscope ||
      isSecondaryBlank ||
      isSecondaryBookCall ||
      isSecondaryDownload ||
      isSecondaryNeedCall ||
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
      {isSecondaryOnlineLoanResolved ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Center hero image</span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Defaults to the built-in illustration. Upload a wide photo to replace the center (max 720×93px).
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
                className="max-h-28 max-w-full rounded-lg object-contain"
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
              placeholder="Online půjčka pro"
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
            <Input
              label="Headline line 2"
              labelClassName={bannerLabelClass}
              value={bc.secondary_field_2 ?? ''}
              placeholder="každého"
              onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
            />
            <Input
              label="Brand name (wordmark)"
              labelClassName={bannerLabelClass}
              value={bc.secondary_field_3 ?? ''}
              placeholder="REVOLIO"
              onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
            />
            <Input
              label="Button label"
              labelClassName={bannerLabelClass}
              value={bc.secondary_text ?? ''}
              placeholder="CHCI PŮJČIT"
              onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
            />
          </div>
        </div>
      ) : isSecondaryBusinessCityResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use line breaks in the tagline for a second line. Decorative dots in the strip are fixed.
          </p>
          <Input
            label="Small upper label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="BUSINESS"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Accent headline (gold)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="BANNER"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <Input
            label="Headline (dark)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? ''}
            placeholder="DESIGN"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
          <div className="w-full">
            <label htmlFor={`${idPrefix}-b10-tag`} className={bannerLabelClass}>
              Tagline
            </label>
            <textarea
              id={`${idPrefix}-b10-tag`}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.secondary_field_4 ?? ''}
              placeholder={'Lorem ipsum dolor sit amet, consectetur adipiscing elit do\neiusmod tempor incididunt.'}
              onChange={(e) => mergeBannerCfg({ secondary_field_4: e.target.value })}
            />
          </div>
          <Input
            label="Logo badge text"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_5 ?? ''}
            placeholder="COMPANY"
            onChange={(e) => mergeBannerCfg({ secondary_field_5: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="LEARN MORE"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryLeaveReviewResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the review link above; the illustration and arrow are built into the strip.
          </p>
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="Leave us a review"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="on Trustpilot"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
        </div>
      ) : isSecondarySeoWhitepaperResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the PDF or landing URL above; the grid and arrow are built into the strip.
          </p>
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="SEO Whitepaper"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="Free top 10 SEO tips PDF"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
        </div>
      ) : isSecondaryGreenGradientCtaResolved ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set your link above; the logo mark, decorative shapes, and arrow are built into the strip.
          </p>
          <div className="w-full">
            <label htmlFor={`${idPrefix}-b13-headline`} className={bannerLabelClass}>
              Headline
            </label>
            <textarea
              id={`${idPrefix}-b13-headline`}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.secondary_field_1 ?? ''}
              placeholder={'A better\nfuture awaits'}
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Book a call"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : null}
      {isSecondaryMindscope ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Optional right-column photo</span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Same resize rules as your main strip (max 720×93px).
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
                className="max-h-28 max-w-full rounded-lg object-contain"
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
              Remove banner image
            </button>
          ) : null}
        </div>
      ) : null}
      {isSecondaryBlank ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Banner image</span>
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
                <img
                  src={bc.secondary_banner_image_url}
                  alt=""
                  className="h-full w-full min-h-0 min-w-0 rounded-lg object-cover object-center"
                />
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
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use line breaks in headline or subtext for a second line. If brand line is empty, your{' '}
            <span className="font-semibold">Company</span> name from My information is used.
          </p>
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
              placeholder={'Digital marketing\nexpert'}
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
              placeholder={'Projecting your brand into\nthe distant.'}
              onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? bc.secondary_text ?? ''}
            placeholder="Call to action"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
        </div>
      ) : isSecondaryMailchimpResolved ? (
        <div className="space-y-4">
          <Input
            label="Panel copy"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder={"The industry's leading email marketing solution."}
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Get Started"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryExploreWorldResolved ? (
        <div className="space-y-4">
          <Input
            label="Small brand line (left rail)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="explore"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Logo word (before icon)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="log"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <Input
            label="Headline (white)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? ''}
            placeholder="Explore Your"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
          <Input
            label="Accent word (gold)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_4 ?? ''}
            placeholder="WORLD"
            onChange={(e) => mergeBannerCfg({ secondary_field_4: e.target.value })}
          />
          <Input
            label="URL line (display only)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_5 ?? ''}
            placeholder="www.example.com"
            onChange={(e) => mergeBannerCfg({ secondary_field_5: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Learn More"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryBoostImproveResolved ? (
        <div className="space-y-4">
          <Input
            label="Small logo label (upper)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_1 ?? ''}
            placeholder="Mighty"
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Logo word"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="LOGO"
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <Input
            label="Headline"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? ''}
            placeholder="Boost and Improve"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
          <Input
            label="Subline"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_4 ?? ''}
            placeholder="Your Immune System"
            onChange={(e) => mergeBannerCfg({ secondary_field_4: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Click Here"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryMindscope ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use line breaks in the headline for a second line. If the brand line is empty, your{' '}
            <span className="font-semibold">Company</span> name from My information is used.
          </p>
          <Input
            label="Brand line"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_5 ?? ''}
            placeholder="MINDSCOPE"
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
              placeholder={'Applicant Tracking\nSystem & Recruiting CRM'}
              onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
            />
          </div>
          <Input
            label="Tagline (before highlight)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_2 ?? ''}
            placeholder="Make Hiring "
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
          />
          <Input
            label="Highlight"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_3 ?? ''}
            placeholder="Easy!"
            onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
          />
          <Input
            label="Fine print (under button)"
            labelClassName={bannerLabelClass}
            value={bc.secondary_field_4 ?? ''}
            placeholder="No credit card required"
            onChange={(e) => mergeBannerCfg({ secondary_field_4: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.secondary_text ?? ''}
            placeholder="Try For Free!"
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryBookCall ? (
        <div className="space-y-4">
          <Input
            label="Headline"
            labelClassName={bannerLabelClass}
            placeholder="Book a call today"
            value={bc.secondary_text ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
          <Input
            label="Right image URL (optional)"
            labelClassName={bannerLabelClass}
            placeholder="https://… (defaults to a stock team photo if empty)"
            value={bc.secondary_field_2 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
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
            placeholder="Download my resume"
            value={bc.secondary_field_1 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            placeholder="Download"
            value={bc.secondary_text ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
          />
        </div>
      ) : isSecondaryNeedCall ? (
        <div className="space-y-4">
          <Input
            label="Left text"
            labelClassName={bannerLabelClass}
            placeholder="Need a call?"
            value={bc.secondary_field_1 ?? ''}
            onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
          />
          <Input
            label="Button text"
            labelClassName={bannerLabelClass}
            placeholder="Pick a slot now"
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
          placeholder="Learn more"
          value={bc.secondary_text ?? ''}
          onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
        />
      ) : null}
    </>
  );
}
