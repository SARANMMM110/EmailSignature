#!/usr/bin/env bash
# Migrate Supabase Postgres: OLD project → NEW project (public + auth + storage metadata).
#
# Prerequisites:
#   - PostgreSQL client tools: pg_dump, pg_restore (apt install postgresql-client)
#   - Old project must allow DB connections (lift storage quota / restriction if needed)
#
# Usage:
#   export OLD_DB_URL='postgresql://postgres.OLD_REF:OLD_PASSWORD@db.OLD_REF.supabase.co:5432/postgres'
#   export NEW_DB_URL='postgresql://postgres.xcydigxeazgxndgxmohk:YOUR_PASSWORD@db.xcydigxeazgxndgxmohk.supabase.co:5432/postgres'
#   bash scripts/migrate-supabase/export-and-restore.sh
#
# Get connection strings: Supabase Dashboard → Project → Settings → Database → URI (direct, port 5432).

set -euo pipefail

OUT_DIR="${OUT_DIR:-./supabase-migration-backup}"
DUMP_FILE="${OUT_DIR}/email-signature-full.dump"

if [[ -z "${OLD_DB_URL:-}" || -z "${NEW_DB_URL:-}" ]]; then
  echo "Set OLD_DB_URL and NEW_DB_URL (postgresql://...:5432/postgres)" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "==> 1/3 Exporting from OLD project (public, auth, storage schemas)..."
pg_dump "$OLD_DB_URL" \
  --schema=public \
  --schema=auth \
  --schema=storage \
  --no-owner \
  --no-acl \
  -F c \
  -f "$DUMP_FILE"

echo "==> Dump saved: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"

echo "==> 2/3 Restoring into NEW project (this may show harmless extension/policy warnings)..."
pg_restore \
  --dbname="$NEW_DB_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --verbose \
  "$DUMP_FILE" 2>&1 | tee "${OUT_DIR}/restore.log" || true

echo "==> 3/3 Row counts on NEW project (verify against old):"
psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -c "
SELECT 'auth.users' AS tbl, count(*)::text AS rows FROM auth.users
UNION ALL SELECT 'public.profiles', count(*)::text FROM public.profiles
UNION ALL SELECT 'public.signatures', count(*)::text FROM public.signatures
UNION ALL SELECT 'public.templates', count(*)::text FROM public.templates
UNION ALL SELECT 'public.banners', count(*)::text FROM public.banners
UNION ALL SELECT 'public.agency_members', count(*)::text FROM public.agency_members
UNION ALL SELECT 'storage.objects', count(*)::text FROM storage.objects;
"

echo ""
echo "Done. Next steps:"
echo "  1. cd server && node src/scripts/migrateSupabaseStorage.mjs"
echo "  2. Run scripts/migrate-supabase/replace-storage-urls.sql in NEW project SQL Editor"
echo "  3. Update server/client .env with new SUPABASE_URL and keys, redeploy"
