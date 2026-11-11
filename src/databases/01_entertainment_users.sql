-- =====================================================================
-- Peak Star: separate users for Peak Star Entertainment + admin levels
-- Run in pgAdmin 4 (Query Tool) on your Supabase database.
-- Safe to run more than once. It does NOT change any existing table,
-- so Peak Star Engineering users and admins keep working as they are.
--
-- BEFORE YOU RUN: in step 8 replace PUT-YOUR-EMAIL-HERE with the email
-- you log in with. That makes you the Super Admin.
-- =====================================================================


-- 1. Peak Star Entertainment users (one row per person, one role each)
create table if not exists public.ent_profiles (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  role          text not null
                  check (role in ('talent', 'scout', 'partner', 'guardian')),
  status        text not null default 'active'
                  check (status in ('active', 'pending', 'suspended')),
  full_name     text,
  phone         text,
  region        text,
  organization  text,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists ent_profiles_role_status_idx
  on public.ent_profiles (role, status);


-- 2. Staff roles (the admin levels of the whole platform)
create table if not exists public.platform_staff (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null
                check (role in (
                  'super_admin', 'engineering_admin', 'entertainment_admin',
                  'scouting_manager', 'partner_manager'
                )),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists platform_staff_user_idx
  on public.platform_staff (user_id);


-- 3. Helper functions
create or replace function public.has_staff_role(p_role text)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.platform_staff s
    where s.user_id = auth.uid()
      and (s.role = 'super_admin' or s.role = p_role)
  );
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.platform_staff s
    where s.user_id = auth.uid() and s.role = 'super_admin'
  );
$$;

create or replace function public.can_manage_ent_role(p_ent_role text)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.platform_staff s
    where s.user_id = auth.uid()
      and (
        s.role in ('super_admin', 'entertainment_admin')
        or (s.role = 'scouting_manager' and p_ent_role in ('scout', 'talent'))
        or (s.role = 'partner_manager'  and p_ent_role = 'partner')
      )
  );
$$;

grant execute on function public.has_staff_role(text)      to authenticated;
grant execute on function public.is_super_admin()          to authenticated;
grant execute on function public.can_manage_ent_role(text) to authenticated;


-- 4. Protect role and status
create or replace function public.ent_profiles_guard()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  new.updated_at := now();
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not public.can_manage_ent_role(old.role) then
    raise exception 'Only an authorised admin can change a role or status.';
  end if;
  return new;
end;
$$;

drop trigger if exists ent_profiles_guard_trg on public.ent_profiles;
create trigger ent_profiles_guard_trg
  before update on public.ent_profiles
  for each row execute function public.ent_profiles_guard();


-- 5. Security rules (Row Level Security)
alter table public.ent_profiles   enable row level security;
alter table public.platform_staff enable row level security;

drop policy if exists ent_profiles_select_own   on public.ent_profiles;
drop policy if exists ent_profiles_select_staff on public.ent_profiles;
drop policy if exists ent_profiles_insert_own   on public.ent_profiles;
drop policy if exists ent_profiles_update_own   on public.ent_profiles;
drop policy if exists ent_profiles_update_staff on public.ent_profiles;
drop policy if exists ent_profiles_delete_staff on public.ent_profiles;

create policy ent_profiles_select_own on public.ent_profiles
  for select to authenticated using (user_id = auth.uid());

create policy ent_profiles_select_staff on public.ent_profiles
  for select to authenticated using (public.can_manage_ent_role(role));

create policy ent_profiles_insert_own on public.ent_profiles
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      (role in ('talent', 'guardian') and status = 'active')
      or (role in ('scout', 'partner') and status = 'pending')
    )
  );

create policy ent_profiles_update_own on public.ent_profiles
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ent_profiles_update_staff on public.ent_profiles
  for update to authenticated
  using (public.can_manage_ent_role(role))
  with check (public.can_manage_ent_role(role));

create policy ent_profiles_delete_staff on public.ent_profiles
  for delete to authenticated
  using (public.has_staff_role('entertainment_admin'));

drop policy if exists platform_staff_select on public.platform_staff;
drop policy if exists platform_staff_insert on public.platform_staff;
drop policy if exists platform_staff_update on public.platform_staff;
drop policy if exists platform_staff_delete on public.platform_staff;

create policy platform_staff_select on public.platform_staff
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

create policy platform_staff_insert on public.platform_staff
  for insert to authenticated with check (public.is_super_admin());

create policy platform_staff_update on public.platform_staff
  for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy platform_staff_delete on public.platform_staff
  for delete to authenticated using (public.is_super_admin());


-- 6. Entertainment users list for admin screens (with email)
create or replace function public.ent_list_users()
returns table (
  user_id uuid, email text, full_name text, role text, status text,
  phone text, region text, organization text, created_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  select p.user_id, u.email::text, p.full_name, p.role, p.status,
         p.phone, p.region, p.organization, p.created_at
  from public.ent_profiles p
  join auth.users u on u.id = p.user_id
  where public.can_manage_ent_role(p.role)
  order by p.created_at desc;
$$;
grant execute on function public.ent_list_users() to authenticated;


-- 7. Staff list for the Super Admin screen (with email)
create or replace function public.staff_list()
returns table (id uuid, user_id uuid, email text, role text, created_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select s.id, s.user_id, u.email::text, s.role, s.created_at
  from public.platform_staff s
  join auth.users u on u.id = s.user_id
  where public.is_super_admin()
  order by s.created_at desc;
$$;
grant execute on function public.staff_list() to authenticated;


-- 8. Make YOURSELF the Super Admin
--    Replace PUT-YOUR-EMAIL-HERE with your login email (keep the quotes).
insert into public.platform_staff (user_id, role)
select id, 'super_admin'
from auth.users
where lower(email) = lower('PUT-YOUR-EMAIL-HERE')
on conflict (user_id, role) do nothing;

-- Check: should show one row with your email.
select s.role, u.email
from public.platform_staff s
join auth.users u on u.id = s.user_id;