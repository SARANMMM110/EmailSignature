import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { HiArrowUpTray, HiPlus } from 'react-icons/hi2';
import { uploadAPI } from '../../../lib/api.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { useI18n } from '../../../hooks/useI18n.js';
import { usePlanGate } from '../../../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../../../store/upgradeModalStore.js';
import { BRAND_NAME } from '../../../constants/brand.js';
import { PLANS } from '../../../data/plans.js';
import {
  isImageTemplateSignature,
  signatureLayoutSupportsLogo,
  isWebinarBannerPreset,
  isBlankImageBannerPreset,
  isDownloadBannerPreset,
  isNeedCallBannerPreset,
  isBoostImproveBannerPreset,
  isOnlineLoanBannerPreset,
  isBusinessCityBannerPreset,
  isLeaveReviewBannerPreset,
  isSeoWhitepaperBannerPreset,
  isGreenGradientCtaBannerPreset,
  isBookCallBannerPreset,
  bundleRailPxForSignature,
  normalizeSignatureTemplateSlug,
} from '../../../lib/templateIds.js';
import { myInfoShowsField, templateShowsPhotoSlot } from '../../../lib/templateMyInfoFields.js';
import { Input } from '../../ui/Input.jsx';
import { PrimaryBannerFields } from '../banner/PrimaryBannerFields.jsx';
import { SecondaryBannerFields } from '../banner/SecondaryBannerFields.jsx';
import { Toggle } from '../../ui/Toggle.jsx';
import { PhotoCropModal } from '../../ui/PhotoCropModal.jsx';

export function MyInformationTab({ onToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { profile } = useAuth();
  const { t } = useI18n();
  const signature = useEditorStore((s) => s.signature);
  const updateField = useEditorStore((s) => s.updateField);
  const updateSignatureDesignImageUrl = useEditorStore((s) => s.updateSignatureDesignImageUrl);
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const maxUploadBytes = (gate.limit('media_upload_limit_mb') || 5) * 1024 * 1024;
  const badgePlanLocked = !gate.can('hide_made_with_badge');
  const canWholeSigLink = gate.can('whole_sig_clickthrough_url');

  const [subTab, setSubTab] = useState('signature');
  const [uploadKind, setUploadKind] = useState(null); // 'photo' | 'logo' | 'sigImage' | 'bannerImg' | 'bannerImg2'
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropObjectUrl, setCropObjectUrl] = useState(null);

  const f = signature?.fields || {};
  const social = signature?.social_links || {};
  const bc = signature?.banner_config || {};
  const bannerStripRailPx = useMemo(() => bundleRailPxForSignature(signature), [signature]);
  const isImageTpl = isImageTemplateSignature(signature);
  const layoutSlug = normalizeSignatureTemplateSlug(signature?.design, signature?.template_id);
  const showField = (key) => myInfoShowsField(signature, key);
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
      const file = new File([blob], 'photo.png', { type: 'image/png' });
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
    maxSize: maxUploadBytes,
    multiple: false,
    disabled:
      cropModalOpen ||
      uploadKind === 'logo' ||
      uploadKind === 'sigImage' ||
      uploadKind === 'bannerImg' ||
      uploadKind === 'bannerImg2',
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
    maxSize: maxUploadBytes,
    multiple: false,
    disabled:
      cropModalOpen ||
      uploadKind === 'photo' ||
      uploadKind === 'sigImage' ||
      uploadKind === 'bannerImg' ||
      uploadKind === 'bannerImg2',
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
    maxSize: maxUploadBytes,
    multiple: false,
    disabled:
      cropModalOpen ||
      uploadKind === 'photo' ||
      uploadKind === 'logo' ||
      uploadKind === 'bannerImg' ||
      uploadKind === 'bannerImg2',
  });

  useEffect(() => {
    if (!badgePlanLocked || !signature) return;
    if (signature.show_badge === false) {
      updateField('show_badge', true);
    }
  }, [badgePlanLocked, signature?.id, signature?.show_badge, updateField]);

  useEffect(() => {
    const next = location.state?.myInfoSubTab;
    if (next === 'banner' || next === 'signature') {
      setSubTab(next);
      const suffix = `${location.search || ''}${location.hash || ''}`;
      navigate(`${location.pathname}${suffix}`, {
        replace: true,
        state: { ...location.state, myInfoSubTab: undefined },
      });
    }
  }, [location.pathname, location.search, location.hash, location.state, navigate]);

  useLayoutEffect(() => {
    const id = String(location.hash || '').replace(/^#/, '');
    if (
      id !== 'editor-myinfo-signature' &&
      id !== 'editor-myinfo-banner' &&
      id !== 'editor-myinfo-banner-2'
    )
      return;
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }, [location.hash, subTab]);

  if (!signature) return <p className="text-sm text-slate-500">Loading…</p>;

  const photoUrl = f.photo_url || f.photoUrl || '';
  const logoUrl = f.logo_url || f.logoUrl || '';
  const showLogoSection = signatureLayoutSupportsLogo(signature);

  const hasBannerCta =
    Boolean(signature.banner_id) ||
    Boolean(bc.secondary_banner_id) ||
    Boolean(String(bc.link_url || bc.href || '').trim());
  const isWebinarBanner = isWebinarBannerPreset(bc.preset_id, signature.banner_id);
  const isBlankBanner = isBlankImageBannerPreset(bc.preset_id, signature.banner_id);
  const isDownloadBanner = isDownloadBannerPreset(bc.preset_id, signature.banner_id);
  const isNeedCallBanner = isNeedCallBannerPreset(bc.preset_id, signature.banner_id);
  const isBoostImproveBanner = isBoostImproveBannerPreset(bc.preset_id, signature.banner_id);
  const isOnlineLoanBanner = isOnlineLoanBannerPreset(bc.preset_id, signature.banner_id);
  const isBusinessCityBanner = isBusinessCityBannerPreset(bc.preset_id, signature.banner_id);
  const isLeaveReviewBanner = isLeaveReviewBannerPreset(bc.preset_id, signature.banner_id);
  const isSeoWhitepaperBanner = isSeoWhitepaperBannerPreset(bc.preset_id, signature.banner_id);
  const isGreenGradientCtaBanner = isGreenGradientCtaBannerPreset(bc.preset_id, signature.banner_id);
  const isBookCallBanner =
    !isWebinarBanner &&
    !isBlankBanner &&
    !isDownloadBanner &&
    !isNeedCallBanner &&
    !isBoostImproveBanner &&
    !isOnlineLoanBanner &&
    !isBusinessCityBanner &&
    !isLeaveReviewBanner &&
    !isSeoWhitepaperBanner &&
    !isGreenGradientCtaBanner &&
    isBookCallBannerPreset(bc.preset_id, signature.banner_id);
  const isSimpleBanner =
    !isWebinarBanner &&
    !isBookCallBanner &&
    !isBlankBanner &&
    !isDownloadBanner &&
    !isNeedCallBanner &&
    !isBoostImproveBanner &&
    !isOnlineLoanBanner &&
    !isBusinessCityBanner &&
    !isLeaveReviewBanner &&
    !isSeoWhitepaperBanner &&
    !isGreenGradientCtaBanner;

  const isSecondaryWebinar = isWebinarBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryBlank = isBlankImageBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryDownload =
    Boolean(bc.secondary_banner_id) &&
    isDownloadBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryNeedCall =
    Boolean(bc.secondary_banner_id) &&
    isNeedCallBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryBoostImprove =
    Boolean(bc.secondary_banner_id) &&
    isBoostImproveBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryOnlineLoan =
    Boolean(bc.secondary_banner_id) &&
    isOnlineLoanBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryBusinessCity =
    Boolean(bc.secondary_banner_id) &&
    isBusinessCityBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryLeaveReview =
    Boolean(bc.secondary_banner_id) &&
    isLeaveReviewBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondarySeoWhitepaper =
    Boolean(bc.secondary_banner_id) &&
    isSeoWhitepaperBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryGreenGradientCta =
    Boolean(bc.secondary_banner_id) &&
    isGreenGradientCtaBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);
  const isSecondaryBookCall =
    Boolean(bc.secondary_banner_id) &&
    !isSecondaryWebinar &&
    !isSecondaryBlank &&
    !isSecondaryDownload &&
    !isSecondaryNeedCall &&
    !isSecondaryBoostImprove &&
    !isSecondaryOnlineLoan &&
    !isSecondaryBusinessCity &&
    !isSecondaryLeaveReview &&
    !isSecondarySeoWhitepaper &&
    !isSecondaryGreenGradientCta &&
    isBookCallBannerPreset(bc.secondary_preset_id, bc.secondary_banner_id);

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
    updateField('banner_config', next);
  };

  const mergeSecondaryBannerCfg = useCallback(
    (partial) => {
      const sig = useEditorStore.getState().signature;
      if (!sig) return;
      const prev = sig.banner_config || {};
      const next = { ...prev, ...partial };
      if (
        isWebinarBannerPreset(next.secondary_preset_id, next.secondary_banner_id) &&
        partial.secondary_field_3 !== undefined
      ) {
        next.secondary_text = String(partial.secondary_field_3);
      }
      updateField('banner_config', next);
    },
    [updateField]
  );

  const onBannerImgDrop = useCallback(
    async (accepted) => {
      const file = accepted[0];
      if (!file) return;
      setUploadKind('bannerImg');
      try {
        const sceneSlot = isNeedCallBannerPreset(bc.preset_id, signature?.banner_id);
        const businessCitySlot = isBusinessCityBannerPreset(bc.preset_id, signature?.banner_id);
        const { data } = await uploadAPI.uploadBannerImage(
          file,
          sceneSlot
            ? { mode: 'scene' }
            : businessCitySlot
              ? { mode: 'mark' }
              : {}
        );
        mergeBannerCfg({ banner_image_url: data.url });
        onToast?.(
          businessCitySlot
            ? t('editor.bannerLogoUpdatedSlot', { n: 1 })
            : t('editor.bannerImageUpdatedSlot', { n: 1 }),
          'success'
        );
      } catch {
        onToast?.('Banner image upload failed', 'error');
      } finally {
        setUploadKind(null);
      }
    },
    [bc.preset_id, mergeBannerCfg, onToast, signature, t]
  );

  const bannerImgDrop = useDropzone({
    onDrop: onBannerImgDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: maxUploadBytes,
    multiple: false,
    disabled:
      cropModalOpen ||
      uploadKind === 'photo' ||
      uploadKind === 'logo' ||
      uploadKind === 'sigImage' ||
      uploadKind === 'bannerImg2',
  });

  const onSecondaryBannerImgDrop = useCallback(
    async (accepted) => {
      const file = accepted[0];
      if (!file) return;
      setUploadKind('bannerImg2');
      try {
        const sceneSlot2 =
          Boolean(bc.secondary_banner_id) &&
          isNeedCallBannerPreset(bc.secondary_preset_id || '', bc.secondary_banner_id);
        const businessCitySlot2 =
          Boolean(bc.secondary_banner_id) &&
          isBusinessCityBannerPreset(bc.secondary_preset_id || '', bc.secondary_banner_id);
        const { data } = await uploadAPI.uploadBannerImage(
          file,
          sceneSlot2
            ? { mode: 'scene' }
            : businessCitySlot2
              ? { mode: 'mark' }
              : {}
        );
        mergeSecondaryBannerCfg({ secondary_banner_image_url: data.url });
        onToast?.(
          businessCitySlot2
            ? t('editor.bannerLogoUpdatedSlot', { n: 2 })
            : t('editor.bannerImageUpdatedSlot', { n: 2 }),
          'success'
        );
      } catch {
        onToast?.('Upload failed', 'error');
      } finally {
        setUploadKind(null);
      }
    },
    [
      bc.secondary_banner_id,
      bc.secondary_preset_id,
      mergeSecondaryBannerCfg,
      onToast,
      signature,
      t,
    ]
  );

  const secondaryBannerImgDrop = useDropzone({
    onDrop: onSecondaryBannerImgDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: maxUploadBytes,
    multiple: false,
    disabled:
      cropModalOpen ||
      uploadKind === 'photo' ||
      uploadKind === 'logo' ||
      uploadKind === 'sigImage' ||
      uploadKind === 'bannerImg',
  });

  const handleAddCtaBanner = useCallback(() => {
    navigate(`/editor/${id}/banners`);
  }, [navigate, id]);

  const hashId = String(location.hash || '').replace(/^#/, '');
  const isBannerQuickEdit =
    (hashId === 'editor-myinfo-banner' || hashId === 'editor-myinfo-banner-2') && hasBannerCta;

  if (isBannerQuickEdit) {
    const goFullMyInfo = () => {
      setSubTab('signature');
      navigate(`${location.pathname}${location.search || ''}#editor-myinfo-signature`, {
        replace: true,
      });
    };

    if (hashId === 'editor-myinfo-banner-2' && !bc.secondary_banner_id) {
      return (
        <div className="space-y-5" id="editor-myinfo-banner-2">
          <button
            type="button"
            onClick={goFullMyInfo}
            className="text-left text-sm font-semibold text-[#2563eb] underline-offset-2 hover:underline"
          >
            ← Full My information
          </button>
          <div className="scroll-mt-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">{t('editor.bannerSlot', { n: 2 })}</p>
            <p className="mt-2 text-sm text-slate-600">
              {t('editor.noSecondBannerYetBeforeLink')}{' '}
              <button
                type="button"
                onClick={() => navigate(`/editor/${id}/banners`)}
                className="font-semibold text-[#3b5bdb] hover:underline"
              >
                {t('editor.banners')}
              </button>
              {t('editor.noSecondBannerYetAfterLink')}
            </p>
          </div>
          <PhotoCropModal
            open={cropModalOpen}
            imageSrc={cropObjectUrl}
            onClose={closeCropModal}
            onConfirm={onCroppedPhotoConfirm}
          />
        </div>
      );
    }

    if (hashId === 'editor-myinfo-banner-2' && bc.secondary_banner_id) {
      return (
        <div className="space-y-5">
          <button
            type="button"
            onClick={goFullMyInfo}
            className="text-left text-sm font-semibold text-[#2563eb] underline-offset-2 hover:underline"
          >
            ← Full My information
          </button>
          <div
            id="editor-myinfo-banner-2"
            className="scroll-mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-800">{t('editor.bannerSlot', { n: 2 })}</p>
            <p className="text-xs text-slate-600">Link and labels for this strip only.</p>
            <SecondaryBannerFields
              bc={bc}
              mergeBannerCfg={mergeSecondaryBannerCfg}
              bannerLabelClass={bannerLabelClass}
              secondaryBannerImgDrop={secondaryBannerImgDrop}
              uploadKind={uploadKind === 'bannerImg2' ? uploadKind : null}
              isSecondaryWebinar={isSecondaryWebinar}
              isSecondaryBlank={isSecondaryBlank}
              isSecondaryBookCall={isSecondaryBookCall}
              isSecondaryBoostImprove={isSecondaryBoostImprove}
              isSecondaryOnlineLoan={isSecondaryOnlineLoan}
              isSecondaryBusinessCity={isSecondaryBusinessCity}
              isSecondaryLeaveReview={isSecondaryLeaveReview}
              isSecondarySeoWhitepaper={isSecondarySeoWhitepaper}
              isSecondaryGreenGradientCta={isSecondaryGreenGradientCta}
              idPrefix="myinfo-secondary-banner"
              blankStripRailPx={bannerStripRailPx}
            />
          </div>
          <PhotoCropModal
            open={cropModalOpen}
            imageSrc={cropObjectUrl}
            onClose={closeCropModal}
            onConfirm={onCroppedPhotoConfirm}
          />
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={goFullMyInfo}
          className="text-left text-sm font-semibold text-[#2563eb] underline-offset-2 hover:underline"
        >
          ← Full My information
        </button>
        <div
          id="editor-myinfo-banner"
          className="scroll-mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-slate-800">{t('editor.bannerSlot', { n: 1 })}</p>
          <p className="text-xs text-slate-600">Link and wording for this banner only.</p>
          <PrimaryBannerFields
            bc={bc}
            mergeBannerCfg={mergeBannerCfg}
            bannerLabelClass={bannerLabelClass}
            bannerImgDrop={bannerImgDrop}
            uploadKind={uploadKind}
            isWebinarBanner={isWebinarBanner}
            isBlankBanner={isBlankBanner}
            isBookCallBanner={isBookCallBanner}
            isBoostImproveBanner={isBoostImproveBanner}
            isOnlineLoanBanner={isOnlineLoanBanner}
            isBusinessCityBanner={isBusinessCityBanner}
            isLeaveReviewBanner={isLeaveReviewBanner}
            isSeoWhitepaperBanner={isSeoWhitepaperBanner}
            isGreenGradientCtaBanner={isGreenGradientCtaBanner}
            isDownloadBanner={isDownloadBanner}
            isNeedCallBanner={isNeedCallBanner}
            isSimpleBanner={isSimpleBanner}
            blankStripRailPx={bannerStripRailPx}
          />
        </div>
        <PhotoCropModal
          open={cropModalOpen}
          imageSrc={cropObjectUrl}
          onClose={closeCropModal}
          onConfirm={onCroppedPhotoConfirm}
        />
      </div>
    );
  }

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
          {t('editor.myInfoBannerDetailsSubtab')}
        </button>
      </div>

      {subTab === 'signature' ? (
        <>
          <section
            id="editor-myinfo-signature"
            className="scroll-mt-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Signature settings
            </h2>
            <div className="space-y-4">
              <Input
                label="Signature name"
                value={signature.label || ''}
                onChange={(e) => updateField('label', e.target.value)}
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">Link on signature</span>
                  {!canWholeSigLink ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                      {PLANS.advanced.name}
                    </span>
                  ) : null}
                </div>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#3b5bdb] focus:outline-none focus:ring-2 focus:ring-[#3b5bdb]/20 disabled:cursor-not-allowed"
                    type="url"
                    placeholder="https://your-website.com"
                    disabled={!canWholeSigLink}
                    value={signature.signature_link || ''}
                    onChange={(e) => updateField('signature_link', e.target.value)}
                  />
                  {!canWholeSigLink ? (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2563eb] hover:underline"
                      onClick={() =>
                        showUpgradeModal({
                          feature: 'whole_sig_clickthrough_url',
                          requiredPlan: 'advanced',
                          title: 'Clickable signature',
                          message: `Makes the entire signature clickable. Available on ${PLANS.advanced.name} and ${PLANS.ultimate.name}.`,
                        })
                      }
                    >
                      Unlock →
                    </button>
                  ) : null}
                </div>
                {!canWholeSigLink ? (
                  <p className="text-xs text-slate-400">
                    {`Makes the entire signature clickable. Available on ${PLANS.advanced.name} and ${PLANS.ultimate.name}.`}
                  </p>
                ) : null}
              </div>
              <div
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
                style={{ opacity: badgePlanLocked ? 0.85 : 1 }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Toggle
                    label={`Show "Made with ${BRAND_NAME}" badge`}
                    checked={badgePlanLocked ? true : signature.show_badge !== false}
                    disabled={badgePlanLocked}
                    onChange={(v) => {
                      if (badgePlanLocked) {
                        showUpgradeModal({
                          feature: 'hide_made_with_badge',
                          requiredPlan: 'advanced',
                          message: `Upgrade to ${PLANS.advanced.name} to hide the ${BRAND_NAME} badge.`,
                        });
                        return;
                      }
                      updateField('show_badge', v);
                    }}
                  />
                  {badgePlanLocked ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                      {`Required on ${PLANS.personal.name}`}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {badgePlanLocked
                    ? `Upgrade to ${PLANS.advanced.name} to remove branding.`
                    : 'Optional branding below your signature.'}
                </p>
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
                    <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max {gate.limit('media_upload_limit_mb')}MB</span>
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
                  {showField('job_title') ? (
                    <div className="w-full">
                      <Input
                        label="Job title"
                        value={f.job_title || ''}
                        onChange={(e) => updateField('fields.job_title', e.target.value)}
                      />
                      {layoutSlug === 'template_11' ? (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                          Use a line break for a short second line (shown as a small line by your photo).
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {showField('phone') ? (
                    <Input
                      label="Phone number"
                      value={f.phone || ''}
                      onChange={(e) => updateField('fields.phone', e.target.value)}
                    />
                  ) : null}
                  {showField('email') ? (
                    <Input
                      label="Email address"
                      type="email"
                      value={f.email || ''}
                      onChange={(e) => updateField('fields.email', e.target.value)}
                    />
                  ) : null}
                  {showField('website') ? (
                    <Input
                      label="Website"
                      value={f.website || ''}
                      onChange={(e) => updateField('fields.website', e.target.value)}
                    />
                  ) : null}
                  {showField('address') ? (
                    <Input
                      label="Address (shown in signature)"
                      value={f.address || ''}
                      placeholder="e.g. Office 60, Calicut, Kerala, India"
                      onChange={(e) => updateField('fields.address', e.target.value)}
                    />
                  ) : null}
                  {showField('company') ? (
                    <div className="w-full">
                      <label
                        htmlFor="fields-company"
                        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Company / organization
                      </label>
                      <textarea
                        id="fields-company"
                        rows={2}
                        value={f.company || f.companyName || ''}
                        onChange={(e) => updateField('fields.company', e.target.value)}
                        placeholder="Shown when this layout includes a company line or wordmark area."
                        className="w-full resize-y rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.22)]"
                      />
                    </div>
                  ) : null}
                  {showField('tagline') ? (
                    <div className="w-full">
                      <label
                        htmlFor="fields-tagline"
                        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {layoutSlug === 'template_11' ? 'Intro / subtitle' : 'Tagline / extra line'}
                      </label>
                      <textarea
                        id="fields-tagline"
                        rows={3}
                        value={f.tagline || ''}
                        onChange={(e) => updateField('fields.tagline', e.target.value)}
                        placeholder={
                          layoutSlug === 'template_11'
                            ? 'Short text under your name (optional).'
                            : 'Optional second line next to your logo area on this layout.'
                        }
                        className="w-full resize-y rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.22)]"
                      />
                    </div>
                  ) : null}
                  {showField('facebook') ? (
                    <Input
                      label="Facebook profile URL"
                      placeholder="https://facebook.com/…"
                      value={social.facebook || ''}
                      onChange={(e) => updateField('social_links.facebook', e.target.value)}
                    />
                  ) : null}
                  {showField('twitter') ? (
                    <Input
                      label="X / Twitter or Instagram (SNS line)"
                      placeholder="@Yournamehere or profile URL"
                      value={social.twitter || ''}
                      onChange={(e) => updateField('social_links.twitter', e.target.value)}
                    />
                  ) : null}
                  {showField('linkedin') ? (
                    <Input
                      label="LinkedIn profile URL"
                      placeholder="https://www.linkedin.com/in/…"
                      value={social.linkedin || ''}
                      onChange={(e) => updateField('social_links.linkedin', e.target.value)}
                    />
                  ) : null}
                  {showField('github') ? (
                    <Input
                      label="Portfolio URL (middle icon — Behance, Dribbble, etc.)"
                      placeholder="https://…"
                      value={social.github || ''}
                      onChange={(e) => updateField('social_links.github', e.target.value)}
                    />
                  ) : null}
                  {showField('instagram') ? (
                    <Input
                      label="Instagram profile URL"
                      placeholder="https://www.instagram.com/…"
                      value={social.instagram || ''}
                      onChange={(e) => updateField('social_links.instagram', e.target.value)}
                    />
                  ) : null}
                  {showField('telegram') ? (
                    <Input
                      label="Telegram link"
                      placeholder="https://t.me/…"
                      value={social.telegram || ''}
                      onChange={(e) => updateField('social_links.telegram', e.target.value)}
                    />
                  ) : null}
                </>
              ) : (
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Other contact fields are hidden for image-only signatures; they are not shown in the email
                  HTML.
                </p>
              )}
            </div>
          </section>

          {!isImageTpl && templateShowsPhotoSlot(signature) ? (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Profile photo (optional)
            </h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
              Your headshot or avatar in the template. Turn off to remove portrait and initials from HTML
              (no empty boxes) — layout reflows like when no photo is uploaded.
            </p>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
              <Toggle
                id="editor-show-photo"
                label="Show profile photo in signature"
                checked={signature.design?.showPhoto !== false && signature.design?.show_photo !== false}
                onChange={(v) => updateField('design.showPhoto', v)}
              />
            </div>
            <div
              {...photoDrop.getRootProps()}
              className="relative mt-4 flex min-h-[128px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/90 px-4 py-6 text-center transition-colors hover:border-[#3b5bdb]"
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
                  <span className="mt-1 text-[10px] text-slate-400">
                    PNG, JPG, WebP · max {gate.limit('media_upload_limit_mb')}MB
                  </span>
                </>
              )}
            </div>
            {photoUrl ? (
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
                onClick={() => updateField('fields.photo_url', '')}
              >
                Remove profile photo
              </button>
            ) : null}
          </section>
          ) : null}

          {showLogoSection && (
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Brand logo (optional)
              </h2>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                Optional mark if you use one. Turn off to remove logo areas from HTML (no empty boxes).
              </p>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                <Toggle
                  id="editor-show-logo"
                  label="Show logo in signature"
                  checked={signature.design?.showLogo !== false && signature.design?.show_logo !== false}
                  onChange={(v) => updateField('design.showLogo', v)}
                />
                <p className="mt-2 text-xs text-slate-500">
                  Turn off to drop logo columns and marks from the HTML (no empty placeholders).
                </p>
              </div>
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
                    <span className="mt-1 text-[10px] text-slate-400">
                      PNG, JPG, WebP · max {gate.limit('media_upload_limit_mb')}MB · wide images work best
                    </span>
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
        <>
          <div
            id="editor-myinfo-banner"
            className="scroll-mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-800">{t('editor.bannerSlot', { n: 1 })}</p>
            <p className="text-sm text-slate-600">
              Optional strip under your signature. Pick another style anytime from{' '}
              <button
                type="button"
                onClick={() => navigate(`/editor/${id}/banners`)}
                className="font-semibold text-[#3b5bdb] hover:underline"
              >
                {t('editor.banners')}
              </button>
              .
            </p>
            <PrimaryBannerFields
              bc={bc}
              mergeBannerCfg={mergeBannerCfg}
              bannerLabelClass={bannerLabelClass}
              bannerImgDrop={bannerImgDrop}
              uploadKind={uploadKind}
              isWebinarBanner={isWebinarBanner}
              isBlankBanner={isBlankBanner}
              isBookCallBanner={isBookCallBanner}
              isBoostImproveBanner={isBoostImproveBanner}
              isOnlineLoanBanner={isOnlineLoanBanner}
              isBusinessCityBanner={isBusinessCityBanner}
              isLeaveReviewBanner={isLeaveReviewBanner}
              isSeoWhitepaperBanner={isSeoWhitepaperBanner}
              isGreenGradientCtaBanner={isGreenGradientCtaBanner}
              isDownloadBanner={isDownloadBanner}
              isNeedCallBanner={isNeedCallBanner}
              isSimpleBanner={isSimpleBanner}
              blankStripRailPx={bannerStripRailPx}
            />
            {bc.secondary_banner_id ? (
              <div
                id="editor-myinfo-banner-2"
                className="scroll-mt-4 mt-6 space-y-4 border-t border-slate-200/80 pt-6"
              >
                <p className="text-sm font-semibold text-slate-800">{t('editor.bannerSlot', { n: 2 })}</p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {t('editor.bannerSlot2BlurbLead')}{' '}
                  <button
                    type="button"
                    onClick={() => navigate(`/editor/${id}/banners`)}
                    className="font-semibold text-[#3b5bdb] hover:underline"
                  >
                    {t('editor.banners')}
                  </button>{' '}
                  {t('editor.bannerSlot2BlurbTail')}
                </p>
                <SecondaryBannerFields
                  bc={bc}
                  mergeBannerCfg={mergeSecondaryBannerCfg}
                  bannerLabelClass={bannerLabelClass}
                  secondaryBannerImgDrop={secondaryBannerImgDrop}
                  uploadKind={uploadKind === 'bannerImg2' ? uploadKind : null}
                  isSecondaryWebinar={isSecondaryWebinar}
                  isSecondaryBlank={isSecondaryBlank}
                  isSecondaryBookCall={isSecondaryBookCall}
                  isSecondaryBoostImprove={isSecondaryBoostImprove}
                  isSecondaryOnlineLoan={isSecondaryOnlineLoan}
                  isSecondaryBusinessCity={isSecondaryBusinessCity}
                  isSecondaryLeaveReview={isSecondaryLeaveReview}
                  isSecondarySeoWhitepaper={isSecondarySeoWhitepaper}
                  isSecondaryGreenGradientCta={isSecondaryGreenGradientCta}
                  idPrefix="myinfo-secondary-banner"
                  blankStripRailPx={bannerStripRailPx}
                />
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed text-slate-500">
                {t('editor.bannerStackHintLead')}{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/editor/${id}/banners`)}
                  className="font-semibold text-[#3b5bdb] hover:underline"
                >
                  {t('editor.banners')}
                </button>{' '}
                {t('editor.bannerStackHintTail')}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-10 text-center shadow-sm sm:px-8">
          <h3 className="text-lg font-bold tracking-tight text-[#0c1929]">{t('editor.noBannersYetTitle')}</h3>
          <p className="mx-auto mt-4 max-w-[320px] text-sm font-normal leading-relaxed text-neutral-800">
            {t('editor.noBannersYetBody')}
          </p>
          <button
            type="button"
            onClick={handleAddCtaBanner}
            className="mt-10 inline-flex items-center justify-center gap-3 rounded-xl bg-[#3b5bdb] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition hover:bg-[#324fcc]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15">
              <HiPlus className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden />
            </span>
            {t('editor.addBannerStylesCta')}
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
