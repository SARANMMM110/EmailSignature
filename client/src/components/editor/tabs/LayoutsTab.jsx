import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineSquares2X2 } from 'react-icons/hi2';
import api, { templatesAPI } from '../../../lib/api.js';
import { defaultPaletteColorsForLayoutSlug, demoHtmlGeneratePayload } from '../../../data/templatePreviews.js';
import {
  defaultTemplateFilters,
  filterTemplatesBySidebar,
  FilterSidebar,
} from '../../templates/FilterSidebar.jsx';
import { TemplateCard } from '../../templates/TemplateCard.jsx';
import { displayNameForTemplateRow, uuidToTemplateSlug } from '../../../lib/templateIds.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { usePlanGate } from '../../../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../../../store/upgradeModalStore.js';
import { lockedTemplateIdsForPlan } from '../../../lib/templatePlanOrder.js';
import { useEditorStore } from '../../../store/editorStore.js';
import { PLANS } from '../../../data/plans.js';

function IconSlidersGray() {
  return (
    <svg className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  );
}

export function LayoutsTab() {
  const { user, profile } = useAuth();
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultTemplateFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterPopoverRef = useRef(null);

  const signature = useEditorStore((s) => s.signature);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const editorSaving = useEditorStore((s) => s.isSaving);

  const current = signature?.design?.templateId || signature?.template_id;

  const [liveHtmlById, setLiveHtmlById] = useState({});
  const [loadingLivePreviews, setLoadingLivePreviews] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await templatesAPI.getAll();
        const raw = data?.templates || [];
        setTemplates(
          raw.map((t) => ({
            ...t,
            name: displayNameForTemplateRow(t),
          }))
        );
      } catch {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    const onDoc = (e) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [filtersOpen]);

  const enriched = useMemo(
    () =>
      templates.map((t) => ({
        ...t,
        tier: t.tier || 'free',
        style: t.style || 'design',
        style_tags: Array.isArray(t.style_tags) ? t.style_tags : [t.style || 'design'],
        persona_tags: Array.isArray(t.persona_tags) ? t.persona_tags : [],
        has_logo: t.has_logo === false ? false : true,
        color_count: t.color_count ?? 10,
      })),
    [templates]
  );

  const filtered = useMemo(() => filterTemplatesBySidebar(enriched, filters), [enriched, filters]);

  const lockedTemplateIds = useMemo(
    () => lockedTemplateIdsForPlan(enriched, gate.limit('layout_templates')),
    [enriched, gate]
  );

  const filteredSignatureKey = useMemo(
    () => filtered.map((t) => String(t.id)).sort().join('|'),
    [filtered]
  );

  useEffect(() => {
    if (filtered.length === 0) {
      setLiveHtmlById({});
      setLoadingLivePreviews(false);
      return;
    }
    let cancelled = false;
    setLoadingLivePreviews(true);
    (async () => {
      const next = {};
      await Promise.all(
        filtered.map(async (t) => {
          const slug = uuidToTemplateSlug(t.id);
          try {
            const { data } = await api.post(
              '/html/generate',
              demoHtmlGeneratePayload(slug, null, { profile, user })
            );
            const html = data?.html?.trim();
            if (html) next[t.id] = html;
          } catch {
            /* TemplateCard falls back to static thumbnail when set */
          }
        })
      );
      if (!cancelled) {
        setLiveHtmlById(next);
        setLoadingLivePreviews(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filteredSignatureKey, filtered.length, profile, user]);

  const filterButtonLabel =
    filters.style.design || filters.style.minimalist || filters.logo.with || filters.logo.without
      ? 'Filters · On'
      : 'Filters';

  return (
    <div className="relative -mx-5 -mt-6 min-h-full bg-white px-5 pb-10 pt-6 md:-mx-6 md:px-6 md:pt-7 md:pb-12">
      <header className="mb-5 flex items-start justify-between gap-3">
        <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-[#0a0a0a]">Layouts</h1>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-sm"
            title="Layout gallery"
            aria-hidden
          >
            <HiOutlineSquares2X2 className="h-5 w-5" />
          </span>
          <div className="relative" ref={filterPopoverRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-[13px] font-semibold text-[#374151] shadow-sm transition hover:border-slate-400 hover:bg-slate-50/80"
              aria-expanded={filtersOpen}
              aria-haspopup="dialog"
            >
              <IconSlidersGray />
              {filterButtonLabel}
            </button>
            {filtersOpen ? (
              <div
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(calc(100vw-2rem),280px)] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18)] ring-1 ring-slate-100"
                role="dialog"
                aria-label="Layout filters"
              >
                <FilterSidebar filters={filters} onFilterChange={setFilters} variant="gallery" />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <p className="mb-5 text-[11px] leading-relaxed text-slate-500">
        Previews use each layout’s reference colours (your profile details when available). Click a card to apply the layout — your palette is unchanged until you edit Palettes.
      </p>

      <ul className="flex flex-col gap-5">
        {loading && (
          <li className="flex justify-center py-16">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#3b5bdb] border-t-transparent" />
          </li>
        )}
        {!loading &&
          filtered.map((t) => {
            const active = uuidToTemplateSlug(current) === uuidToTemplateSlug(t.id);
            const locked = lockedTemplateIds.has(t.id);
            return (
              <li key={t.id}>
                <TemplateCard
                  template={t}
                  selected={active}
                  disabled={editorSaving}
                  locked={locked}
                  requiredPlanLabel={gate.planId === 'personal' ? PLANS.advanced.name : PLANS.ultimate.name}
                  onLocked={() =>
                    showUpgradeModal({
                      feature: 'layout_templates',
                      requiredPlan: gate.planId === 'personal' ? 'advanced' : 'ultimate',
                      message: `This layout is not included in your ${gate.plan.name} plan.`,
                    })
                  }
                  onSelect={() => {
                    if (locked) return;
                    setTemplate(t.id);
                  }}
                  paletteColors={defaultPaletteColorsForLayoutSlug(t.id)}
                  liveHtml={liveHtmlById[t.id] || ''}
                  liveLoading={loadingLivePreviews && !liveHtmlById[t.id]}
                />
              </li>
            );
          })}
        {!loading && templates.length === 0 && (
          <li className="rounded-2xl border border-amber-100 bg-amber-50/90 px-4 py-3.5 text-sm text-amber-950">
            Could not load templates. Check your connection and try refreshing the page.
          </li>
        )}
        {!loading && templates.length > 0 && filtered.length === 0 && (
          <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-600">
            No layouts match these filters. Try adjusting the filter options above.
          </li>
        )}
      </ul>
    </div>
  );
}
