import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilterSidebar,
  defaultTemplateFilters,
  filterTemplatesBySidebar,
} from '../components/templates/FilterSidebar.jsx';
import { GalleryHeader } from '../components/templates/GalleryHeader.jsx';
import { TemplateCard } from '../components/templates/TemplateCard.jsx';
import { SupportFab } from '../components/ui/SupportFab.jsx';
import { DEMO_SIGNATURE_DATA, demoHtmlGeneratePayload } from '../data/templatePreviews.js';
import { useAuth } from '../hooks/useAuth.js';
import { useI18n } from '../hooks/useI18n.js';
import { usePlanGate } from '../hooks/usePlanGate.js';
import { useUpgradeModalStore } from '../store/upgradeModalStore.js';
import api, { templatesAPI, signaturesAPI } from '../lib/api.js';
import { lockedTemplateIdsForPlan } from '../lib/templatePlanOrder.js';
import {
  displayNameForTemplateRow,
  TEMPLATE_10_CANONICAL_COLORS,
  TEMPLATE_11_CANONICAL_COLORS,
  TEMPLATE_12_CANONICAL_COLORS,
  TEMPLATE_13_CANONICAL_COLORS,
  TEMPLATE_14_CANONICAL_COLORS,
  TEMPLATE_15_CANONICAL_COLORS,
  TEMPLATE_16_CANONICAL_COLORS,
  TEMPLATE_17_CANONICAL_COLORS,
  TEMPLATE_18_CANONICAL_COLORS,
  TEMPLATE_19_CANONICAL_COLORS,
  TEMPLATE_20_CANONICAL_COLORS,
  uuidToTemplateSlug,
} from '../lib/templateIds.js';

export function TemplateGalleryPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const gate = usePlanGate();
  const showUpgradeModal = useUpgradeModalStore((s) => s.showUpgradeModal);

  const [templates, setTemplates] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [filters, setFilters] = useState(defaultTemplateFilters);
  const [selectingId, setSelectingId] = useState(null);
  const [liveHtmlById, setLiveHtmlById] = useState({});
  const [loadingLivePreviews, setLoadingLivePreviews] = useState(false);

  /** Fixed demo palette for gallery live previews + per-card swatches (matches editor starter). */
  const galleryPreviewColors = useMemo(
    () => [...DEMO_SIGNATURE_DATA.design.colors],
    []
  );

  /** Avoid full skeleton when Supabase refreshes session (new `user` object, same id). */
  const templatesLoadedForUserRef = useRef(null);
  const loadGenRef = useRef(0);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      templatesLoadedForUserRef.current = null;
      setTemplates([]);
      setLoadingList(false);
      return;
    }

    const previousLoadedUser = templatesLoadedForUserRef.current;
    if (previousLoadedUser != null && previousLoadedUser !== userId) {
      setTemplates([]);
      templatesLoadedForUserRef.current = null;
    }

    const gen = ++loadGenRef.current;
    const alreadyHaveLayoutsForUser = templatesLoadedForUserRef.current === userId;

    (async () => {
      if (!alreadyHaveLayoutsForUser) {
        setLoadingList(true);
      }
      setLoadError('');
      try {
        const tRes = await templatesAPI.getAll();
        if (gen !== loadGenRef.current) return;
        const raw = tRes.data?.templates || [];
        setTemplates(
          raw.map((t) => ({
            ...t,
            name: displayNameForTemplateRow(t),
            tier: t.tier || 'free',
            style: t.style || 'design',
            style_tags:
              Array.isArray(t.style_tags) && t.style_tags.length
                ? t.style_tags
                : [t.style || 'design'],
            has_logo: t.has_logo === false ? false : true,
            color_count: t.color_count ?? 6,
          }))
        );
        templatesLoadedForUserRef.current = userId;
      } catch (e) {
        if (gen !== loadGenRef.current) return;
        setLoadError(e.response?.data?.message || e.message || t('gallery.loadFailed'));
        if (!alreadyHaveLayoutsForUser) {
          setTemplates([]);
        }
      } finally {
        if (gen === loadGenRef.current) setLoadingList(false);
      }
    })();
  }, [userId, t]);

  const filtered = useMemo(
    () => filterTemplatesBySidebar(templates, filters),
    [templates, filters]
  );

  const lockedTemplateIds = useMemo(
    () => lockedTemplateIdsForPlan(templates, gate.limit('layout_templates')),
    [templates, gate]
  );

  const filteredSignatureKey = useMemo(
    () => filtered.map((t) => String(t.id)).sort().join('|'),
    [filtered]
  );

  useEffect(() => {
    if (!userId || filtered.length === 0) {
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
            /** Intro gallery: demo copy + placeholders only — account data appears after opening in the editor. */
            const { data } = await api.post(
              '/html/generate',
              demoHtmlGeneratePayload(slug, galleryPreviewColors)
            );
            const html = data?.html?.trim();
            if (html) next[t.id] = html;
          } catch {
            /* fall back to static thumbnail on card */
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
  }, [userId, filteredSignatureKey, galleryPreviewColors, filtered.length]);

  const handleTemplatePick = useCallback(
    async (template) => {
      if (!template?.id || selectingId) return;
      if (lockedTemplateIds.has(template.id)) {
        showUpgradeModal({
          feature: 'layout_templates',
          requiredPlan: gate.planId === 'personal' ? 'advanced' : 'ultimate',
          message:
            gate.planId === 'personal'
              ? `Your ${gate.plan.name} plan includes the first ${gate.limitText('layout_templates')} layouts in the catalog. Upgrade to Advanced for 10 templates, or Ultimate for unlimited.`
              : `Your ${gate.plan.name} plan includes ${gate.limitText('layout_templates')} layouts. Upgrade to Ultimate for unlimited templates.`,
        });
        return;
      }
      setSelectingId(template.id);
      setLoadError('');
      try {
        /** HTML layouts (editable fields + palette). Figma/PNG on the card is only the gallery thumbnail. */
        const { data } = await signaturesAPI.create({
          template_id: template.id,
          label: t('gallery.createLabel'),
        });
        const id = data?.signature?.id;
        if (id) {
          navigate(`/editor/${id}`);
          return;
        }
        setLoadError(t('gallery.createFailed'));
      } catch (e) {
        setLoadError(e.response?.data?.message || e.message || t('gallery.openEditorFailed'));
      } finally {
        setSelectingId(null);
      }
    },
    [gate.plan, gate.planId, gate.limitText, lockedTemplateIds, navigate, selectingId, showUpgradeModal, t]
  );

  const handleLockedTemplate = useCallback(() => {
    showUpgradeModal({
      feature: 'layout_templates',
      requiredPlan: gate.planId === 'personal' ? 'advanced' : 'ultimate',
      message: `This layout is not included in your ${gate.plan.name} plan.`,
    });
  }, [gate.plan.name, gate.planId, showUpgradeModal]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-[#f4f5f7] font-gallery text-[#111827]">
      <GalleryHeader />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="w-full min-w-0 max-w-full shrink-0 overflow-x-hidden border-[#e4e6ea] bg-white px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-[272px] lg:max-w-[272px] lg:shrink-0 lg:overflow-y-auto lg:overflow-x-hidden lg:border-r lg:py-8">
            <FilterSidebar variant="gallery" filters={filters} onFilterChange={setFilters} />
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto px-5 py-8 md:px-10 md:py-10">
            <header className="mb-8 text-center lg:text-left">
              <h1 className="text-[1.35rem] font-semibold tracking-tight text-[#111827] md:text-2xl">
                {t('gallery.chooseTitle')}
              </h1>
              <p className="mt-2 text-[13px] font-semibold text-[#374151]">
                {loadingList
                  ? '…'
                  : filtered.length === 1
                    ? t('gallery.layoutsFoundOne', { count: filtered.length })
                    : t('gallery.layoutsFoundOther', { count: filtered.length })}
              </p>
            </header>

            {loadError && (
              <p className="mb-8 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-800">
                {loadError}
              </p>
            )}

            {loadingList ? (
              <div className="flex min-h-[200px] items-center justify-center py-16">
                <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#2563eb] border-t-transparent" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    locked={lockedTemplateIds.has(t.id)}
                    requiredPlanLabel={gate.planId === 'personal' ? 'Advanced' : 'Ultimate'}
                    onLocked={handleLockedTemplate}
                    onSelect={handleTemplatePick}
                    busy={selectingId === t.id}
                    paletteColors={
                      uuidToTemplateSlug(t.id) === 'template_10'
                        ? [...TEMPLATE_10_CANONICAL_COLORS]
                        : uuidToTemplateSlug(t.id) === 'template_11'
                          ? [...TEMPLATE_11_CANONICAL_COLORS]
                          : uuidToTemplateSlug(t.id) === 'template_12'
                            ? [...TEMPLATE_12_CANONICAL_COLORS]
                            : uuidToTemplateSlug(t.id) === 'template_13'
                              ? [...TEMPLATE_13_CANONICAL_COLORS]
                              : uuidToTemplateSlug(t.id) === 'template_14'
                                ? [...TEMPLATE_14_CANONICAL_COLORS]
                                : uuidToTemplateSlug(t.id) === 'template_15'
                                  ? [...TEMPLATE_15_CANONICAL_COLORS]
                                  : uuidToTemplateSlug(t.id) === 'template_16'
                                    ? [...TEMPLATE_16_CANONICAL_COLORS]
                                    : uuidToTemplateSlug(t.id) === 'template_17'
                                      ? [...TEMPLATE_17_CANONICAL_COLORS]
                                      : uuidToTemplateSlug(t.id) === 'template_18'
                                        ? [...TEMPLATE_18_CANONICAL_COLORS]
                                        : uuidToTemplateSlug(t.id) === 'template_19'
                                          ? [...TEMPLATE_19_CANONICAL_COLORS]
                                          : uuidToTemplateSlug(t.id) === 'template_20'
                                            ? [...TEMPLATE_20_CANONICAL_COLORS]
                                            : galleryPreviewColors
                    }
                    liveHtml={liveHtmlById[t.id] || ''}
                    liveLoading={loadingLivePreviews && !liveHtmlById[t.id]}
                  />
                ))}
              </div>
            ) : null}

            {!loadingList && !loadError && templates.length === 0 && (
              <p className="mt-12 rounded-xl border border-[#e4e6ea] bg-white py-10 text-center text-sm font-medium text-[#6b7280]">
                No layout templates are configured. Open the editor to build a signature with the default HTML layout.
              </p>
            )}

            {!loadingList &&
              !loadError &&
              templates.length > 0 &&
              filtered.length === 0 && (
              <p className="mt-12 rounded-xl border border-[#e4e6ea] bg-white py-10 text-center text-sm font-medium text-[#6b7280]">
                No layouts match these filters. Try adjusting the sidebar.
              </p>
            )}

          </main>
        </div>
      </div>

      <SupportFab />

    </div>
  );
}
