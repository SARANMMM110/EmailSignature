-- Allow users to delete their own profile row (e.g. account self-service flow).
-- Note: This does not remove the auth.users record; use an Edge Function with the service role for full deletion.

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);
