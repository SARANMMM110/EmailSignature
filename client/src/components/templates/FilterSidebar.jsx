import { useState } from 'react';

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconSlidersMuted() {
  return (
    <svg className="h-[18px] w-[18px] text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M9 18h6" />
    </svg>
  );
}

function IconSliders() {
  return (
    <svg className="h-5 w-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  );
}

function FilterSection({ title, open, onToggle, children, borderNeutral }) {
  return (
    <div
      className={`border-b pb-4 last:border-0 last:pb-0 ${borderNeutral ? 'border-[#e4e6ea]' : 'border-slate-100'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-lg py-2 text-left transition hover:bg-slate-50/80"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate text-sm font-bold text-[#0c1929]">{title}</span>
        <Chevron open={open} />
      </button>
      {open && <div className="mt-3 space-y-1 pl-0.5">{children}</div>}
    </div>
  );
}

function FilterCheckbox({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl py-2 pl-1 pr-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50/60 hover:text-slate-900"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] focus:ring-offset-0"
      />
      <span className="min-w-0 break-words">{label}</span>
    </label>
  );
}

export function FilterSidebar({ filters, onFilterChange, variant = 'default' }) {
  const [openStyle, setOpenStyle] = useState(true);
  const [openLogo, setOpenLogo] = useState(true);
  const galleryMode = variant === 'gallery';

  const setStyle = (key, value) =>
    onFilterChange({ ...filters, style: { ...filters.style, [key]: value } });
  const setLogo = (key, value) =>
    onFilterChange({ ...filters, logo: { ...filters.logo, [key]: value } });

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <div
        className={`${
          galleryMode
            ? 'min-w-0 rounded-none border-0 bg-transparent p-0 shadow-none ring-0'
            : 'rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-card ring-1 ring-slate-100/80 backdrop-blur-sm lg:w-64'
        }`}
      >
        <div
          className={`mb-5 flex items-center justify-between border-b pb-4 ${
            galleryMode ? 'border-[#e4e6ea]' : 'border-slate-100'
          }`}
        >
          <h2
            className={`tracking-tight ${galleryMode ? 'text-[15px] font-semibold text-[#111827]' : 'text-base font-extrabold text-[#0c1929]'}`}
          >
            Filters
          </h2>
          {galleryMode ? <IconSlidersMuted /> : <IconSliders />}
        </div>

        <FilterSection
          title="Style"
          open={openStyle}
          onToggle={() => setOpenStyle((o) => !o)}
          borderNeutral={galleryMode}
        >
          <FilterCheckbox
            id="filter-style-design"
            label="Design"
            checked={filters.style.design}
            onChange={(v) => setStyle('design', v)}
          />
          <FilterCheckbox
            id="filter-style-minimalist"
            label="Minimalist"
            checked={filters.style.minimalist}
            onChange={(v) => setStyle('minimalist', v)}
          />
        </FilterSection>

        <div className="my-4" />

        <FilterSection
          title="Logo"
          open={openLogo}
          onToggle={() => setOpenLogo((o) => !o)}
          borderNeutral={galleryMode}
        >
          <FilterCheckbox
            id="filter-logo-with"
            label="With logo"
            checked={filters.logo.with}
            onChange={(v) => setLogo('with', v)}
          />
          <FilterCheckbox
            id="filter-logo-without"
            label="Without logo"
            checked={filters.logo.without}
            onChange={(v) => setLogo('without', v)}
          />
        </FilterSection>
      </div>
    </div>
  );
}

export const defaultTemplateFilters = {
  style: { design: false, minimalist: false },
  logo: { with: false, without: false },
};

function templateStyleTags(t) {
  if (Array.isArray(t.style_tags)) return t.style_tags;
  const s = t.style || 'design';
  return [s];
}

export function filterTemplatesBySidebar(templates, filters) {
  return templates.filter((t) => {
    const tags = templateStyleTags(t);
    const hasLogo = t.has_logo === false ? false : true;

    const styleActive = filters.style.design || filters.style.minimalist;
    if (styleActive) {
      const match =
        (filters.style.design && tags.includes('design')) ||
        (filters.style.minimalist && tags.includes('minimalist'));
      if (!match) return false;
    }

    const logoActive = filters.logo.with || filters.logo.without;
    if (logoActive) {
      const match =
        (filters.logo.with && hasLogo) || (filters.logo.without && !hasLogo);
      if (!match) return false;
    }

    return true;
  });
}
