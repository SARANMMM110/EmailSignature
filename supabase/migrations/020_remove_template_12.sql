-- Application no longer ships Layout 12 (engine `template_12`). Reassign signatures and drop catalog row.

update public.signatures
set template_id = 'a0000001-0000-4000-8000-000000000001'
where template_id = 'a0000012-0000-4000-8000-000000000012';

delete from public.templates where id = 'a0000012-0000-4000-8000-000000000012';
