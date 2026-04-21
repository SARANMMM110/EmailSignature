-- Remove Layout 16 (engine `template_16`). Reassign any signatures still pointing at it.

update public.signatures
set template_id = 'a0000001-0000-4000-8000-000000000001'::uuid
where template_id = 'a0000016-0000-4000-8000-000000000016'::uuid;

delete from public.templates where id = 'a0000016-0000-4000-8000-000000000016';
