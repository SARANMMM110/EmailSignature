-- Layout 18 ships with a right-column portrait (Figma reference). Safe if 032 already used has_photo true.

update public.templates
set has_photo = true
where id = 'a0000018-0000-4000-8000-000000000018';
