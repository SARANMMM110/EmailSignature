/**
 * Generate HTML for templates 1–6 and write test_output_template_*.html in server cwd.
 * Run: node src/scripts/testTemplates.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSignatureHTML } from '../services/htmlGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testData = {
  template_id: 'template_1',
  fields: {
    full_name: 'Frank Andres',
    job_title: 'Digital Marketer',
    company: 'Globex Records',
    phone: '(412) 2431-9832',
    email: 'frankandres@gmail.com',
    website: 'www.globex-records.com',
    photo_url: 'https://i.pravatar.cc/150?img=8',
    logo_url: 'https://via.placeholder.com/120x50/1e3a5f/ffffff?text=LOGO',
  },
  design: {
    colors: ['#1e3a5f', '#2d6a9f', '#a8d4f5', '#f0f8ff'],
    font: 'Arial, sans-serif',
  },
  social_links: {
    linkedin: 'https://linkedin.com/in/frankandres',
    twitter: 'https://twitter.com/frankandres',
    instagram: '',
    github: '',
  },
  show_badge: false,
};

async function test() {
  const outDir = path.join(__dirname, '..', '..');
  for (let i = 1; i <= 6; i++) {
    const html = await generateSignatureHTML({ ...testData, template_id: `template_${i}` });
    const file = path.join(outDir, `test_output_template_${i}.html`);
    fs.writeFileSync(
      file,
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="padding:20px;background:#eeeeee;">${html}</body></html>`
    );
    console.log(`Template ${i}: ${Buffer.byteLength(html, 'utf8')} bytes → ${path.basename(file)}`);
  }
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
