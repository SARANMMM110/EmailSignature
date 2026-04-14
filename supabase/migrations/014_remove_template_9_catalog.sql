-- Application no longer ships Layout 9 (engine `template_9`). Remove catalog row if re-seeded (013).

update public.signatures
set template_id = 'a0000001-0000-4000-8000-000000000001'
where template_id = 'a0000009-0000-4000-8000-000000000009';

delete from public.templates where id = 'a0000009-0000-4000-8000-000000000009';
