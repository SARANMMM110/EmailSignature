/**
 * Map PostgREST / Supabase JS errors to HTTP-friendly errors.
 */
export function throwIfSupabaseError(error, fallbackStatus = 400) {
  if (!error) return;
  const msg = error.message || String(error);
  const err = new Error(msg);
  if (
    msg.includes('Could not find the table') ||
    msg.includes('schema cache')
  ) {
    err.statusCode = 503;
    err.message =
      'Database tables are missing. Open Supabase → SQL Editor, paste and run the file supabase/migrations/001_initial_schema.sql, then try again.';
    err.hint =
      'Project: email-signature-builder/supabase/migrations/001_initial_schema.sql';
  } else {
    err.statusCode = fallbackStatus;
  }
  throw err;
}
