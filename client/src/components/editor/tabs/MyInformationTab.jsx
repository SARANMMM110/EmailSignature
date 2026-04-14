import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { HiArrowUpTray, HiPlus } from 'react-icons/hi2';
import { uploadAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { isFreePlan } from '../../../lib/plan.js';
import {
  isImageTemplateSignature,
  signatureLayoutSupportsLogo,
  isWebinarBannerPreset,
} from '../../../lib/templateIds.js';
import { Input } from '../../ui/Input.jsx';
import { Toggle } from '../../ui/Toggle.jsx';
import { PhotoCropModal } from '../../ui/PhotoCropModal.jsx';

export function MyInformationTab({ onToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { profile } = useAuth();
  const signature = useEditorStore((s) => s.signature);
  const updateField = useEditorStore((s) => s.updateField);
  const updateSignatureDesignImageUrl = useEditorStore((s) => s.updateSignatureDesignImageUrl);
  const setBanner = useEditorStore((s) => s.setBanner);
  const ensureBannersCache = useEditorStore((s) => s.ensureBannersCache);
  const plan = profile?.plan || 'free';
  const isFree = isFreePlan(plan);

  const [subTab, setSubTab] = useState('signature');
  const [uploadKind, setUploadKind] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropObjectUrl, setCropObjectUrl] = useState(null);
  const [addingBanner, setAddingBanner] = useState(false);

  const f = signature?.fields || {};
  const bc = signature?.banner_config || {};
  const isImageTpl = isImageTemplateSignature(signature);
  const sigDesignImg = String(signature?.design?.signatureImageUrl || f.signature_image_url || '').trim();

  const closeCropModal = useCallback(() => {
    setCropObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCropModalOpen(false);
  }, []);

  const onPhotoDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (!file) return;
    setCropObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCropModalOpen(true);
  }, []);

  const onCroppedPhotoConfirm = useCallback(
    async (blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      setUploadKind('photo');
      try {
        const { data } = await uploadAPI.uploadPhoto(file);
        updateField('fields.photo_url', data.url);
        onToast?.('Photo updated', 'success');
        closeCropModal();
      } catch {
        onToast?.('Photo upload failed', 'error');
      } finally {
        setUploadKind(null);
      }
    },
    [closeCropModal, updateField, onToast]
  );

  const photoDrop = useDropzone({
    onDrop: onPhotoDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: cropModalOpen || uploadKind === 'logo' || uploadKind === 'sigImage',
  });

  const onLogoDrop = useCallback(
    async (accepted) => {
      const file = accepted[0];
      if (!file) return;
      setUploadKind('logo');
      try {
        const { data } = await uploadAPI.uploadLogo(file);
        updateField('fields.logo_url', data.url);
        onToast?.('Logo updated', 'success');
      } catch {
        onToast?.('Logo upload failed', 'error');
      } finally {
        setUploadKind(null);
      }
    },
    [updateField, onToast]
  );

  const logoDrop = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: cropModalOpen || uploadKind === 'photo' || uploadKind === 'sigImage',
  });

  const onSigImageDrop = useCallback(
    async (accepted) => {
      const file = accepted[0];
      if (!file) return;
      setUploadKind('sigImage');
      try {
        const { data } = await uploadAPI.uploadLogo(file);
        updateSignatureDesignImageUrl(data.url);
        onToast?.('Signature design image updated', 'success');
      } catch {
        onToast?.('Image upload failed', 'error');
      } finally {
        setUploadKind(null);
      }
    },
    [updateSignatureDesignImageUrl, onToast]
  );

  const sigImageDrop = useDropzone({
    onDrop: onSigImageDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: cropModalOpen || uploadKind === 'photo' || uploadKind === 'logo',
  });

  useEffect(() => {
    if (!isFree || !signature) return;
    if (signature.show_badge === false) {
      updateField('show_badge', true);
    }
  }, [isFree, signature?.id, signature?.show_badge, updateField]);

  useEffect(() => {
    if (location.state?.myInfoSubTab === 'banner') {
      setSubTab('banner');
      navigate(location.pathname, { replace: true, state: { ...location.state, myInfoSubTab: undefined } });
    }
  }, [location.pathname, location.state, navigate]);

  if (!signature) return <p className="text-sm text-slate-500">Loading…</p>;

  const photoUrl = f.photo_url || f.photoUrl || '';
  const logoUrl = f.logo_url || f.logoUrl || '';
  const showLogoSection = signatureLayoutSupportsLogo(signature);

  const hasBannerCta =
    Boolean(signature.banner_id) || Boolean(String(bc.link_url || bc.href || '').trim());
  const isWebinarBanner = isWebinarBannerPreset(bc.preset_id, signature.banner_id);
  const isBookCallBanner =
    !isWebinarBanner && /book|call/i.test(String(bc.preset_id || ''));
  const isSecondaryWebinar = isWebinarBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryBookCall =
    Boolean(bc.secondary_link_url || bc.secondary_href || bc.secondary_banner_id) &&
    !isSecondaryWebinar &&
    /book|call/i.test(String(bc.secondary_preset_id || ''));

  const bannerLabelClass = 'mb-1.5 block text-sm font-bold text-slate-800';

  const mergeBannerCfg = (partial) => {
    const next = {
      ...bc,
      preset_id: bc.preset_id || 'book-call',
      link_url: bc.link_url ?? bc.href ?? '',
      text: bc.text ?? '',
      ...partial,
    };
    if (isWebinarBanner && partial.field_3 !== undefined) {
      next.text = String(partial.field_3);
    }
    if (isSecondaryWebinar && partial.secondary_field_3 !== undefined) {
      next.secondary_text = String(partial.secondary_field_3);
    }
    updateField('banner_config', next);
  };

  const handleAddCtaBanner = useCallback(async () => {
    setAddingBanner(true);
    try {
      const list = await ensureBannersCache();
      if (list?.length) {
        await setBanner(list[0].id);
        onToast?.('CTA banner added — adjust text and link below or pick another in Banners.', 'success');
      } else {
        navigate(`/editor/${id}/banners`);
      }
    } catch {
      navigate(`/editor/${id}/banners`);
    } finally {
      setAddingBanner(false);
    }
  }, [ensureBannersCache, setBanner, navigate, id, onToast]);

  return (
    <div className="space-y-7">
      <div className="flex rounded-full bg-slate-200/60 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setSubTab('signature')}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
            subTab === 'signature'
              ? 'bg-white text-[#2563eb] shadow-sm ring-1 ring-slate-200/70'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Signature
        </button>
        <button
          type="button"
          onClick={() => setSubTab('banner')}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
            subTab === 'banner'
              ? 'bg-white text-[#2563eb] shadow-sm ring-1 ring-slate-200/70'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Banner
        </button>
      </div>

      {subTab === 'signature' ? (
        <>
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Signature settings
            </h2>
            <div className="space-y-4">
              <Input
                label="Signature name"
                value={signature.label || ''}
                onChange={(e) => updateField('label', e.target.value)}
              />
              <Input
                label="Link on signature"
                placeholder="https://"
                value={signature.signature_link || ''}
                onChange={(e) => updateField('signature_link', e.target.value)}
              />
              {String(signature.signature_link || '').trim() ? (
                <p className="text-xs leading-relaxed text-slate-500">
                  Pasted mail uses HTML with a linked image. The PNG must be hosted at a URL the
                  recipient&apos;s mail provider can load (not only localhost), or they see a broken
                  picture while the link still works. Set{' '}
                  <span className="font-mono text-slate-600">PUBLIC_BASE_URL</span> on your API server to
                  your public HTTPS origin.
                </p>
              ) : null}
              <div
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
                title={isFree ? 'Upgrade to remove' : undefined}
              >
                <Toggle
                  label='Show "Made with SignatureBuilder" badge'
                  checked={isFree ? true : signature.show_badge !== false}
                  disabled={isFree}
                  onChange={(v) => updateField('show_badge', v)}
                />
              </div>
            </div>
          </section>

          {isImageTpl ? (
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Signature design image
              </h2>
              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                This layout uses your picture as the full signature. Replace the file or paste an image URL
                (HTTPS). Your name below is used as the image description for accessibility.
              </p>
              <Input
                label="Image URL"
                placeholder="https://"
                value={sigDesignImg}
                onChange={(e) => updateSignatureDesignImageUrl(e.target.value)}
              />
              <div
                {...sigImageDrop.getRootProps()}
                className="relative mt-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/90 px-4 py-6 text-center transition-colors hover:border-[#3b5bdb]"
              >
                <input {...sigImageDrop.getInputProps()} />
                {uploadKind === 'sigImage' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
                  </div>
                )}
                {sigDesignImg ? (
                  <img
                    src={sigDesignImg}
                    alt=""
                    className="max-h-40 max-w-full rounded-lg object-contain shadow-sm"
                  />
                ) : (
                  <>
                    <span className="text-slate-400">
                      <HiArrowUpTray className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="mt-2 text-xs font-medium text-slate-600">Upload design image</span>
                    <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
                  </>
                )}
              </div>
              {sigDesignImg ? (
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
                  onClick={() => updateSignatureDesignImageUrl('')}
                >
                  Remove image URL
                </button>
              ) : null}
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Personal info
            </h2>
            <div className="space-y-4">
              <Input
                label="Name"
                value={f.full_name || ''}
                onChange={(e) => updateField('fields.full_name', e.target.value)}
              />
              {!isImageTpl ? (
                <>
                  <Input
                    label="Job title"
                    value={f.job_title || ''}
                    onChange={(e) => updateField('fields.job_title', e.target.value)}
                  />
                  <Input
                    label="Phone number"
                    value={f.phone || ''}
                    onChange={(e) => updateField('fields.phone', e.target.value)}
                  />
                  <Input
                    label="Email address"
                    type="email"
                    value={f.email || ''}
                    onChange={(e) => updateField('fields.email', e.target.value)}
                  />
                  <Input
                    label="Website"
                    value={f.website || ''}
                    onChange={(e) => updateField('fields.website', e.target.value)}
                  />
                  <Input
                    label="Address (shown in signature)"
                    value={f.address || ''}
                    placeholder="e.g. Office 60, Calicut, Kerala, India"
                    onChange={(e) => updateField('fields.address', e.target.value)}
                  />
                  <Input
                    label="Company"
                    value={f.company || f.companyName || ''}
                    onChange={(e) => updateField('fields.company', e.target.value)}
                  />
                </>
              ) : (
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Other contact fields are hidden for image-only signatures; they are not shown in the email
                  HTML.
                </p>
              )}
            </div>
          </section>

          {!isImageTpl ? (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Photo
            </h2>
            <div
              {...photoDrop.getRootProps()}
              className="relative flex aspect-square max-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/90 text-center transition-colors hover:border-[#3b5bdb] hover:bg-slate-50"
            >
              <input {...photoDrop.getInputProps()} />
              {uploadKind === 'photo' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
                </div>
              )}
              {photoUrl ? (
                <img src={photoUrl} alt="" className="max-h-36 max-w-full rounded-lg object-cover" />
              ) : (
                <>
                  <span className="text-slate-400">
                    <HiArrowUpTray className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-2 text-xs font-medium text-slate-600">Upload photo</span>
                  <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
                </>
              )}
            </div>
          </section>
          ) : null}

          {showLogoSection && (
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Company logo
              </h2>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                Shown only on layouts that include a logo area (matches the template you picked).
              </p>
              <div
                {...logoDrop.getRootProps()}
                className="relative mt-4 flex min-h-[128px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/90 px-4 py-6 text-center transition-colors hover:border-[#3b5bdb]"
              >
                <input {...logoDrop.getInputProps()} />
                {uploadKind === 'logo' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
                  </div>
                )}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="max-h-20 max-w-[200px] object-contain"
                  />
                ) : (
                  <>
                    <span className="text-slate-400">
                      <HiArrowUpTray className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="mt-2 text-xs font-medium text-slate-600">Upload logo</span>
                    <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB · wide images work best</span>
                  </>
                )}
              </div>
              {logoUrl ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
                  onClick={() => updateField('fields.logo_url', '')}
                >
                  Remove logo
                </button>
              ) : null}
            </section>
          )}

        </>
      ) : hasBannerCta ? (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            Optional CTA under your signature. Pick another style anytime from{' '}
            <button
              type="button"
              onClick={() => navigate(`/editor/${id}/banners`)}
              className="font-semibold text-[#3b5bdb] hover:underline"
            >
              Banners
            </button>
            .
          </p>
          <Input
            label="Link on banner"
            labelClassName={bannerLabelClass}
            placeholder="https://"
            value={bc.link_url || bc.href || ''}
            onChange={(e) => mergeBannerCfg({ link_url: e.target.value })}
          />
          <hr className="border-slate-200/90" />
          {isWebinarBanner ? (
            <div className="space-y-4">
              <Input
                label="Field 1"
                labelClassName={bannerLabelClass}
                value={bc.field_1 ?? ''}
                placeholder="Email Marketing 101 Webinar"
                onChange={(e) => mergeBannerCfg({ field_1: e.target.value })}
              />
              <Input
                label="Field 2"
                labelClassName={bannerLabelClass}
                value={bc.field_2 ?? ''}
                placeholder="Only 10 seats available!"
                onChange={(e) => mergeBannerCfg({ field_2: e.target.value })}
              />
              <Input
                label="Field 3"
                labelClassName={bannerLabelClass}
                value={bc.field_3 ?? bc.text ?? ''}
                placeholder="Book my seat"
                onChange={(e) => mergeBannerCfg({ field_3: e.target.value })}
              />
              <Input
                label="Field 4"
                labelClassName={bannerLabelClass}
                value={bc.field_4 ?? ''}
                placeholder="88"
                inputMode="numeric"
                onChange={(e) => mergeBannerCfg({ field_4: e.target.value })}
              />
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
          ) : (
            <Input
              label="Banner button text"
              labelClassName={bannerLabelClass}
              value={bc.text || ''}
              onChange={(e) => mergeBannerCfg({ text: e.target.value })}
            />
          )}
          <div className="space-y-3 rounded-lg border border-slate-200/80 bg-white/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Second CTA (optional)
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Choose a second style under{' '}
              <button
                type="button"
                onClick={() => navigate(`/editor/${id}/banners`)}
                className="font-semibold text-[#3b5bdb] hover:underline"
              >
                Banners
              </button>{' '}
              (stacked under the first), then set link and copy here.
            </p>
            <Input
              label="Second link"
              labelClassName={bannerLabelClass}
              placeholder="https://"
              value={bc.secondary_link_url || bc.secondary_href || ''}
              onChange={(e) =>
                mergeBannerCfg({ secondary_link_url: e.target.value, secondary_href: '' })
              }
            />
            {isSecondaryWebinar ? (
              <div className="space-y-4">
                <Input
                  label="Second — field 1"
                  labelClassName={bannerLabelClass}
                  value={bc.secondary_field_1 ?? ''}
                  placeholder="Email Marketing 101 Webinar"
                  onChange={(e) => mergeBannerCfg({ secondary_field_1: e.target.value })}
                />
                <Input
                  label="Second — field 2"
                  labelClassName={bannerLabelClass}
                  value={bc.secondary_field_2 ?? ''}
                  placeholder="Only 10 seats available!"
                  onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
                />
                <Input
                  label="Second — field 3"
                  labelClassName={bannerLabelClass}
                  value={bc.secondary_field_3 ?? bc.secondary_text ?? ''}
                  placeholder="Book my seat"
                  onChange={(e) => mergeBannerCfg({ secondary_field_3: e.target.value })}
                />
                <Input
                  label="Second — field 4"
                  labelClassName={bannerLabelClass}
                  value={bc.secondary_field_4 ?? ''}
                  placeholder="88"
                  inputMode="numeric"
                  onChange={(e) => mergeBannerCfg({ secondary_field_4: e.target.value })}
                />
              </div>
            ) : isSecondaryBookCall ? (
              <div className="space-y-4">
                <Input
                  label="Second headline"
                  labelClassName={bannerLabelClass}
                  placeholder="Book a call today"
                  value={bc.secondary_text ?? ''}
                  onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
                />
                <Input
                  label="Second right image URL (optional)"
                  labelClassName={bannerLabelClass}
                  placeholder="https://…"
                  value={bc.secondary_field_2 ?? ''}
                  onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Second button / line text"
                  labelClassName={bannerLabelClass}
                  placeholder="Learn more"
                  value={bc.secondary_text ?? ''}
                  onChange={(e) => mergeBannerCfg({ secondary_text: e.target.value })}
                />
                <Input
                  label="Second image URL (optional, book-style strips)"
                  labelClassName={bannerLabelClass}
                  placeholder="https://…"
                  value={bc.secondary_field_2 ?? ''}
                  onChange={(e) => mergeBannerCfg({ secondary_field_2: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-10 text-center shadow-sm sm:px-8">
          <h3 className="text-lg font-bold tracking-tight text-[#0c1929]">No banner CTA added</h3>
          <p className="mx-auto mt-4 max-w-[320px] text-sm font-normal leading-relaxed text-neutral-800">
            You haven&apos;t selected a CTA banner yet ! Click on the button below to choose your CTA
            banner.
          </p>
          <button
            type="button"
            disabled={addingBanner}
            onClick={handleAddCtaBanner}
            className="mt-10 inline-flex items-center justify-center gap-3 rounded-xl bg-[#3b5bdb] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition hover:bg-[#324fcc] disabled:opacity-60"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15">
              {addingBanner ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <HiPlus className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden />
              )}
            </span>
            Add a CTA banner
          </button>
        </div>
      )}

      <PhotoCropModal
        open={cropModalOpen}
        imageSrc={cropObjectUrl}
        onClose={closeCropModal}
        onConfirm={onCroppedPhotoConfirm}
      />
    </div>
  );
}
