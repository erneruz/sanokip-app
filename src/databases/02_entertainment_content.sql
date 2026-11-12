-- =====================================================================
-- Peak Star Entertainment: stories, news, video clips, publications
-- Run AFTER 01_entertainment_users.sql. Safe to run more than once.
-- Does not touch Peak Star Engineering tables (posts, categories...).
-- =====================================================================


-- 1. New staff role: content_manager (creates content, cannot manage users)
alter table public.platform_staff
  drop constraint if exists platform_staff_role_check;

alter table public.platform_staff
  add constraint platform_staff_role_check
  check (role in (
    'super_admin', 'engineering_admin', 'entertainment_admin',
    'scouting_manager', 'partner_manager', 'content_manager'
  ));


-- 2. Who may create / edit / publish Entertainment content
create or replace function public.can_manage_ent_content()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.platform_staff s
    where s.user_id = auth.uid()
      and s.role in ('super_admin', 'entertainment_admin', 'content_manager')
  );
$$;
grant execute on function public.can_manage_ent_content() to authenticated;


-- 3. The content table
--    kind: story | news | video | publication
create table if not exists public.ent_content (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null
                  check (kind in ('story', 'news', 'video', 'publication')),
  title         text not null,
  slug          text not null unique,
  excerpt       text,
  body          text,
  cover_url     text,
  video_url     text,            -- YouTube / Vimeo link, or an uploaded file link
  file_url      text,            -- PDF or document (publications)
  category      text,            -- talent category slug: music, movie, dance...
  talent_id     uuid references public.ent_profiles (user_id) on delete set null,
  featured      boolean not null default false,
  status        text not null default 'draft'
                  check (status in ('draft', 'published', 'archived')),
  author_id     uuid references auth.users (id) on delete set null,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists ent_content_kind_status_idx
  on public.ent_content (kind, status, published_at desc);
create index if not exists ent_content_category_idx
  on public.ent_content (category);

-- keep updated_at fresh, and set published_at the first time it is published
create or replace function public.ent_content_touch()
returns trigger
language plpgsql set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists ent_content_touch_trg on public.ent_content;
create trigger ent_content_touch_trg
  before insert or update on public.ent_content
  for each row execute function public.ent_content_touch();


-- 4. Security rules
alter table public.ent_content enable row level security;

drop policy if exists ent_content_read_published on public.ent_content;
drop policy if exists ent_content_read_staff     on public.ent_content;
drop policy if exists ent_content_insert_staff   on public.ent_content;
drop policy if exists ent_content_update_staff   on public.ent_content;
drop policy if exists ent_content_delete_staff   on public.ent_content;

-- visitors (even not logged in) see published content only
create policy ent_content_read_published on public.ent_content
  for select to anon, authenticated
  using (status = 'published');

-- content staff also see drafts and archived items
create policy ent_content_read_staff on public.ent_content
  for select to authenticated
  using (public.can_manage_ent_content());

create policy ent_content_insert_staff on public.ent_content
  for insert to authenticated
  with check (public.can_manage_ent_content());

create policy ent_content_update_staff on public.ent_content
  for update to authenticated
  using (public.can_manage_ent_content())
  with check (public.can_manage_ent_content());

create policy ent_content_delete_staff on public.ent_content
  for delete to authenticated
  using (public.can_manage_ent_content());

grant select on public.ent_content to anon, authenticated;


-- 5. Storage bucket for images, video clips and documents
--    (public to read, only content staff can upload)
insert into storage.buckets (id, name, public)
values ('ent-media', 'ent-media', true)
on conflict (id) do nothing;

drop policy if exists ent_media_insert on storage.objects;
drop policy if exists ent_media_update on storage.objects;
drop policy if exists ent_media_delete on storage.objects;

create policy ent_media_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ent-media' and public.can_manage_ent_content());

create policy ent_media_update on storage.objects
  for update to authenticated
  using (bucket_id = 'ent-media' and public.can_manage_ent_content());

create policy ent_media_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'ent-media' and public.can_manage_ent_content());

-- Check: should list ent_content and the ent-media bucket
select 'table' as what, 'ent_content' as name
union all
select 'bucket', id from storage.buckets where id = 'ent-media';