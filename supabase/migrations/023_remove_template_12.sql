-- Application no longer ships Layout 12 (engine `template_12`). Reassign signatures and drop catalog row.
UPDATE public.signatures
SET template_id = 'a0000001-0000-4000-8000-000000000001'
WHERE template_id = 'a0000012-0000-4000-8000-000000000012';

DELETE FROM public.templates WHERE id = 'a0000012-0000-4000-8000-000000000012';
