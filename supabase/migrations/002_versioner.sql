-- Mega Akademin: flera versioner av innehåll per kapitel.
-- Nyaste versionen visas först, äldre finns kvar som historik.
-- Kör hela filen i Supabase: SQL Editor -> New query -> klistra in -> Run.
-- (Kräver att 001_innehall.sql redan är körd.)

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  chapter_id text not null,           -- t.ex. "ak4-omkrets-och-area"
  type text not null check (type in ('video', 'ovning', 'quiz')),
  title text,
  video_url text,
  description text,
  tasks jsonb,                        -- ["Uppgift 1", ...]
  questions jsonb,                    -- [{ "prompt", "options", "correctIndex", "focus" }]
  tools text[],
  published_month text not null,      -- "2026-11"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create index if not exists content_items_chapter_type on public.content_items (chapter_id, type, published_month desc);

alter table public.content_items enable row level security;

drop policy if exists "Alla kan läsa material" on public.content_items;
create policy "Alla kan läsa material" on public.content_items for select using (true);

drop policy if exists "Admins kan lägga till material" on public.content_items;
create policy "Admins kan lägga till material" on public.content_items for insert with check (public.is_admin());

drop policy if exists "Admins kan ändra material" on public.content_items;
create policy "Admins kan ändra material" on public.content_items for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins kan ta bort material" on public.content_items;
create policy "Admins kan ta bort material" on public.content_items for delete using (public.is_admin());

drop trigger if exists content_items_touch on public.content_items;
create trigger content_items_touch before update on public.content_items
  for each row execute function public.touch_updated_at();

-- Flytta över det som redan har lagts upp i den gamla tabellen.
insert into public.content_items (chapter_id, type, title, video_url, description, tasks, questions, tools, published_month, updated_by)
select
  regexp_replace(step_id, '-(video|ovning|quiz)$', ''),
  type, title, video_url, description, tasks, questions, tools,
  coalesce(published_month, to_char(now(), 'YYYY-MM')),
  updated_by
from public.step_content s
where not exists (
  select 1 from public.content_items c
  where c.chapter_id = regexp_replace(s.step_id, '-(video|ovning|quiz)$', '') and c.type = s.type
);
