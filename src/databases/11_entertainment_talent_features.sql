-- =====================================================================
-- Peak Star Entertainment: talent card, children, submissions, consents
-- Run AFTER 01 to 04, 06, 07, 08, 09 and 10, in the Supabase SQL Editor
-- tab "entertainment_schema". Safe to run more than once.
--
-- What it adds
--  1. ent_profiles: headline, availability, private stats, public card
--     settings, "verified" and "published" dates (only staff can set the
--     last two).
--  2. ent_children      : the children a parent or guardian follows.
--  3. ent_submissions   : the clips sent for scouts to review, with a
--     status that moves from "submitted" to "documentary linked".
--     ent_submission_events keeps the history shown as the tracker.
--  4. ent_consents      : separate, timestamped consent for review, visit,
--     profile, showcase reel and documentary (each can be withdrawn).
--  5. ent_takedowns     : "take my profile down" requests.
--  6. The private storage bucket "ent-clips" for the clips (up to 50 MB).
--
-- Rules built in
--  * A member can never set verified_at or published_at on their own card.
--  * A member can only reply to a scout (when more information is asked)
--    or withdraw a submission. Only staff move the status forward.
--  * A child's submission cannot reach "visit scheduled" without the
--    guardian's visit consent, nor "published" without the profile consent.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. New columns on the profile
-- ---------------------------------------------------------------------
alter table public.ent_profiles
  add column if not exists headline        text,
  add column if not exists availability    text  not null default 'available',
  add column if not exists private_stats   jsonb not null default '{}'::jsonb,
  add column if not exists public_settings jsonb not null default '{}'::jsonb,
  add column if not exists verified_at     timestamptz,
  add column if not exists published_at    timestamptz;

alter table public.ent_profiles drop constraint if exists ent_profiles_availability_check;
alter table public.ent_profiles
  add constraint ent_profiles_availability_check check (availability in ('available', 'busy'));

-- keep the old rule (role and status are for staff only) and add the new one
create or replace function public.ent_profiles_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();

  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not public.can_manage_ent_role(old.role) then
    raise exception 'Only an authorised admin can change a role or status.';
  end if;

  if (new.verified_at is distinct from old.verified_at or new.published_at is distinct from old.published_at)
     and not public.can_manage_ent_role(old.role) then
    raise exception 'Only an authorised scout or admin can verify or publish a profile.';
  end if;

  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 2. Children followed by a parent or guardian
-- ---------------------------------------------------------------------
create table if not exists public.ent_children (
  id          uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users (id) on delete cascade,
  first_name  text not null check (char_length(btrim(first_name)) between 1 and 60),
  age_years   int  not null check (age_years between 0 and 17),
  province    text,
  district    text,
  category    text,
  specialty   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ent_children_guardian_idx on public.ent_children (guardian_id);

alter table public.ent_children enable row level security;

drop policy if exists ent_children_own    on public.ent_children;
drop policy if exists ent_children_staff  on public.ent_children;

create policy ent_children_own on public.ent_children
  for all to authenticated
  using (guardian_id = auth.uid())
  with check (guardian_id = auth.uid());

create policy ent_children_staff on public.ent_children
  for select to authenticated
  using (public.can_manage_ent_role('talent'));


-- ---------------------------------------------------------------------
-- 3. Consents (one row each time a consent is given; withdrawn_at when taken back)
--    child_id empty = the member's own consent
-- ---------------------------------------------------------------------
create table if not exists public.ent_consents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  child_id        uuid references public.ent_children (id) on delete cascade,
  kind            text not null check (kind in ('review', 'visit', 'profile', 'reel', 'documentary')),
  given_by        text,
  wording_version text not null default 'v1',
  given_at        timestamptz not null default now(),
  withdrawn_at    timestamptz
);

-- only one active consent of each kind for each person
create unique index if not exists ent_consents_one_active
  on public.ent_consents (user_id, coalesce(child_id, '00000000-0000-0000-0000-000000000000'::uuid), kind)
  where withdrawn_at is null;

alter table public.ent_consents enable row level security;

drop policy if exists ent_consents_select_own   on public.ent_consents;
drop policy if exists ent_consents_select_staff on public.ent_consents;
drop policy if exists ent_consents_insert_own   on public.ent_consents;
drop policy if exists ent_consents_update_own   on public.ent_consents;

create policy ent_consents_select_own on public.ent_consents
  for select to authenticated using (user_id = auth.uid());

create policy ent_consents_select_staff on public.ent_consents
  for select to authenticated using (public.can_manage_ent_role('talent'));

create policy ent_consents_insert_own on public.ent_consents
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and withdrawn_at is null
    and (child_id is null or exists (
      select 1 from public.ent_children c where c.id = child_id and c.guardian_id = auth.uid()
    ))
  );

create policy ent_consents_update_own on public.ent_consents
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- a consent can only be withdrawn, never rewritten
create or replace function public.ent_consents_guard()
returns trigger
language plpgsql
as $$
begin
  if (new.user_id, new.child_id, new.kind, new.given_by, new.wording_version, new.given_at)
     is distinct from (old.user_id, old.child_id, old.kind, old.given_by, old.wording_version, old.given_at) then
    raise exception 'A consent cannot be changed, only withdrawn.';
  end if;
  if old.withdrawn_at is not null then
    raise exception 'This consent was already withdrawn.';
  end if;
  return new;
end;
$$;

drop trigger if exists ent_consents_guard_trg on public.ent_consents;
create trigger ent_consents_guard_trg
  before update on public.ent_consents
  for each row execute function public.ent_consents_guard();


-- ---------------------------------------------------------------------
-- 4. Submissions (clips sent for scouts to review)
-- ---------------------------------------------------------------------
create table if not exists public.ent_submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  subject       text not null check (subject in ('self', 'child', 'adult')),
  child_id      uuid references public.ent_children (id) on delete set null,
  person_name   text not null check (char_length(btrim(person_name)) between 1 and 80),
  what_they_do  text,
  category      text,
  location      text,
  video_url     text,
  video_path    text,
  note          text,
  person_full_name text,
  person_contact   text,
  relationship     text,
  rights_confirmed boolean not null default false,
  person_agreed    boolean not null default false,
  status        text not null default 'submitted' check (status in (
                  'submitted', 'in_review', 'needs_info', 'verified', 'rejected',
                  'visit_scheduled', 'shot', 'profile_draft', 'published',
                  'documentary_linked', 'withdrawn')),
  status_note   text,
  reply_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint ent_submissions_has_video check (video_url is not null or video_path is not null)
);

create index if not exists ent_submissions_user_idx   on public.ent_submissions (user_id, created_at desc);
create index if not exists ent_submissions_status_idx on public.ent_submissions (status);

create table if not exists public.ent_submission_events (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.ent_submissions (id) on delete cascade,
  status        text not null,
  note          text,
  actor         text not null default 'team' check (actor in ('member', 'team')),
  created_at    timestamptz not null default now()
);

create index if not exists ent_submission_events_idx on public.ent_submission_events (submission_id, created_at);

alter table public.ent_submissions       enable row level security;
alter table public.ent_submission_events enable row level security;

drop policy if exists ent_submissions_select_own   on public.ent_submissions;
drop policy if exists ent_submissions_select_staff on public.ent_submissions;
drop policy if exists ent_submissions_insert_own   on public.ent_submissions;
drop policy if exists ent_submissions_update_own   on public.ent_submissions;
drop policy if exists ent_submissions_update_staff on public.ent_submissions;
drop policy if exists ent_submission_events_select on public.ent_submission_events;

create policy ent_submissions_select_own on public.ent_submissions
  for select to authenticated using (user_id = auth.uid());

create policy ent_submissions_select_staff on public.ent_submissions
  for select to authenticated using (public.can_manage_ent_role('talent'));

create policy ent_submissions_insert_own on public.ent_submissions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (child_id is null or exists (
      select 1 from public.ent_children c where c.id = child_id and c.guardian_id = auth.uid()
    ))
  );

create policy ent_submissions_update_own on public.ent_submissions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy ent_submissions_update_staff on public.ent_submissions
  for update to authenticated
  using (public.can_manage_ent_role('talent'))
  with check (public.can_manage_ent_role('talent'));

create policy ent_submission_events_select on public.ent_submission_events
  for select to authenticated
  using (exists (
    select 1 from public.ent_submissions s
    where s.id = submission_id
      and (s.user_id = auth.uid() or public.can_manage_ent_role('talent'))
  ));

-- the rules of a submission
create or replace function public.ent_submissions_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_team boolean := public.can_manage_ent_role('talent');
begin
  if tg_op = 'INSERT' then
    -- every new submission starts at the beginning
    new.status := 'submitted';
    new.status_note := null;
    new.reply_note := null;
    return new;
  end if;

  new.updated_at := now();

  if not is_team then
    -- a member may only reply to the scout, or withdraw
    if new.user_id is distinct from old.user_id then
      raise exception 'You cannot change the owner of a submission.';
    end if;
    if (new.subject, new.child_id, new.person_name, new.what_they_do, new.category, new.location,
        new.video_url, new.video_path, new.note, new.status_note,
        new.person_full_name, new.person_contact, new.relationship, new.rights_confirmed, new.person_agreed)
       is distinct from
       (old.subject, old.child_id, old.person_name, old.what_they_do, old.category, old.location,
        old.video_url, old.video_path, old.note, old.status_note,
        old.person_full_name, old.person_contact, old.relationship, old.rights_confirmed, old.person_agreed) then
      raise exception 'A submitted clip cannot be edited. Withdraw it and send a new one.';
    end if;
    if new.status is distinct from old.status and new.status <> 'withdrawn' then
      raise exception 'Only the scouting team moves a submission forward.';
    end if;
    if old.status = 'withdrawn' then
      raise exception 'This submission was withdrawn.';
    end if;
    -- answering a "needs more information" request puts it back in review
    if new.reply_note is distinct from old.reply_note and old.status = 'needs_info' and new.status = old.status then
      new.status := 'in_review';
    end if;
  else
    -- child safety gates for the team
    if new.status is distinct from old.status and new.subject = 'child' then
      if new.status = 'visit_scheduled' and not exists (
        select 1 from public.ent_consents c
        where c.user_id = new.user_id and c.child_id is not distinct from new.child_id
          and c.kind = 'visit' and c.withdrawn_at is null
      ) then
        raise exception 'A visit cannot be scheduled for a child without the guardian''s visit consent.';
      end if;
      if new.status = 'published' and not exists (
        select 1 from public.ent_consents c
        where c.user_id = new.user_id and c.child_id is not distinct from new.child_id
          and c.kind = 'profile' and c.withdrawn_at is null
      ) then
        raise exception 'A child''s profile cannot be published without the guardian''s profile consent.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists ent_submissions_guard_trg on public.ent_submissions;
create trigger ent_submissions_guard_trg
  before insert or update on public.ent_submissions
  for each row execute function public.ent_submissions_guard();

-- the history shown as the tracker
create or replace function public.ent_submissions_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.ent_submission_events (submission_id, status, note, actor)
    values (new.id, 'submitted', null, 'member');
  else
    if new.reply_note is distinct from old.reply_note and new.reply_note is not null then
      insert into public.ent_submission_events (submission_id, status, note, actor)
      values (new.id, new.status, new.reply_note, 'member');
    elsif new.status is distinct from old.status then
      insert into public.ent_submission_events (submission_id, status, note, actor)
      values (
        new.id, new.status,
        case when new.status_note is distinct from old.status_note then new.status_note end,
        case when auth.uid() = new.user_id and not public.can_manage_ent_role('talent') then 'member' else 'team' end
      );
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists ent_submissions_log_trg on public.ent_submissions;
create trigger ent_submissions_log_trg
  after insert or update on public.ent_submissions
  for each row execute function public.ent_submissions_log();


-- ---------------------------------------------------------------------
-- 5. Take-down requests
-- ---------------------------------------------------------------------
create table if not exists public.ent_takedowns (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  child_id   uuid references public.ent_children (id) on delete set null,
  reason     text,
  status     text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

alter table public.ent_takedowns enable row level security;

drop policy if exists ent_takedowns_select_own   on public.ent_takedowns;
drop policy if exists ent_takedowns_select_staff on public.ent_takedowns;
drop policy if exists ent_takedowns_insert_own   on public.ent_takedowns;
drop policy if exists ent_takedowns_update_staff on public.ent_takedowns;

create policy ent_takedowns_select_own on public.ent_takedowns
  for select to authenticated using (user_id = auth.uid());

create policy ent_takedowns_select_staff on public.ent_takedowns
  for select to authenticated using (public.can_manage_ent_role('talent'));

create policy ent_takedowns_insert_own on public.ent_takedowns
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'open'
    and (child_id is null or exists (
      select 1 from public.ent_children c where c.id = child_id and c.guardian_id = auth.uid()
    ))
  );

create policy ent_takedowns_update_staff on public.ent_takedowns
  for update to authenticated
  using (public.can_manage_ent_role('talent'))
  with check (public.can_manage_ent_role('talent'));

-- asking for a take-down withdraws the matching consents at once
create or replace function public.ent_takedowns_apply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ent_consents
     set withdrawn_at = now()
   where user_id = new.user_id
     and withdrawn_at is null
     and child_id is not distinct from new.child_id;
  return null;
end;
$$;

drop trigger if exists ent_takedowns_apply_trg on public.ent_takedowns;
create trigger ent_takedowns_apply_trg
  after insert on public.ent_takedowns
  for each row execute function public.ent_takedowns_apply();


-- ---------------------------------------------------------------------
-- 6. Private storage for the clips (50 MB each). Not public: a clip is
--    only seen by its owner and by the scouting team.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ent-clips', 'ent-clips', false)
on conflict (id) do nothing;

do $$
begin
  update storage.buckets
     set file_size_limit = 52428800,
         allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp']
   where id = 'ent-clips';
exception when others then
  raise notice 'Bucket limits not set: %', sqlerrm;
end;
$$;

drop policy if exists ent_clips_insert on storage.objects;
drop policy if exists ent_clips_select on storage.objects;
drop policy if exists ent_clips_delete on storage.objects;

create policy ent_clips_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ent-clips' and (storage.foldername(name))[1] = auth.uid()::text);

create policy ent_clips_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'ent-clips'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.can_manage_ent_role('talent'))
  );

create policy ent_clips_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'ent-clips' and (storage.foldername(name))[1] = auth.uid()::text);


-- ---------------------------------------------------------------------
-- Check: should return 5 tables, 6 new profile columns and 1 bucket
-- ---------------------------------------------------------------------
select 'table' as what, table_name as name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('ent_children', 'ent_consents', 'ent_submissions', 'ent_submission_events', 'ent_takedowns')
union all
select 'column', column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'ent_profiles'
  and column_name in ('headline', 'availability', 'private_stats', 'public_settings', 'verified_at', 'published_at')
union all
select 'bucket', id from storage.buckets where id = 'ent-clips'
order by 1, 2;