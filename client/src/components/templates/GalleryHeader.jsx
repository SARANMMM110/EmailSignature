import { Link } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n.js';

/** Centered brand row (Emailee-style): circular mark + wordmark. */
export function GalleryHeader() {
  const { t } = useI18n();
  return (
    <header className="shrink-0 border-b border-[#e8eaed] bg-white">
      <div className="relative mx-auto flex h-14 max-w-[1600px] items-center justify-center px-4 md:h-[4.25rem] md:px-10">
        <Link
          to="/dashboard"
          className="absolute left-4 text-[13px] font-semibold text-[#2563eb] transition hover:text-[#1d4ed8] md:left-10"
        >
          {t('gallery.back')}
        </Link>

        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold leading-none text-white shadow-sm ring-2 ring-[#2563eb]/20"
            style={{
              background: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 45%, #1d4ed8 100%)',
            }}
            aria-hidden
          >
            SB
          </span>
          <span
            className="font-serif text-[1.35rem] italic leading-none tracking-tight text-[#1e293b] md:text-[1.5rem]"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Signature<span className="text-[#2563eb]">Builder</span>
          </span>
        </div>
      </div>
    </header>
  );
}
