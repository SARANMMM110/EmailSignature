import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineBriefcase, HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhoto, HiOutlineSparkles } from 'react-icons/hi2';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useI18n } from '../hooks/useI18n.js';
import { uploadAPI } from '../lib/api.js';
import { normalizeLang } from '../i18n/appStrings.js';

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

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border bg-white shadow-[var(--sb-shadow-sm)]"
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
  const { user, profile, updateProfile, logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const serif = useMemo(() => ({ fontFamily: 'var(--sb-font-serif)' }), []);

  useEffect(() => {
    const fn = profile?.first_name || '';
    const ln = profile?.last_name || '';
    let f = fn;
    let l = ln;
    if (!f && !l && profile?.full_name) {
      const parts = String(profile.full_name).trim().split(/\s+/);
      f = parts[0] || '';
      l = parts.slice(1).join(' ') || '';
    }
    setFirstName(f);
    setLastName(l);
    setJobTitle(profile?.job_title || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setAvatarUrl(profile?.avatar_url || user?.user_metadata?.avatar_url || '');
    setLogoUrl(profile?.logo_url || '');
  }, [profile, user]);

  const onAvatarDrop = useCallback(async (accepted, fileRejections) => {
    const file = accepted[0];
    if (fileRejections?.length) {
      setToast({ message: t('settings.imageReject'), type: 'error' });
      return;
    }
    if (!file) return;
    try {
      const { data } = await uploadAPI.uploadPhoto(file);
      setAvatarUrl(data.url);
      setToast({ message: t('settings.photoUploaded'), type: 'success' });
    } catch {
      setToast({ message: t('settings.uploadFailed'), type: 'error' });
    }
  }, [t]);

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
  });

  const logoDrop = useDropzone({
    onDrop: (files, rej) => onLogoDrop(files, rej),
    accept: IMAGE_ACCEPT,
    maxSize: MAX_IMAGE_BYTES,
    multiple: false,
  });

  const plan = (profile?.plan || 'free').toLowerCase();
  const planLabel = plan === 'pro' ? t('settings.planPro') : plan === 'business' ? t('settings.planBusiness') : t('settings.planFree');
  const isPaidPlan = plan === 'pro' || plan === 'business';

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

    const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setSaving(true);
    const { error } = await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: combinedName,
      job_title: jobTitle.trim(),
      phone: phone.trim(),
      address: address.trim(),
      language: normalizeLang(profile?.language),
      avatar_url: avatarUrl.trim(),
      logo_url: logoUrl.trim(),
    });
    setSaving(false);
    if (error) {
      setToast({
        message:
          error.message?.includes('column') || error.code === '42703'
            ? t('settings.migrationHint')
            : error.message || t('settings.saveFailed'),
        type: 'error',
      });
      return;
    }
    setToast({ message: t('settings.saved'), type: 'success' });
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[var(--sb-color-bg)]">
      <Sidebar />

      <div className="app-canvas app-grid-noise flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
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
                disabled={saving}
                onClick={handleSaveAccount}
              >
                {saving ? t('settings.saving') : t('settings.save')}
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
              icon={HiOutlineSparkles}
              title={t('settings.planIdentityTitle')}
              description={t('settings.planIdentityDesc')}
            >
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} duration={4000} />
      )}
    </div>
  );
}
