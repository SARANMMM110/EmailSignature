/**
 * Upsert signature templates (and banners) into Supabase from source modules.
 * Run: node src/scripts/seedTemplates.js
 */
import { supabaseAdmin } from '../services/supabase.js';
import { TEMPLATE_META } from '../templates/signatureTemplates.js';
import { BANNER_TEMPLATES } from '../templates/bannerTemplates.js';
import { TEMPLATE_SLUG_TO_UUID, BANNER_SLUG_TO_UUID } from '../lib/templateIds.js';

const BANNER_KEY_BY_SLUG = {
  'book-call': 'banner_2',
  download: 'banner_3',
  webinar: 'banner_1',
  'need-call': 'banner_4',
  'subscriber-journey': 'banner_4',
  blank: 'banner_blank',
  'boost-improve-banner': 'banner_8',
  'online-loan-banner': 'banner_9',
  'leave-review-banner': 'banner_11',
  'seo-whitepaper-banner': 'banner_12',
  'green-gradient-cta-banner': 'banner_13',
};

async function seedTemplates() {
  if (!supabaseAdmin) {
    console.error('supabaseAdmin not configured (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  for (const slug of Object.keys(TEMPLATE_META)) {
    const meta = TEMPLATE_META[slug];
    const uuid = TEMPLATE_SLUG_TO_UUID[slug];
    if (!uuid) {
      console.warn(`No UUID mapping for ${slug}, skip`);
      continue;
    }
    const { error } = await supabaseAdmin.from('templates').upsert(
      {
        id: uuid,
        name: meta.name,
        html_structure: '',
        tier: meta.tier,
        style: meta.style,
        has_logo: meta.has_logo,
        has_photo: meta.has_photo,
        color_count: meta.color_count,
        sort_order: Number.parseInt(slug.split('_')[1], 10) || 0,
        preview_img_url: meta.preview_img_url,
        is_active: true,
      },
      { onConflict: 'id' }
    );
    if (error) console.error(`Error seeding ${slug}:`, error);
    else console.log(`✓ Seeded template ${meta.name}`);
  }
}

async function seedBanners() {
  if (!supabaseAdmin) return;

  for (const [slug, uuid] of Object.entries(BANNER_SLUG_TO_UUID)) {
    const key = BANNER_KEY_BY_SLUG[slug];
    if (!key || !BANNER_TEMPLATES[key]) continue;
    const html = BANNER_TEMPLATES[key];
    const name =
      slug === 'download'
        ? 'Download'
        : slug === 'webinar'
          ? 'Webinar'
          : slug === 'need-call'
            ? 'Need a call'
            : slug === 'subscriber-journey'
              ? 'Subscriber journey'
              : slug === 'blank'
                ? 'Image only'
                : slug === 'boost-improve-banner'
                  ? 'Boost & improve'
                  : slug === 'online-loan-banner'
                    ? 'Online loan'
                    : slug === 'leave-review-banner'
                      ? 'Leave a review'
                      : slug === 'seo-whitepaper-banner'
                        ? 'SEO whitepaper'
                        : slug === 'green-gradient-cta-banner'
                          ? 'Green gradient CTA'
                          : 'Book a call';
    const { error } = await supabaseAdmin.from('banners').upsert(
      {
        id: uuid,
        name,
        html_structure: html,
        tier:
          slug === 'webinar' ||
          slug === 'boost-improve-banner' ||
          slug === 'online-loan-banner' ||
          slug === 'leave-review-banner' ||
          slug === 'seo-whitepaper-banner' ||
          slug === 'green-gradient-cta-banner'
            ? 'pro'
            : 'free',
        is_active: true,
      },
      { onConflict: 'id' }
    );
    if (error) console.error(`Error seeding banner ${slug}:`, error);
    else console.log(`✓ Seeded banner ${name}`);
  }
}

async function main() {
  await seedTemplates();
  await seedBanners();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
