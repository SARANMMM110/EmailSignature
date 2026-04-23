import { HiArrowUpTray } from 'react-icons/hi2';
import { EDITOR_BLANK_BANNER_ASPECT_RATIO } from '../../../data/templatePreviews.js';
import { Input } from '../../ui/Input.jsx';

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
  isMindscopeBanner = false,
  isMailchimpBanner = false,
  isExploreWorldBanner = false,
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
  const h = idPrefix ? `${idPrefix}-webinar-headline` : 'webinar-banner-headline';
  const s = idPrefix ? `${idPrefix}-webinar-subtext` : 'webinar-banner-subtext';
  /** Omit divider when only link + compact fields (no optional image block). */
  const showFieldsDivider =
    isWebinarBanner ||
    (!isWebinarBanner &&
      !isMailchimpBanner &&
      !isExploreWorldBanner &&
      !isBoostImproveBanner &&
      !isOnlineLoanBanner &&
      !isBusinessCityBanner &&
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
      !isMailchimpBanner &&
      !isExploreWorldBanner &&
      !isBoostImproveBanner &&
      !isOnlineLoanBanner &&
      !isBusinessCityBanner &&
      !isLeaveReviewBanner &&
      !isSeoWhitepaperBanner &&
      !isGreenGradientCtaBanner ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>
            {isBlankBanner ? 'Banner image' : 'Optional banner image'}
          </span>
          {!isBlankBanner ? (
            <p className="text-[11px] leading-relaxed text-slate-500">
              {isMindscopeBanner
                ? 'Optional right-column photo for this strip (or leave empty for a simple card graphic). Same resize rules apply.'
                : 'Adds a photo to supported templates (book-a-call, download, need-a-call). Images are fitted inside 720×93 without changing the strip layout.'}
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
                  <img
                    src={bc.banner_image_url}
                    alt=""
                    className="h-full w-full min-h-0 min-w-0 rounded-lg object-cover object-center"
                  />
                </div>
              ) : (
                <img src={bc.banner_image_url} alt="" className="max-h-28 max-w-full rounded-lg object-contain" />
              )
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
              Remove banner image
            </button>
          ) : null}
        </div>
      ) : null}
      {showFieldsDivider ? <hr className="border-slate-200/90" /> : null}
      {isWebinarBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use line breaks in headline or subtext for a second line. If brand line is empty, your{' '}
            <span className="font-semibold">Company</span> name from My information is used.
          </p>
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
              placeholder={'Digital marketing\nexpert'}
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
              placeholder={'Projecting your brand into\nthe distant.'}
              onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? bc.text ?? ''}
            placeholder="Call to action"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
        </div>
      ) : isMindscopeBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use line breaks in the headline for a second line. If the brand line is empty, your{' '}
            <span className="font-semibold">Company</span> name from My information is used.
          </p>
          <Input
            label="Brand line"
            labelClassName={bannerLabelClass}
            value={bc.field_5 ?? ''}
            placeholder="MINDSCOPE"
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
              placeholder={'Applicant Tracking\nSystem & Recruiting CRM'}
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
          </div>
          <Input
            label="Tagline (before highlight)"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="Make Hiring "
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <Input
            label="Highlight"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? ''}
            placeholder="Easy!"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
          <Input
            label="Fine print (under button)"
            labelClassName={bannerLabelClass}
            value={bc.field_4 ?? ''}
            placeholder="No credit card required"
            onChange={(e) => mergeBannerCfg({ field_4: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Try For Free!"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isMailchimpBanner ? (
        <div className="space-y-4">
          <Input
            label="Panel copy"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder={"The industry's leading email marketing solution."}
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Get Started"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isExploreWorldBanner ? (
        <div className="space-y-4">
          <Input
            label="Small brand line (left rail)"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="explore"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Logo word (before icon)"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="log"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <Input
            label="Headline (white)"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? ''}
            placeholder="Explore Your"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
          <Input
            label="Accent word (gold)"
            labelClassName={bannerLabelClass}
            value={bc.field_4 ?? ''}
            placeholder="WORLD"
            onChange={(e) => mergeBannerCfg({ field_4: e.target.value })}
          />
          <Input
            label="URL line (display only)"
            labelClassName={bannerLabelClass}
            value={bc.field_5 ?? ''}
            placeholder="www.example.com"
            onChange={(e) => mergeBannerCfg({ field_5: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Learn More"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isBoostImproveBanner ? (
        <div className="space-y-4">
          <Input
            label="Small logo label (upper)"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="Mighty"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Logo word"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="LOGO"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <Input
            label="Headline"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? ''}
            placeholder="Boost and Improve"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
          <Input
            label="Subline"
            labelClassName={bannerLabelClass}
            value={bc.field_4 ?? ''}
            placeholder="Your Immune System"
            onChange={(e) => mergeBannerCfg({ field_4: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Click Here"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isBusinessCityBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Use line breaks in the tagline for a second line. Decorative dots in the strip are fixed.
          </p>
          <Input
            label="Small upper label"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="BUSINESS"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Accent headline (gold)"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="BANNER"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
          <Input
            label="Headline (dark)"
            labelClassName={bannerLabelClass}
            value={bc.field_3 ?? ''}
            placeholder="DESIGN"
            onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
          />
          <div className="w-full">
            <label htmlFor={idPrefix ? `${idPrefix}-b10-tag` : 'banner-b10-tagline'} className={bannerLabelClass}>
              Tagline
            </label>
            <textarea
              id={idPrefix ? `${idPrefix}-b10-tag` : 'banner-b10-tagline'}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.field_4 ?? ''}
              placeholder={'Lorem ipsum dolor sit amet, consectetur adipiscing elit do\neiusmod tempor incididunt.'}
              onChange={(e) => mergeBannerCfg({ field_4: e.target.value })}
            />
          </div>
          <Input
            label="Logo badge text"
            labelClassName={bannerLabelClass}
            value={bc.field_5 ?? ''}
            placeholder="COMPANY"
            onChange={(e) => mergeBannerCfg({ field_5: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="LEARN MORE"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isLeaveReviewBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the review link above; the illustration and arrow are built into the strip.
          </p>
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="Leave us a review"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="on Trustpilot"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
        </div>
      ) : isSeoWhitepaperBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set the PDF or landing URL above; the grid and arrow are built into the strip.
          </p>
          <Input
            label="Title"
            labelClassName={bannerLabelClass}
            value={bc.field_1 ?? ''}
            placeholder="SEO Whitepaper"
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Subtitle"
            labelClassName={bannerLabelClass}
            value={bc.field_2 ?? ''}
            placeholder="Free top 10 SEO tips PDF"
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
          />
        </div>
      ) : isGreenGradientCtaBanner ? (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Set your link above; the logo mark, decorative shapes, and arrow are built into the strip. Use a
            line break in the headline for a second line.
          </p>
          <div className="w-full">
            <label htmlFor={idPrefix ? `${idPrefix}-b13-headline` : 'banner-b13-headline'} className={bannerLabelClass}>
              Headline
            </label>
            <textarea
              id={idPrefix ? `${idPrefix}-b13-headline` : 'banner-b13-headline'}
              rows={3}
              className={TEXTAREA_CLASS}
              value={bc.field_1 ?? ''}
              placeholder={'A better\nfuture awaits'}
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
          </div>
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            value={bc.text || ''}
            placeholder="Book a call"
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isOnlineLoanBanner ? (
        <div className="space-y-2">
          <span className={bannerLabelClass}>Center hero image</span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Defaults to the built-in illustration. Upload a photo to replace the center image — it is cropped
            to a fixed 720×93 frame like other banner uploads.
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
              <img src={bc.banner_image_url} alt="" className="max-h-28 max-w-full rounded-lg object-contain" />
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
              placeholder="Online půjčka pro"
              onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
            />
            <Input
              label="Headline line 2"
              labelClassName={bannerLabelClass}
              value={bc.field_2 ?? ''}
              placeholder="každého"
              onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
            />
            <Input
              label="Brand name (wordmark)"
              labelClassName={bannerLabelClass}
              value={bc.field_3 ?? ''}
              placeholder="REVOLIO"
              onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
            />
            <Input
              label="Button label"
              labelClassName={bannerLabelClass}
              value={bc.text || ''}
              placeholder="CHCI PŮJČIT"
              onChange={(e) => mergeBannerCfg({ text: e.target.value })}
            />
          </div>
        </div>
      ) : isBookCallBanner ? (
        <div className="space-y-4">
          <Input
            label="Headline"
            labelClassName={bannerLabelClass}
            placeholder="Book a call today"
            value={bc.text || ''}
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
          <Input
            label="Right image URL (optional)"
            labelClassName={bannerLabelClass}
            placeholder="https://… (defaults to a stock team photo if empty)"
            value={bc.field_2 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
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
            placeholder="Download my resume"
            value={bc.field_1 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Button label"
            labelClassName={bannerLabelClass}
            placeholder="Download"
            value={bc.text || ''}
            onChange={(e) => mergeBannerCfg({ text: e.target.value })}
          />
        </div>
      ) : isNeedCallBanner ? (
        <div className="space-y-4">
          <Input
            label="Left text"
            labelClassName={bannerLabelClass}
            placeholder="Need a call?"
            value={bc.field_1 ?? ''}
            onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
          />
          <Input
            label="Button text"
            labelClassName={bannerLabelClass}
            placeholder="Pick a slot now"
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
