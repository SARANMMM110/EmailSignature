import { create } from 'zustand';
import { debounce } from '../lib/debounce.js';
import api, { signaturesAPI, bannersAPI, signatureExportAPI } from '../lib/api.js';
import { splitSignatureAndBannerHtml } from '../lib/splitSignatureBannerHtml.js';
import { wrapHtmlFragmentForPuppeteerExport } from '../lib/wrapSignatureExportFragment.js';
import {
  bundleRailPxForSignature,
  uuidToTemplateSlug,
  normalizeSignatureTemplateSlug,
  signatureLayoutSupportsLogo,
  engineSlugForGalleryPreview,
  TEMPLATE_SLUG_TO_UUID,
  isWebinarBannerPreset,
  WEBINAR_BANNER_UUID,
} from '../lib/templateIds.js';
import { filterAndSortEditorBanners } from '../lib/editorBanners.js';
import { DEMO_SIGNATURE_DATA } from '../data/templatePreviews.js';
import {
  hasPersistedMyInfoDraft,
  mergeDraftIntoSignature,
  pickDraftPayload,
  starterFieldsWithSavedMyInfo,
  writeMyInfoDraft,
} from '../lib/myInfoDraft.js';

/** UUID → Handlebars template key (must match server seed + templateIds) */
const BANNER_UUID_TO_PRESET = {
  'b0000001-0000-4000-8000-000000000001': 'book-call',
  'b0000002-0000-4000-8000-000000000002': 'download',
  'b0000003-0000-4000-8000-000000000003': 'webinar',
  'b0000004-0000-4000-8000-000000000004': 'need-call',
};

function bannerPresetFromRow(b) {
  if (!b) return 'book-call';
  const id = String(b.id).toLowerCase();
  if (BANNER_UUID_TO_PRESET[id]) return BANNER_UUID_TO_PRESET[id];
  if (id.includes('download')) return 'download';
  if (id.includes('webinar')) return 'webinar';
  if (id.includes('need')) return 'need-call';
  if (id.includes('book') || id.includes('call')) return 'book-call';
  return String(b.id);
}

/** Keys for a stacked second CTA — preserved when changing the primary banner. */
function pickSecondaryBannerConfig(bc) {
  if (!bc || typeof bc !== 'object') return {};
  const out = {};
  for (const k of Object.keys(bc)) {
    if (k.startsWith('secondary_')) out[k] = bc[k];
  }
  return out;
}

/** Stale `fields._bundle.banner` otherwise wins in server `rowToGeneratePayload` / regenerate. */
function fieldsWithoutBundleBanner(fields) {
  if (!fields || typeof fields !== 'object') return fields;
  const bundle = fields._bundle;
  if (!bundle || typeof bundle !== 'object' || bundle.banner == null) return fields;
  const nextBundle = { ...bundle };
  delete nextBundle.banner;
  return { ...fields, _bundle: nextBundle };
}

function setByPath(obj, path, value) {
  if (!path) return obj;
  const parts = path.split('.');
  const root = structuredClone(obj);
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    cur[p] = next && typeof next === 'object' && !Array.isArray(next) ? { ...next } : {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return root;
}

function hasAnyPersonalFieldContent(fields) {
  if (!fields || typeof fields !== 'object') return false;
  const keys = [
    'full_name',
    'fullName',
    'job_title',
    'jobTitle',
    'company',
    'companyName',
    'phone',
    'email',
    'website',
    'address',
    'photo_url',
    'photoUrl',
    'logo_url',
    'logoUrl',
  ];
  return keys.some((k) => String(fields[k] ?? '').trim());
}

function hasAnySocialContent(social) {
  if (!social || typeof social !== 'object') return false;
  return Object.values(social).some((v) => String(v || '').trim());
}

/** Starter copy + images when the API row is still pristine (new signature from template). */
function withStarterContentIfEmpty(sig) {
  if (!sig) return null;
  const apiFields = sig.fields || {};
  const apiSocial = sig.social_links || {};
  /** Empty row from POST /signatures — demo + palette defaults; My info from local draft if any. */
  const pristineFromApi =
    !hasAnyPersonalFieldContent(apiFields) && !hasAnySocialContent(apiSocial);

  if (pristineFromApi) {
    const demo = DEMO_SIGNATURE_DATA;
    const { fields: mergedFields, social_links: mergedSocial } = starterFieldsWithSavedMyInfo(
      demo.fields,
      demo.social_links
    );
    const fields = { ...mergedFields };
    if (!signatureLayoutSupportsLogo(sig)) {
      fields.logo_url = '';
    }
    return {
      ...sig,
      fields,
      social_links: { ...mergedSocial },
      design: {
        ...sig.design,
        templateId: sig.design?.templateId || uuidToTemplateSlug(sig.template_id) || 'template_1',
        colors:
          Array.isArray(sig.design?.colors) && sig.design.colors.length >= 4
            ? [...sig.design.colors]
            : [...demo.design.colors],
        font: sig.design?.font || demo.design.font,
        palette: {
          ...(demo.design.palette || {}),
          ...(sig.design?.palette || {}),
        },
      },
    };
  }

  return mergeDraftIntoSignature(sig);
}

export function clientSignatureFromApi(sig) {
  if (!sig) return null;
  const design = sig.design || {};
  const slug = normalizeSignatureTemplateSlug(design, sig.template_id);
  return {
    id: sig.id,
    label: sig.label || sig.name || 'My signature',
    template_id: sig.template_id,
    banner_id: sig.banner_id ?? null,
    fields: { ...(sig.fields || {}) },
    design: {
      ...design,
      templateId: slug,
      palette: { ...(design.palette || {}) },
      colors: Array.isArray(design.colors) ? [...design.colors] : undefined,
    },
    social_links: { ...(sig.social_links || {}) },
    banner_config: { ...(sig.banner_config || {}) },
    show_badge: sig.show_badge !== false,
    signature_link: sig.signature_link || '',
    generated_html: sig.generated_html || sig.html || '',
  };
}

function buildPutBody(signature) {
  return {
    label: signature.label,
    fields: signature.fields,
    design: signature.design,
    social_links: signature.social_links,
    banner_config: signature.banner_config,
    banner_id: signature.banner_id,
    show_badge: signature.show_badge,
    signature_link: signature.signature_link || null,
  };
}

/** Payload for POST /api/html/generate (matches server handlebars engine). */
export function signatureToEditorPayload(sig) {
  if (!sig) return {};
  const f = sig.fields || {};
  const social = sig.social_links || {};
  const d = sig.design || {};
  const colors = d.colors || [];
  const pal = d.palette || {};
  const palette = {
    primary: colors[0] || pal.primary || '#2563eb',
    secondary: colors[1] || pal.secondary || '#1e40af',
    accent: colors[2] || pal.accent || '#64748b',
    text: colors[3] || pal.text || '#0f172a',
  };
  const bannerCfg = sig.banner_config || {};
  const banner =
    bannerCfg.link_url || bannerCfg.href
      ? {
          id: bannerCfg.preset_id || 'book-call',
          href: bannerCfg.link_url || bannerCfg.href || 'https://',
          link_url: bannerCfg.link_url || bannerCfg.href || '',
          text: bannerCfg.text || '',
          field_1: bannerCfg.field_1,
          field_2: bannerCfg.field_2,
          field_3: bannerCfg.field_3,
          field_4: bannerCfg.field_4,
          secondary_link_url: bannerCfg.secondary_link_url,
          secondary_href: bannerCfg.secondary_href,
          secondary_text: bannerCfg.secondary_text,
          secondary_field_1: bannerCfg.secondary_field_1,
          secondary_field_2: bannerCfg.secondary_field_2,
          secondary_field_3: bannerCfg.secondary_field_3,
          secondary_field_4: bannerCfg.secondary_field_4,
          secondary_preset_id: bannerCfg.secondary_preset_id,
          secondary_banner_id: bannerCfg.secondary_banner_id,
        }
      : null;

  return {
    templateId: d.templateId || uuidToTemplateSlug(sig.template_id),
    design: {
      font: d.font || 'Arial, Helvetica, sans-serif',
    },
    form: {
      signatureName: sig.label,
      fullName: f.full_name || f.fullName || '',
      jobTitle: f.job_title || f.jobTitle || '',
      companyName: f.company || f.companyName || '',
      phone: f.phone || '',
      email: f.email || '',
      website: f.website || '',
      address: f.address || '',
      photoUrl: f.photo_url || f.photoUrl || '',
      logoUrl: f.logo_url || f.logoUrl || '',
      linkedin: social.linkedin || '',
      twitter: social.twitter || '',
      instagram: social.instagram || '',
      github: social.github || '',
      facebook: social.facebook || '',
      medium: social.medium || '',
      showBadge: sig.show_badge !== false,
      signatureLinkUrl: sig.signature_link || '',
      entireSignatureClickable: Boolean(String(sig.signature_link || '').trim()),
      customFields: [],
      signatureImageUrl:
        d.signatureImageUrl || f.signature_image_url || f.signatureImageUrl || '',
    },
    palette,
    banner,
  };
}

/**
 * Serialized PUT body sent with the in-flight save. When the response returns, if the
 * editor state has changed since that request, we must not replace `signature` with the
 * server row or the user sees characters revert while typing.
 */
let putBodySnapshotAtRequest = null;

/** Monotonic id so slower `/html/generate` responses cannot overwrite a newer preview. */
let htmlPreviewSeq = 0;

async function runPuppeteerExport(html) {
  if (!html?.trim()) {
    useEditorStore.setState({
      exportImageUrl: '',
      exportBannerImageUrl: '',
      exportImageError: null,
      exportImageWarning: null,
      exportGenerating: false,
    });
    return;
  }
  const snapshot = html;
  useEditorStore.setState({ exportGenerating: true, exportImageError: null, exportImageWarning: null });
  try {
    const railPx = bundleRailPxForSignature(useEditorStore.getState().signature);
    const { signatureHtml, bannerHtml } = splitSignatureAndBannerHtml(snapshot);
    const hasSplit = Boolean(bannerHtml?.trim() && signatureHtml?.trim());

    if (hasSplit) {
      const sigDoc = wrapHtmlFragmentForPuppeteerExport(signatureHtml, railPx);
      const banDoc = wrapHtmlFragmentForPuppeteerExport(bannerHtml, railPx);
      const [sigRes, banRes] = await Promise.all([
        signatureExportAPI.generateImage(sigDoc),
        signatureExportAPI.generateImage(banDoc),
      ]);
      if (useEditorStore.getState().generatedHTML !== snapshot) return;
      const sigUrl = String(sigRes.data?.url || '').trim();
      const banUrl = String(banRes.data?.url || '').trim();
      const w1 = sigRes.data?.recipientImageWarning ? String(sigRes.data.recipientImageWarning) : '';
      const w2 = banRes.data?.recipientImageWarning ? String(banRes.data.recipientImageWarning) : '';
      const exportImageWarning = [w1, w2].filter(Boolean).join(' ').trim() || null;
      if (sigUrl && banUrl) {
        useEditorStore.setState({
          exportImageUrl: sigUrl,
          exportBannerImageUrl: banUrl,
          exportImageError: null,
          exportGenerating: false,
          exportImageWarning,
        });
      } else {
        useEditorStore.setState({
          exportImageUrl: '',
          exportBannerImageUrl: '',
          exportImageError: 'Server did not return both signature and banner image URLs.',
          exportGenerating: false,
          exportImageWarning,
        });
      }
    } else {
      const { data } = await signatureExportAPI.generateImage(snapshot);
      if (useEditorStore.getState().generatedHTML !== snapshot) return;
      const url = String(data?.url || '').trim();
      const exportImageWarning = data?.recipientImageWarning ? String(data.recipientImageWarning) : null;
      if (url) {
        useEditorStore.setState({
          exportImageUrl: url,
          exportBannerImageUrl: '',
          exportImageError: null,
          exportGenerating: false,
          exportImageWarning,
        });
      } else {
        useEditorStore.setState({
          exportImageUrl: '',
          exportBannerImageUrl: '',
          exportImageError: 'Server did not return an image URL.',
          exportGenerating: false,
          exportImageWarning: null,
        });
      }
    }
  } catch (e) {
    if (useEditorStore.getState().generatedHTML !== snapshot) return;
    const msg =
      e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Image export failed';
    useEditorStore.setState({
      exportImageUrl: '',
      exportBannerImageUrl: '',
      exportImageError: String(msg),
      exportGenerating: false,
      exportImageWarning: null,
    });
  }
}

const persistMyInfoDraft = debounce(() => {
  const sig = useEditorStore.getState().signature;
  if (!sig) return;
  const { fields, social_links } = pickDraftPayload(sig.fields || {}, sig.social_links || {});
  writeMyInfoDraft(fields, social_links);
}, 400);

/** Live preview: refresh shortly after typing stops (300ms — balances API load vs responsiveness). */
const runDebouncedPreview = debounce(async () => {
  const seq = ++htmlPreviewSeq;
  const sig = useEditorStore.getState().signature;
  if (!sig) return;
  try {
    const { data } = await api.post('/html/generate', signatureToEditorPayload(sig));
    if (seq !== htmlPreviewSeq) return;
    const html = data?.html || '';
    if (html) {
      useEditorStore.setState({ generatedHTML: html });
      runPuppeteerExport(html);
    } else if (import.meta.env.DEV) {
      console.warn('[editor] /html/generate returned empty html');
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      const msg = e?.response?.data?.message || e?.message || String(e);
      console.warn('[editor] Live preview failed (POST /api/html/generate):', msg);
    }
  }
}, 300);

/** Auto-save to API ~2s after the last change. */
const runDebouncedRegenerate = debounce(async () => {
  const { signature, signatureId, _applyPutResult } = useEditorStore.getState();
  if (!signatureId || !signature) return;
  const body = buildPutBody(signature);
  putBodySnapshotAtRequest = JSON.stringify(body);
  useEditorStore.setState({ isSaving: true, saveStatus: 'saving' });
  try {
    const { data } = await signaturesAPI.update(signatureId, body);
    const row = data?.signature;
    if (row) _applyPutResult(row);
    else {
      putBodySnapshotAtRequest = null;
      useEditorStore.setState({ isSaving: false, saveStatus: 'idle' });
    }
  } catch (e) {
    console.error(e);
    putBodySnapshotAtRequest = null;
    useEditorStore.setState({ isSaving: false, saveStatus: 'error' });
  }
}, 2000);

export const useEditorStore = create((set, get) => ({
  signatureId: null,
  signature: null,
  isLoading: false,
  isDirty: false,
  isSaving: false,
  generatedHTML: '',
  /** Set when POST /api/html/generate fails or returns empty — drives preview panel message + retry */
  previewError: null,
  /** Signature-only PNG (or composite when no CTA) from POST /api/generate-signature */
  exportImageUrl: '',
  /** CTA/banner PNG when signature + banner are exported separately for Gmail */
  exportBannerImageUrl: '',
  exportImageError: null,
  /** From API when PNG URL is localhost — linked HTML mail shows broken images for recipients */
  exportImageWarning: null,
  exportGenerating: false,
  showInstallModal: false,
  saveStatus: 'idle',
  bannersCache: null,

  _applyPutResult: (row) => {
    const sig = clientSignatureFromApi(row);
    const snap = putBodySnapshotAtRequest;
    putBodySnapshotAtRequest = null;
    const current = get().signature;
    const currentBody = current ? JSON.stringify(buildPutBody(current)) : '';
    const editorMovedOn = snap !== null && currentBody !== snap;

    if (editorMovedOn) {
      // Keep in-memory signature and preview; server row matches an older edit.
      set({
        isSaving: false,
        saveStatus: 'saved',
      });
    } else {
      const nextSig = withStarterContentIfEmpty(sig);
      const gh = nextSig?.generated_html || '';
      set({
        signature: nextSig,
        generatedHTML: gh,
        isDirty: false,
        isSaving: false,
        saveStatus: 'saved',
      });
      if (gh) queueMicrotask(() => runPuppeteerExport(gh));
    }
    setTimeout(() => {
      if (useEditorStore.getState().saveStatus === 'saved') {
        useEditorStore.setState({ saveStatus: 'idle' });
      }
    }, 2500);
  },

  loadSignature: async (id) => {
    putBodySnapshotAtRequest = null;
    if (!id || id === 'new') {
      set({
        signatureId: null,
        signature: null,
        isLoading: false,
        generatedHTML: '',
        previewError: null,
        exportImageUrl: '',
        exportBannerImageUrl: '',
        exportImageError: null,
        exportImageWarning: null,
        exportGenerating: false,
        isDirty: false,
      });
      return;
    }
    set({ isLoading: true });
    try {
      const { data } = await signaturesAPI.getById(id);
      const row = data?.signature;
      const apiSig = clientSignatureFromApi(row);
      const pristineFromApi =
        !hasAnyPersonalFieldContent(apiSig.fields || {}) &&
        !hasAnySocialContent(apiSig.social_links || {});
      const sig = withStarterContentIfEmpty(apiSig);
      const seedFromSavedMyInfo = pristineFromApi && hasPersistedMyInfoDraft();
      set({
        signatureId: id,
        signature: sig,
        generatedHTML: sig?.generated_html || '',
        previewError: null,
        exportImageUrl: '',
        exportBannerImageUrl: '',
        exportImageError: null,
        exportImageWarning: null,
        exportGenerating: false,
        isLoading: false,
        isDirty: seedFromSavedMyInfo,
        saveStatus: 'idle',
      });
      queueMicrotask(() => {
        useEditorStore.getState().refreshPreviewNow();
        if (seedFromSavedMyInfo) useEditorStore.getState().scheduleAutosave();
      });
    } catch (e) {
      console.error(e);
      set({ isLoading: false, signature: null, signatureId: null });
      throw e;
    }
  },

  updateField: (fieldPath, value) => {
    const sig = get().signature;
    if (!sig) return;
    const next = setByPath(sig, fieldPath, value);
    set({ signature: next, isDirty: true, saveStatus: 'idle' });
    if (
      fieldPath.startsWith('fields.') ||
      fieldPath.startsWith('social_links.')
    ) {
      persistMyInfoDraft();
    }
    runDebouncedPreview();
    get().scheduleAutosave();
  },

  /** Image-as-template layouts: keep `design` and `fields` in sync for save + HTML generation. */
  updateSignatureDesignImageUrl: (url) => {
    const sig = get().signature;
    if (!sig) return;
    const v = String(url ?? '').trim();
    let next = setByPath(sig, 'design.signatureImageUrl', v);
    next = setByPath(next, 'fields.signature_image_url', v);
    set({ signature: next, isDirty: true, saveStatus: 'idle' });
    runDebouncedPreview();
    get().scheduleAutosave();
  },

  saveSignature: async () => {
    const { signature, signatureId } = get();
    if (!signatureId || !signature) return false;
    runDebouncedRegenerate.cancel();
    runDebouncedPreview.cancel();
    const body = buildPutBody(signature);
    putBodySnapshotAtRequest = JSON.stringify(body);
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      const { data } = await signaturesAPI.update(signatureId, body);
      const row = data?.signature;
      if (row) get()._applyPutResult(row);
      else putBodySnapshotAtRequest = null;
      return true;
    } catch (e) {
      console.error(e);
      putBodySnapshotAtRequest = null;
      set({ isSaving: false, saveStatus: 'error' });
      return false;
    }
  },

  setTemplate: (templateId) => {
    const sig = get().signature;
    if (!sig) return;
    const raw = String(templateId).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      raw
    );
    const lower = raw.toLowerCase();
    let engineSlug = isUuid ? uuidToTemplateSlug(raw) : lower;
    if (/^template_\d+$/i.test(engineSlug)) {
      engineSlug = engineSlugForGalleryPreview(engineSlug);
    }
    let nextFk = sig.template_id;
    if (isUuid) {
      nextFk = raw;
    } else if (/^template_\d+$/i.test(lower)) {
      nextFk = TEMPLATE_SLUG_TO_UUID[engineSlug] || null;
    }
    runDebouncedPreview.cancel();
    set({
      signature: {
        ...sig,
        template_id: nextFk,
        design: { ...sig.design, templateId: engineSlug },
      },
      isDirty: true,
      saveStatus: 'idle',
    });
    get().refreshPreviewNow();
    runDebouncedPreview();
    get().scheduleAutosave();
  },

  setPalette: (colors) => {
    const sig = get().signature;
    if (!sig || !Array.isArray(colors) || colors.length < 4) return;
    const [a, b, c, d] = colors;
    runDebouncedPreview.cancel();
    set({
      signature: {
        ...sig,
        design: {
          ...sig.design,
          colors: [...colors.slice(0, 4)],
          palette: {
            ...sig.design.palette,
            primary: a,
            secondary: b,
            accent: c,
            text: d,
          },
        },
      },
      isDirty: true,
      saveStatus: 'idle',
    });
    get().refreshPreviewNow();
    runDebouncedPreview();
    get().scheduleAutosave();
  },

  ensureBannersCache: async () => {
    if (get().bannersCache) return get().bannersCache;
    try {
      const { data } = await bannersAPI.getAll();
      const raw = data?.banners || [];
      const list = filterAndSortEditorBanners(raw);
      set({ bannersCache: list });
      return list;
    } catch {
      return [];
    }
  },

  setBanner: async (bannerId) => {
    const sig = get().signature;
    if (!sig) return;
    if (!bannerId) {
      runDebouncedPreview.cancel();
      set({
        signature: {
          ...sig,
          banner_id: null,
          banner_config: {},
          fields: fieldsWithoutBundleBanner(sig.fields || {}),
        },
        isDirty: true,
        saveStatus: 'idle',
      });
      void get().refreshPreviewNow();
      get().scheduleAutosave();
      return;
    }
    const list = await get().ensureBannersCache();
    const b = list.find((x) => x.id === bannerId);
    const pid = bannerPresetFromRow(b);
    const isWebinar = isWebinarBannerPreset(pid, b?.id);
    const text = isWebinar
      ? 'Book my seat'
      : /book|call/i.test(pid)
        ? 'Book a call today'
        : b?.name || 'Learn more';
    const webinarFields = isWebinar
      ? {
          field_1: 'Email Marketing 101 Webinar',
          field_2: 'Only 10 seats available!',
          field_3: 'Book my seat',
          field_4: '88',
        }
      : {};
    const prev = sig.banner_config || {};
    let preserved = pickSecondaryBannerConfig(prev);
    if (preserved.secondary_banner_id && String(preserved.secondary_banner_id) === String(bannerId)) {
      preserved = {};
    }
    set({
      signature: {
        ...sig,
        banner_id: bannerId,
        banner_config: {
          preset_id: pid,
          link_url: 'https://',
          text,
          ...webinarFields,
          ...preserved,
        },
      },
      isDirty: true,
      saveStatus: 'idle',
    });
    runDebouncedPreview();
    get().scheduleAutosave();
  },

  setSecondaryBanner: async (bannerId) => {
    const sig = get().signature;
    if (!sig) return;
    const prev = sig.banner_config || {};
    if (!bannerId) {
      runDebouncedPreview.cancel();
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith('secondary_')) delete next[k];
      }
      set({
        signature: { ...sig, banner_config: next },
        isDirty: true,
        saveStatus: 'idle',
      });
      void get().refreshPreviewNow();
      get().scheduleAutosave();
      return;
    }
    if (String(bannerId) === String(sig.banner_id)) return;
    const list = await get().ensureBannersCache();
    const b = list.find((x) => x.id === bannerId);
    const pid = bannerPresetFromRow(b);
    const isWebinar = isWebinarBannerPreset(pid, b?.id);
    const secText = isWebinar
      ? 'Book my seat'
      : /book|call/i.test(pid)
        ? 'Book a call today'
        : b?.name || 'Learn more';
    const baseCfg = { ...prev };
    for (const k of Object.keys(baseCfg)) {
      if (k.startsWith('secondary_')) delete baseCfg[k];
    }
    const webinarSecondary = isWebinar
      ? {
          secondary_field_1: 'Email Marketing 101 Webinar',
          secondary_field_2: 'Only 10 seats available!',
          secondary_field_3: 'Book my seat',
          secondary_field_4: '88',
        }
      : {};
    set({
      signature: {
        ...sig,
        banner_config: {
          ...baseCfg,
          secondary_banner_id: bannerId,
          secondary_preset_id: pid,
          secondary_link_url: 'https://',
          secondary_href: '',
          secondary_text: secText,
          ...webinarSecondary,
        },
      },
      isDirty: true,
      saveStatus: 'idle',
    });
    runDebouncedPreview();
    get().scheduleAutosave();
  },

  /** Debounced PUT to persist the signature (~2s after edits). */
  scheduleAutosave: () => {
    runDebouncedRegenerate();
  },

  /** @deprecated Misleading name — use `scheduleAutosave`. Same behavior. */
  regenerateHTML: () => {
    runDebouncedRegenerate();
  },

  /** Immediate HTML preview (no debounce). Use after load or layout change. */
  refreshPreviewNow: async () => {
    const seq = ++htmlPreviewSeq;
    const sig = get().signature;
    if (!sig) return;
    set({ previewError: null });
    try {
      const { data } = await api.post('/html/generate', signatureToEditorPayload(sig));
      if (seq !== htmlPreviewSeq) return;
      const html = data?.html || '';
      if (html) {
        set({ generatedHTML: html, previewError: null });
        runPuppeteerExport(html);
      } else {
        set({
          previewError:
            'Preview is empty. Check that the API server is running and POST /api/html/generate succeeds.',
        });
        if (import.meta.env.DEV) {
          console.warn('[editor] /html/generate returned empty html');
        }
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Could not load preview.';
      const hint =
        e?.response?.status === 401
          ? ' Sign in again — preview needs a valid session.'
          : import.meta.env.DEV
            ? ' In dev, ensure the API is on port 3001 and Vite proxies /api (see vite.config.js).'
            : '';
      set({ previewError: `${msg}${hint}` });
      if (import.meta.env.DEV) {
        console.warn('[editor] Live preview failed (POST /api/html/generate):', msg);
      }
    }
  },

  /** Re-run Puppeteer export for current generatedHTML (e.g. before copy if URL missing). */
  refreshExportImage: async () => {
    await runPuppeteerExport(get().generatedHTML);
  },

  openInstallModal: () => set({ showInstallModal: true }),
  closeInstallModal: () => set({ showInstallModal: false }),

  resetEditor: () => {
    runDebouncedRegenerate.cancel();
    runDebouncedPreview.cancel();
    putBodySnapshotAtRequest = null;
    set({
      signatureId: null,
      signature: null,
      isLoading: false,
      isDirty: false,
      isSaving: false,
      generatedHTML: '',
      previewError: null,
      exportImageUrl: '',
      exportBannerImageUrl: '',
      exportImageError: null,
      exportImageWarning: null,
      exportGenerating: false,
      showInstallModal: false,
      saveStatus: 'idle',
      bannersCache: null,
    });
  },

}));
