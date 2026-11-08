-- Mega Akademin: innehåll som administratörer lägger upp.
-- Kör hela filen i Supabase: SQL Editor -> New query -> klistra in -> Run.

-- Vilka användare som är administratörer.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Innehåll per steg i kursplanen (video, övning eller quiz).
-- step_id matchar id:t i koden, t.ex. "ak4-omkrets-och-area-video".
create table if not exists public.step_content (
  step_id text primary key,
  type text not null check (type in ('video', 'ovning', 'quiz')),
  title text,
  video_url text,
  description text,
  tasks jsonb,          -- ["Uppgift 1", "Uppgift 2", ...]
  questions jsonb,      -- [{ "prompt": "...", "options": ["a","b","c","d"], "correctIndex": 0, "focus": "Metod" }]
  tools text[],         -- {kalkylator, linjal, gradskiva, koordinatsystem, tallinje}
  published_month text, -- "2026-11"
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- Hjälpfunktion: är den inloggade användaren admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins enable row level security;
alter table public.step_content enable row level security;

-- Alla (även utloggade besökare) får läsa innehållet.
drop policy if exists "Alla kan läsa innehåll" on public.step_content;
create policy "Alla kan läsa innehåll" on public.step_content
  for select using (true);

-- Bara admins får lägga till, ändra och ta bort innehåll.
drop policy if exists "Admins kan lägga till innehåll" on public.step_content;
create policy "Admins kan lägga till innehåll" on public.step_content
  for insert with check (public.is_admin());

drop policy if exists "Admins kan ändra innehåll" on public.step_content;
create policy "Admins kan ändra innehåll" on public.step_content
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins kan ta bort innehåll" on public.step_content;
create policy "Admins kan ta bort innehåll" on public.step_content
  for delete using (public.is_admin());

-- En admin får se att hen själv är admin (behövs för att sajten ska veta det).
drop policy if exists "Se sin egen adminrad" on public.admins;
create policy "Se sin egen adminrad" on public.admins
  for select using (user_id = auth.uid());

-- Håll updated_at aktuell.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists step_content_touch on public.step_content;
create trigger step_content_touch before update on public.step_content
  for each row execute function public.touch_updated_at();
