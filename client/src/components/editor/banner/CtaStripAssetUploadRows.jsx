import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiArrowUpTray } from 'react-icons/hi2';
import { uploadAPI } from '../../../lib/api.js';
import { buildCtaBannerImageStyleObject } from '../../../lib/ctaBannerImageStyle.js';

const ACCEPT = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] };
const DEFAULT_MAX = 5 * 1024 * 1024;

function slotLabels(presetKind) {
  if (presetKind === 'boost') {
    return { logo: 'Logo (replaces default gold mark)' };
  }
  return {
    logo: 'Top brand graphic (left column)',
  };
}

function CtaStripSlot({ label, hint, url, uploading, disabled, dropzone, onClear, previewW, previewH, objectFit }) {
  const imgStyle = String(url || '').trim()
    ? buildCtaBannerImageStyleObject({
        widthPx: previewW,
        heightPx: previewH,
        ...(objectFit === 'cover' ? { objectFit: 'cover' } : {}),
      })
    : {};

  return (
    <div className="space-y-2">
      <span className="mb-1.5 block text-sm font-bold text-slate-800">{label}</span>
      {hint ? <p className="text-[11px] leading-relaxed text-slate-500">{hint}</p> : null}
      <div
        {...dropzone.getRootProps()}
        className={`flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-3 transition ${
          dropzone.isDragActive
            ? 'border-[#3b5bdb] bg-blue-50/80'
            : 'border-slate-300/80 bg-white hover:border-[#3b5bdb]/50'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...dropzone.getInputProps()} />
        {uploading ? (
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b5bdb] border-t-transparent" />
        ) : String(url || '').trim() ? (
          <img src={url} alt="" className="max-w-full rounded-lg" style={imgStyle} />
        ) : (
          <>
            <HiArrowUpTray className="h-5 w-5 text-slate-400" aria-hidden />
            <span className="mt-2 text-xs font-medium text-slate-600">Drop image or click</span>
            <span className="mt-1 text-[10px] text-slate-400">PNG, JPG, WebP · max 5MB</span>
          </>
        )}
      </div>
      {String(url || '').trim() ? (
        <button
          type="button"
          className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
          onClick={onClear}
        >
          Remove image
        </button>
      ) : null}
    </div>
  );
}

/**
 * Optional uploads: Boost (`banner_8`) — left mark only; other presets may include logo + hero slots.
 * Primary `cta_strip_*`; secondary `secondary_cta_strip_*`.
 */
export function CtaStripAssetUploadRows({
  presetKind,
  secondary = false,
  mergeBannerCfg,
  bc,
  disabled = false,
  maxSize = DEFAULT_MAX,
}) {
  const [busy, setBusy] = useState(null);
  const labels = slotLabels(presetKind);
  const showHeroSlot = presetKind !== 'boost';
  const keyLogo = secondary ? 'secondary_cta_strip_logo_url' : 'cta_strip_logo_url';
  const keyHero = secondary ? 'secondary_cta_strip_hero_url' : 'cta_strip_hero_url';

  const logoUrl = bc[keyLogo];
  const heroUrl = bc[keyHero];

  const runUpload = useCallback(
    async (accepted, key, uploadMode) => {
      const file = accepted[0];
      if (!file) return;
      setBusy(key);
      try {
        const { data } = await uploadAPI.uploadBannerImage(file, { mode: uploadMode });
        mergeBannerCfg({ [key]: data.url });
      } catch {
        /* toast optional — parent may not pass */
      } finally {
        setBusy(null);
      }
    },
    [mergeBannerCfg]
  );

  const logoDrop = useDropzone({
    onDrop: (a) => void runUpload(a, keyLogo, 'mark'),
    accept: ACCEPT,
    maxSize,
    multiple: false,
    disabled: disabled || busy !== null,
  });
  const heroDrop = useDropzone({
    onDrop: (a) => void runUpload(a, keyHero, 'scene'),
    accept: ACCEPT,
    maxSize,
    multiple: false,
    disabled: disabled || busy !== null,
  });

  return (
    <div className="space-y-5 border-b border-slate-200/80 pb-5">
      <p className="text-[11px] leading-relaxed text-slate-500">
        {presetKind === 'boost'
          ? 'Optional image replaces the default gold mark in the left column. Leave empty to keep the built-in icon.'
          : 'Optional images replace the built-in artwork. Leave empty to keep the default graphics for each area.'}
      </p>
      <CtaStripSlot
        label={labels.logo}
        hint=""
        url={logoUrl}
        uploading={busy === keyLogo}
        disabled={disabled}
        dropzone={logoDrop}
        onClear={() => mergeBannerCfg({ [keyLogo]: '' })}
        previewW={presetKind === 'boost' ? 56 : 110}
        previewH={presetKind === 'boost' ? 56 : 36}
      />
      {showHeroSlot ? (
        <CtaStripSlot
          label={labels.hero}
          hint=""
          url={heroUrl}
          uploading={busy === keyHero}
          disabled={disabled}
          dropzone={heroDrop}
          onClear={() => mergeBannerCfg({ [keyHero]: '' })}
          previewW={200}
          previewH={presetKind === 'boost' ? 120 : 100}
          objectFit={presetKind === 'boost' ? undefined : 'cover'}
        />
      ) : null}
    </div>
  );
}
