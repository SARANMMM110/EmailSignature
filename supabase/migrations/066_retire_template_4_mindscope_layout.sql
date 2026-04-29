-- Retire Layout 4 (Mindscope split signature, engine `template_4`): reassign signatures, remove catalog row.
-- Banner `banner_5` (Mindscope ATS strip) is unchanged.

update public.signatures
set template_id = 'a0000001-0000-4000-8000-000000000001'
where template_id = 'a0000004-0000-4000-8000-000000000004';

delete from public.templates where id = 'a0000004-0000-4000-8000-000000000004';
