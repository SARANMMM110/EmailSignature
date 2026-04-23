import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhoto,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PhotoCropModal } from '../components/ui/PhotoCropModal.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useI18n } from '../hooks/useI18n.js';
import { palettesAPI, signaturesAPI, uploadAPI } from '../lib/api.js';
import { getPlan } from '../data/plans.js';
import { effectiveTier1PlanId } from '../lib/effectiveTier1Plan.js';
import { usePlanGate } from '../hooks/usePlanGate.js';
import { useRegistrationRefPreviewStore } from '../store/registrationRefPreviewStore.js';
import { normalizeLang } from '../i18n/appStrings.js';
import { useAuthStore } from '../store/authStore.js';
import { useEditorStore } from '../store/editorStore.js';

const IMAGE_ACCEPT = { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] };
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const fieldClass =
  'w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-shadow focus:border-[var(--sb-color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--sb-color-accent)]/20';

function IconLogout({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

function SectionCard({ id, icon: Icon, title, description, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-6 overflow-hidden rounded-2xl border bg-white shadow-[var(--sb-shadow-sm)]"
      style={{ borderColor: 'var(--border-sm)' }}
    >
      <div
        className="flex items-start gap-3 border-b px-4 py-4 sm:px-6"
        style={{ borderColor: 'var(--border-sm)', background: 'linear-gradient(180deg, rgb(248 250 252) 0%, #fff 100%)' }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--sb-color-accent)]"
          style={{ background: 'rgb(239 246 255 / 0.9)' }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-base font-semibold tracking-tight text-[var(--sb-color-text)]">{title}</h2>
          {description ? <p className="mt-0.5 text-sm leading-snug text-[var(--sb-color-muted)]">{description}</p> : null}
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

function FieldLabel({ children, optional }) {
  const { t } = useI18n();
  return (
    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
      {children}
      {optional ? <span className="ml-1 font-medium normal-case tracking-normal text-slate-400">{t('settings.optional')}</span> : null}
    </label>
  );
}

function DropZoneArea({ getRootProps, getInputProps, isDragActive, previewUrl, emptyLabel, previewShape = 'circle' }) {
  const { t } = useI18n();
  const preview =
    previewUrl && previewShape === 'circle' ? (
      <div className="relative shrink-0">
        <img
          src={previewUrl}
          alt=""
          className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white shadow-md"
        />
      </div>
    ) : previewUrl ? (
      <div className="flex min-h-[100px] min-w-0 max-w-full shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-inner">
        <img src={previewUrl} alt="" className="max-h-24 max-w-full object-contain" />
      </div>
    ) : (
      <div
        className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-400 ${
          previewShape === 'circle' ? '' : 'h-24 w-full max-w-[200px] rounded-xl sm:w-44'
        }`}
      >
        {emptyLabel}
      </div>
    );

  return (
    <div
      {...getRootProps()}
      className={`group flex cursor-pointer flex-col items-stretch gap-4 rounded-2xl border-2 border-dashed p-4 transition-all duration-200 sm:flex-row sm:items-center sm:gap-6 ${
        isDragActive
          ? 'border-[var(--sb-color-accent)] bg-blue-50/70 shadow-[var(--sb-shadow-md)]'
          : 'border-slate-200/90 bg-gradient-to-br from-slate-50/80 to-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <input {...getInputProps()} />
      {preview}
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-sm font-semibold text-[var(--sb-color-text)]">{t('settings.dropHint')}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--sb-color-muted)]">{t('settings.dropFormats')}</p>
        <p className="mt-3 text-xs font-medium text-[var(--sb-color-accent)] opacity-0 transition-opacity group-hover:opacity-100">
          {t('settings.dropBrowse')}
        </p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useI18n();
  const gate = usePlanGate();
  const pendingRegPlanId = useRegistrationRefPreviewStore((s) => s.planId);
  const { user, profile, updateProfile, logout, isAgencyMember, agencyInfo } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  /** True while the profile write is in flight — button disabled, label stays "Save changes". */
  const [saveLocked, setSaveLocked] = useState(false);
  const saveInFlightRef = useRef(false);
  const [toast, setToast] = useState(null);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropObjectUrl, setAvatarCropObjectUrl] = useState(null);
  const [avatarUploadBusy, setAvatarUploadBusy] = useState(false);
  const [sigCount, setSigCount] = useState(null);
  const [paletteCount, setPaletteCount] = useState(null);

  const serif = useMemo(() => ({ fontFamily: 'var(--sb-font-serif)' }), []);

  const closeAvatarCropModal = useCallback(() => {
    setAvatarCropObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAvatarCropOpen(false);
  }, []);

  /** Refetch when opening Settings so the form matches DB (avoids empty UI after save or cold load). */
  useEffect(() => {
    void useAuthStore.getState().fetchProfile();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void (async () => {
      try {
        const [sRes, pRes] = await Promise.all([signaturesAPI.getAll(), palettesAPI.getUser()]);
        if (cancelled) return;
        setSigCount((sRes.data?.signatures || []).length);
        setPaletteCount((pRes.data?.palettes || []).length);
      } catch {
        if (!cancelled) {
          setSigCount(null);
          setPaletteCount(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /**
   * Hydrate the form from `profiles` only once the row is loaded for this user.
   * Previously, running while `profile` was still null cleared fields and removed the photo preview
   * when `fetchProfile` or navigation raced with local upload state.
   */
  useEffect(() => {
    if (!user?.id) return;
    if (!profile || profile.id !== user.id) return;

    const fn = profile.first_name || '';
    const ln = profile.last_name || '';
    let f = fn;
    let l = ln;
    if (!f && !l && profile.full_name) {
      const parts = String(profile.full_name).trim().split(/\s+/);
      f = parts[0] || '';
      l = parts.slice(1).join(' ') || '';
    }
    setFirstName(f);
    setLastName(l);
    setJobTitle(profile.job_title || '');
    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setAvatarUrl((prev) => {
      const fromDb = String(profile.avatar_url || '').trim();
      if (fromDb) return fromDb;
      const fromMeta = String(user.user_metadata?.avatar_url || '').trim();
      if (fromMeta) return fromMeta;
      return String(prev || '').trim();
    });
    setLogoUrl((prev) => {
      const fromDb = String(profile.logo_url || '').trim();
      if (fromDb) return fromDb;
      return String(prev || '').trim();
    });
  }, [profile, user]);

  const onAvatarDrop = useCallback(
    (accepted, fileRejections) => {
      const file = accepted[0];
      if (fileRejections?.length) {
        setToast({ message: t('settings.imageReject'), type: 'error' });
        return;
      }
      if (!file) return;
      setAvatarCropObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setAvatarCropOpen(true);
    },
    [t]
  );

  const onAvatarCropConfirm = useCallback(
    async (blob) => {
      const file = new File([blob], 'photo.png', { type: 'image/png' });
      setAvatarUploadBusy(true);
      try {
        const { data } = await uploadAPI.uploadPhoto(file);
        setAvatarUrl(data.url);
        setToast({ message: t('settings.photoUploaded'), type: 'success' });
        closeAvatarCropModal();
      } catch {
        setToast({ message: t('settings.uploadFailed'), type: 'error' });
      } finally {
        setAvatarUploadBusy(false);
      }
    },
    [t, closeAvatarCropModal]
  );

  const onLogoDrop = useCallback(async (accepted, fileRejections) => {
    const file = accepted[0];
    if (fileRejections?.length) {
      setToast({ message: t('settings.imageReject'), type: 'error' });
      return;
    }
    if (!file) return;
    try {
      const { data } = await uploadAPI.uploadLogo(file);
      setLogoUrl(data.url);
      setToast({ message: t('settings.logoUploaded'), type: 'success' });
    } catch {
      setToast({ message: t('settings.logoUploadFailed'), type: 'error' });
    }
  }, [t]);

  const avatarDrop = useDropzone({
    onDrop: (files, rej) => onAvatarDrop(files, rej),
    accept: IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_BYTES,
    multiple: false,
    disabled: avatarCropOpen || avatarUploadBusy,
  });

  const logoDrop = useDropzone({
    onDrop: (files, rej) => onLogoDrop(files, rej),
    accept: IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_BYTES,
    multiple: false,
  });

  const planMeta = getPlan(
    effectiveTier1PlanId(profile, { pendingRegistrationPlanId: pendingRegPlanId || undefined })
  );
  const planLabel = planMeta.name;
  const isPaidPlan = planMeta.id === 'advanced' || planMeta.id === 'ultimate';

  const handleSaveAccount = async () => {
    const missing = [];
    if (!firstName.trim()) missing.push(t('settings.fieldFirstName'));
    if (!lastName.trim()) missing.push(t('settings.fieldLastName'));
    if (!jobTitle.trim()) missing.push(t('settings.fieldJobTitle'));
    if (!phone.trim()) missing.push(t('settings.fieldPhone'));
    if (!address.trim()) missing.push(t('settings.fieldAddress'));
    if (!avatarUrl.trim()) missing.push(t('settings.fieldPhoto'));
    if (!logoUrl.trim()) missing.push(t('settings.fieldLogo'));
    if (missing.length) {
      setToast({ message: `${t('settings.requiredPrefix')} ${missing.join(', ')}`, type: 'error' });
      return;
    }

    if (saveInFlightRef.current) return;

    const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: combinedName,
      job_title: jobTitle.trim(),
      phone: phone.trim(),
      address: address.trim(),
      language: normalizeLang(profile?.language),
      avatar_url: avatarUrl.trim(),
      logo_url: logoUrl.trim(),
    };

    saveInFlightRef.current = true;
    setSaveLocked(true);
    try {
      const { error } = await updateProfile(payload);
      if (error) {
        const msg = String(error.message || '');
        const code = String(error.code || '');
        const looksLikeMissingOrStaleColumn =
          code === 'PGRST204' ||
          code === '42703' ||
          /column/i.test(msg) ||
          /schema cache/i.test(msg);
        setToast({
          message: looksLikeMissingOrStaleColumn ? t('settings.migrationHint') : msg || t('settings.saveFailed'),
          type: 'error',
        });
      } else {
        setToast({ message: t('settings.saved'), type: 'success' });
        useEditorStore.getState().syncAccountProfileIntoSignature();
      }
    } catch (e) {
      setToast({
        message: e?.message || t('settings.saveFailed'),
        type: 'error',
      });
    } finally {
      saveInFlightRef.current = false;
      setSaveLocked(false);
    }
  };

  return (
    <div className="flex w-full items-start overflow-x-hidden bg-[var(--sb-color-bg)]">
      <Sidebar />

      <div className="app-canvas app-grid-noise min-w-0 flex-1 pb-10">
        <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--sb-color-accent)]">{t('settings.accountEyebrow')}</p>
              <h1
                className="mt-1.5 text-2xl font-normal tracking-tight text-[var(--sb-color-text)] sm:text-[1.75rem] sm:leading-tight"
                style={serif}
              >
                {t('settings.title')}
              </h1>
              <p className="mt-1.5 max-w-lg text-sm leading-snug text-[var(--sb-color-muted)]">
                {t('settings.subtitle')}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 self-stretch sm:self-start sm:items-end">
              <Button
                type="button"
                className="!min-h-[42px] w-full !rounded-xl !bg-[var(--sb-color-accent)] !px-5 !text-sm !font-semibold hover:!bg-[var(--sb-color-accent-hover)] sm:w-auto"
                disabled={saveLocked}
                onClick={handleSaveAccount}
              >
                {t('settings.save')}
              </Button>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                <IconLogout />
                {t('settings.logOut')}
              </button>
            </div>
          </header>

          <div className="mt-5 flex flex-col gap-5 pb-6 sm:mt-6 sm:gap-6 sm:pb-8">
            {/* Plan + identity */}
            <SectionCard
              id="plan"
              icon={HiOutlineSparkles}
              title={t('settings.planIdentityTitle')}
              description={t('settings.planIdentityDesc')}
            >
              {import.meta.env.DEV && profile?._devPlanUiOverride?.databasePlan ? (
                <div
                  className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
                  role="status"
                >
                  <strong className="font-semibold">Dev mode:</strong>{' '}
                  <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">VITE_DEV_USER_PLAN_OVERRIDE</code> is
                  forcing this app to use the <strong>{planLabel}</strong> tier, but your database plan is{' '}
                  <strong>{getPlan(profile._devPlanUiOverride.databasePlan).name}</strong> (for example from a registration
                  invite). Remove that variable from <code className="text-xs">client/.env</code> and restart Vite so the
                  UI matches Supabase.
                </div>
              ) : null}
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{t('settings.plan')}</span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    isPaidPlan ? 'bg-[var(--sb-color-accent)] text-white shadow-md shadow-blue-500/25' : 'border border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {isPaidPlan ? <span aria-hidden>👑</span> : null}
                  {planLabel}
                </span>
              </div>

              {sigCount != null ? (
                <div className="mb-6 space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                      <span>Active signatures</span>
                      <span>
                        {sigCount} / {gate.limitText('max_active_signatures')}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[var(--sb-color-accent)] transition-all"
                        style={{
                          width:
                            gate.limit('max_active_signatures') === Infinity
                              ? '100%'
                              : `${Math.min(100, (sigCount / Math.max(1, Number(gate.limit('max_active_signatures')) || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  {gate.can('custom_palette_creation') &&
                  paletteCount != null &&
                  gate.planId !== 'ultimate' &&
                  gate.limit('max_saved_custom_palettes') > 0 ? (
                    <div>
                      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                        <span>Custom palettes</span>
                        <span>
                          {paletteCount} / {gate.limitText('max_saved_custom_palettes')}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (paletteCount / Math.max(1, Number(gate.limit('max_saved_custom_palettes')) || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                  <Link
                    to="/pricing"
                    className="inline-flex text-sm font-semibold text-[var(--sb-color-accent)] hover:underline"
                  >
                    See full comparison →
                  </Link>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>{t('settings.firstName')}</FieldLabel>
                  <input
                    name="firstName"
                    required
                    placeholder="Frank"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <FieldLabel>{t('settings.lastName')}</FieldLabel>
                  <input
                    name="lastName"
                    required
                    placeholder="Andres"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="mt-5">
                <FieldLabel>{t('settings.jobTitle')}</FieldLabel>
                <div className="relative">
                  <HiOutlineBriefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="jobTitle"
                    required
                    placeholder="Digital Marketer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className={`${fieldClass} pl-10`}
                  />
                </div>
              </div>
            </SectionCard>

            {isAgencyMember ? (
              <SectionCard
                id="agency"
                icon={HiOutlineBuildingOffice2}
                title="Agency"
                description="Your workspace is linked to an organization through a team registration link."
              >
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Organization</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {agencyInfo?.agency_name?.trim() || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Agency tier</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {agencyInfo?.agency_type ? `${agencyInfo.max_seats} seats (type ${agencyInfo.agency_type})` : '—'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Your plan from the agency</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          isPaidPlan
                            ? 'bg-[var(--sb-color-accent)] text-white shadow-md shadow-blue-500/25'
                            : 'border border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {planLabel}
                      </span>
                    </dd>
                  </div>
                </dl>
                <p className="mt-5 text-sm leading-relaxed text-slate-600">
                  Feature limits follow the Tier 1 plan your agency owner assigned. To change or leave the organization,
                  contact your agency administrator.
                </p>
              </SectionCard>
            ) : null}

            {/* Contact */}
            <SectionCard
              icon={HiOutlineEnvelope}
              title={t('settings.contactTitle')}
              description={t('settings.contactDesc')}
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>{t('settings.email')}</FieldLabel>
                  <div className="relative">
                    <HiOutlineEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      readOnly
                      className={`${fieldClass} cursor-not-allowed bg-slate-50 pl-10 text-slate-600`}
                      value={user?.email || ''}
                      placeholder="frankandres@gmail.com"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{t('settings.emailHint')}</p>
                </div>
                <div>
                  <FieldLabel>{t('settings.phone')}</FieldLabel>
                  <input
                    name="phone"
                    required
                    placeholder="(412) 2431-9832"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <FieldLabel>{t('settings.address')}</FieldLabel>
                  <div className="relative">
                    <HiOutlineMapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      placeholder="1 Yonge St, Toronto, ON M5E 1E5"
                      className={`${fieldClass} resize-y pl-10 pt-2.5`}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Media */}
            <SectionCard
              icon={HiOutlinePhoto}
              title={t('settings.photosTitle')}
              description={t('settings.photosDesc')}
            >
              <div className="space-y-5">
                <div>
                  <FieldLabel>{t('settings.personalPicture')}</FieldLabel>
                  <DropZoneArea
                    getRootProps={avatarDrop.getRootProps}
                    getInputProps={avatarDrop.getInputProps}
                    isDragActive={avatarDrop.isDragActive}
                    previewUrl={avatarUrl}
                    emptyLabel={t('settings.addPhoto')}
                  />
                </div>
                <div>
                  <FieldLabel>{t('settings.logo')}</FieldLabel>
                  <DropZoneArea
                    getRootProps={logoDrop.getRootProps}
                    getInputProps={logoDrop.getInputProps}
                    isDragActive={logoDrop.isDragActive}
                    previewUrl={logoUrl}
                    emptyLabel={t('settings.addLogo')}
                    previewShape="rect"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </main>
      </div>

      <PhotoCropModal
        open={avatarCropOpen}
        imageSrc={avatarCropObjectUrl}
        onClose={closeAvatarCropModal}
        onConfirm={onAvatarCropConfirm}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} duration={4000} />
      )}
    </div>
  );
}
