import { useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUserCircle,
  HiOutlineSwatch,
  HiOutlineSquares2X2,
} from 'react-icons/hi2';
import { FiFlag } from 'react-icons/fi';
import { Button } from '../ui/Button.jsx';
import { EditorPreview } from './EditorPreview.jsx';
import { useI18n } from '../../hooks/useI18n.js';

export function EditorLayout({
  editorBasePath,
  children,
  onDoneEditing,
  saving,
  saveStatus,
}) {
  const { t } = useI18n();
  const navItems = useMemo(
    () => [
      { id: 'info', suffix: '', labelKey: 'editor.myInformations', Icon: HiOutlineUserCircle },
      { id: 'palettes', suffix: '/palettes', labelKey: 'editor.palettes', Icon: HiOutlineSwatch },
      { id: 'layouts', suffix: '/layouts', labelKey: 'editor.layouts', Icon: HiOutlineSquares2X2 },
      { id: 'banners', suffix: '/banners', labelKey: 'editor.banners', Icon: FiFlag },
    ],
    []
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#f4f5f7]">
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4">
        <Link
          to="/dashboard"
          className="flex min-w-0 shrink-0 items-center gap-2 font-extrabold tracking-tight text-[#0c1929]"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-md shadow-blue-500/25"
            style={{ background: 'linear-gradient(135deg, #3b5fff, #2563eb)' }}
          >
            S
          </span>
          <span className="truncate">
            Signature<span className="text-[#2563eb]">Builder</span>
          </span>
        </Link>
        <Button
          type="button"
          className="!bg-[#3b5bdb] !px-3 !py-2 text-xs hover:!bg-[#324fcc] sm:!text-sm shrink-0 lg:hidden"
          disabled={saving}
          onClick={onDoneEditing}
        >
          {saving ? t('editor.saving') : t('editor.doneEditing')}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/*
          Collapsed (lg): fixed 56px rail, icons centered in 44×44 pills.
          Hover: expands to show labels; items stretch full width and align icon | text.
        */}
        <aside
          className="group/nav relative z-30 flex w-[228px] shrink-0 flex-col gap-2.5 border-r border-slate-200/80 bg-[#f4f5f7] py-4 pl-3 pr-3 transition-[width,padding,box-shadow] duration-300 ease-out lg:w-14 lg:items-center lg:overflow-x-hidden lg:px-0 lg:hover:w-[228px] lg:hover:items-stretch lg:hover:px-3 lg:hover:shadow-[6px_0_28px_-10px_rgba(15,23,42,0.1)]"
          aria-label="Editor sections"
        >
          <Link
            to="/dashboard"
            title={t('editor.home')}
            className="flex h-11 min-h-[44px] w-full shrink-0 items-center overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 ease-out hover:border-slate-300 hover:bg-white lg:w-11 lg:min-w-[44px] lg:max-w-[44px] lg:justify-center lg:px-0 lg:group-hover/nav:w-full lg:group-hover/nav:max-w-none lg:group-hover/nav:justify-start"
          >
            <span className="flex size-11 shrink-0 items-center justify-center text-slate-600">
              <HiOutlineHome className="h-5 w-5 shrink-0" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left text-[13px] font-semibold leading-none text-slate-800 opacity-100 transition-[max-width,opacity,margin] duration-300 ease-out lg:max-w-0 lg:flex-none lg:opacity-0 lg:group-hover/nav:max-w-[148px] lg:group-hover/nav:flex-1 lg:group-hover/nav:opacity-100">
              {t('editor.home')}
            </span>
          </Link>

          <nav className="flex w-full flex-col gap-2.5 lg:items-center lg:group-hover/nav:items-stretch" aria-label="Editor tools">
            {navItems.map(({ id, suffix, labelKey, Icon }) => {
              const label = t(labelKey);
              return (
              <NavLink
                key={id}
                to={`${editorBasePath}${suffix}`}
                end={suffix === ''}
                title={label}
                className={({ isActive }) =>
                  [
                    'flex h-11 min-h-[44px] w-full shrink-0 items-center overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-out',
                    'lg:w-11 lg:min-w-[44px] lg:max-w-[44px] lg:justify-center lg:px-0',
                    'lg:group-hover/nav:w-full lg:group-hover/nav:max-w-none lg:group-hover/nav:justify-start',
                    isActive
                      ? 'border-indigo-200/80 bg-[#eef2ff] text-[#2563eb] shadow-sm'
                      : 'border-slate-200/70 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-900',
                  ].join(' ')
                }
              >
                <span className="flex size-11 shrink-0 items-center justify-center [&>svg]:shrink-0">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[13px] font-semibold leading-none opacity-100 transition-[max-width,opacity] duration-300 ease-out lg:max-w-0 lg:flex-none lg:opacity-0 lg:group-hover/nav:max-w-[148px] lg:group-hover/nav:flex-1 lg:group-hover/nav:opacity-100">
                  {label}
                </span>
              </NavLink>
            );
            })}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
          <section
            className="w-full max-w-none shrink-0 overflow-y-auto border-b border-slate-200/90 bg-[var(--sb-color-bg,#f8fafc)] lg:w-[420px] lg:min-w-[420px] lg:max-w-[420px] lg:border-b-0 lg:border-r lg:border-slate-200/90"
            aria-label="Editor controls"
          >
            <div className="mx-auto w-full max-w-[420px] px-5 py-6 md:px-6 md:py-7">{children}</div>
          </section>

          <section
            className="min-h-[min(50vh,420px)] min-w-0 flex-1 overflow-hidden bg-transparent lg:min-h-0"
            aria-label="Preview"
          >
            <EditorPreview saveStatus={saveStatus} saving={saving} />
          </section>
        </div>
      </div>
    </div>
  );
}
