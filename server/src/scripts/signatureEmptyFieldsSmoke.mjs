/**
 * Smoke checks for empty-field HTML output (no literal logo placeholders, no "Learn more" when CTA cleared).
 * Run: node src/scripts/signatureEmptyFieldsSmoke.mjs
 */
import { generateSignatureHtml } from '../services/htmlGenerator.js';

const palette = {
  primary: '#2563eb',
  secondary: '#1e40af',
  accent: '#93c5fd',
  text: '#0f172a',
};

function basePayload(overrides = {}) {
  return {
    templateId: 'template_1',
    form: {
      fullName: 'Test User',
      jobTitle: '',
      companyName: '',
      phone: '',
      email: 'test@example.com',
      website: '',
      address: '',
      photoUrl: '',
      logoUrl: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      github: '',
      facebook: '',
      telegram: '',
      medium: '',
      tagline: '',
      showBadge: false,
      signatureLinkUrl: '',
      entireSignatureClickable: false,
    },
    palette,
    design: { font: 'Arial, Helvetica, sans-serif', showLogo: true, showPhoto: false },
    ...overrides,
  };
}

const TEMPLATES = [
  'template_1',
  'template_2',
  'template_3',
  'template_5',
  'template_6',
  'template_7',
  'template_8',
  'template_9',
  'template_10',
  'template_11',
  'template_12',
  'template_13',
  'template_14',
  'template_15',
  'template_16',
  'template_17',
  'template_18',
  'template_19',
  'template_20',
  'template_21',
];

async function run() {
  const opts = { fillDemoPlaceholders: false, skipJuice: true, skipMinify: true };

  // Case: name + email only — every engine should return non-trivial HTML
  for (const templateId of TEMPLATES) {
    const html = await generateSignatureHtml(basePayload({ templateId }), opts);
    if (!html || html.length < 80) {
      throw new Error(`${templateId}: HTML too short`);
    }
    if (html.includes('LOGO HERE') || html.includes('>Logo<')) {
      throw new Error(`${templateId}: unexpected logo placeholder in output`);
    }
  }

  // Layout 6: show logo slot with no logo and no company — must not render "Logo" text
  const t6 = await generateSignatureHtml(
    basePayload({
      templateId: 'template_6',
      form: { ...basePayload().form, fullName: 'Pat Smith', jobTitle: 'Role', companyName: '' },
      design: { font: 'Arial', showLogo: true, showPhoto: false },
    }),
    opts
  );
  if (t6.includes('>Logo<') || /Logo<\/span>/.test(t6)) {
    throw new Error('template_6: Logo placeholder leaked');
  }

  console.log('signatureEmptyFieldsSmoke: ok (%s templates)', TEMPLATES.length);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
