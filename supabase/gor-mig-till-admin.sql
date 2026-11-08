-- Gör en användare till administratör.
-- 1. Skapa först användaren i Supabase: Authentication -> Users -> Add user
--    (välj "Create new user", fyll i e-post och lösenord, bocka i "Auto Confirm User").
-- 2. Byt e-postadressen nedan och kör filen i SQL Editor.

insert into public.admins (user_id)
select id from auth.users where email = 'din@epost.se'
on conflict do nothing;
