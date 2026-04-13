-- Remove Layout 7 template row (if present) and point any signatures back to Layout 1.

update public.signatures
set
  template_id = 'a0000001-0000-4000-8000-000000000001'::uuid,
  design = jsonb_set(coalesce(design, '{}'::jsonb), '{templateId}', '"template_1"', true)
where template_id = 'a0000007-0000-4000-8000-000000000007'::uuid;

delete from public.templates
where id = 'a0000007-0000-4000-8000-000000000007'::uuid;
