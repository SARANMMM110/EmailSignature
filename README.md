# Email Signature Builder

React (Vite) client + Express API: Handlebars → inline CSS email HTML, Puppeteer PNG export, optional Supabase Storage for public image URLs.

## Quick start

```bash
# API
cd server && npm install && npm run dev

# Client
cd client && npm install && npm run dev
```

Configure `server/.env` and `client/.env` from each `.env.example` (Supabase URL/keys, `VITE_API_URL`).

## Verification script

```bash
node scripts/verify-signature-engine.mjs
```

Extends over time toward full template × palette matrix checks.

## QA checklist (manual)

- [ ] Editor preview iframe height tracks signature after edits and tab switches.
- [ ] Save + “Done editing” opens install modal; copy image / HTML behave in Chrome and Firefox.
- [ ] Linked signature: recipient sees image when PNG is on Supabase or `PUBLIC_BASE_URL`.
- [ ] Gmail paste: layout intact; Outlook signature editor: no broken tables.

## Architecture notes

- **HTML**: `server/src/services/htmlGenerator.js` (juice inlining, optional `SIGNATURE_PUBLIC_ASSET_BASE` for root-relative URLs).
- **Clipboard**: `client/src/lib/clipboardHelper.js` (dual MIME with Promise-based `ClipboardItem` + fallbacks).
- **Editor store**: debounced preview (300ms) + debounced autosave (~2s); `scheduleAutosave` replaces the old `regenerateHTML` naming.
