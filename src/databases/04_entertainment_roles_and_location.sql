-- =====================================================================
-- Peak Star Entertainment: 6 kinds of users + country / province / district
-- Run AFTER 01, 02 and 03. Safe to run more than once.
--   visitor   explores talents, news and videos          (active at once)
--   talent    shows a talent                             (active at once)
--   guardian  parent / guardian of a young talent        (active at once)
--   scout     finds and verifies talents                 (needs approval)
--   manager   talent manager / agent                     (needs approval)
--   partner   club, academy, label, studio, brand        (needs approval)
-- =====================================================================


-- 1. New columns for the place where the person lives
alter table public.ent_profiles add column if not exists country  text;
alter table public.ent_profiles add column if not exists province text;
alter table public.ent_profiles add column if not exists district text;


-- 2. Allow the two new kinds of users
alter table public.ent_profiles
  drop constraint if exists ent_profiles_role_check;

alter table public.ent_profiles
  add constraint ent_profiles_role_check
  check (role in ('visitor', 'talent', 'guardian', 'scout', 'manager', 'partner'));


-- 3. Which staff role manages which kind of user
--    super_admin / entertainment_admin : everyone
--    scouting_manager                  : scouts, talents, talent managers
--    partner_manager                   : partners, talent managers
create or replace function public.can_manage_ent_role(p_ent_role text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.platform_staff s
    where s.user_id = auth.uid()
      and (
        s.role in ('super_admin', 'entertainment_admin')
        or (s.role = 'scouting_manager' and p_ent_role in ('scout', 'talent', 'manager'))
        or (s.role = 'partner_manager'  and p_ent_role in ('partner', 'manager'))
      )
  );
$$;


-- 4. Sign-up rule: visitors, talents and guardians are active at once;
--    scouts, talent managers and partners always start as "pending"
drop policy if exists ent_profiles_insert_own on public.ent_profiles;

create policy ent_profiles_insert_own on public.ent_profiles
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      (role in ('visitor', 'talent', 'guardian') and status = 'active')
      or (role in ('scout', 'manager', 'partner') and status = 'pending')
    )
  );


-- 5. Automatic profile when someone signs up from the Entertainment pages
create or replace function public.handle_new_ent_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_province text := nullif(trim(v_meta ->> 'province'), '');
  v_district text := nullif(trim(v_meta ->> 'district'), '');
begin
  if v_meta ->> 'site' = 'entertainment' then
    v_role := v_meta ->> 'ent_role';
    if v_role is null or v_role not in ('visitor', 'talent', 'guardian', 'scout', 'manager', 'partner') then
      v_role := 'visitor';
    end if;

    insert into public.ent_profiles
      (user_id, role, status, full_name, phone, region, organization, country, province, district)
    values (
      new.id,
      v_role,
      case when v_role in ('scout', 'manager', 'partner') then 'pending' else 'active' end,
      nullif(trim(coalesce(v_meta ->> 'first_name', '') || ' ' || coalesce(v_meta ->> 'last_name', '')), ''),
      nullif(trim(v_meta ->> 'phone'), ''),
      nullif(concat_ws(' / ', v_province, v_district), ''),
      nullif(trim(v_meta ->> 'organization'), ''),
      nullif(trim(v_meta ->> 'country'), ''),
      v_province,
      v_district
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
exception when others then
  raise warning 'handle_new_ent_user failed: %', sqlerrm;
  return new;
end;
$$;


-- 6. The list used by the admin Users screen now also shows the place
drop function if exists public.ent_list_users();

create or replace function public.ent_list_users()
returns table (
  user_id       uuid,
  email         text,
  full_name     text,
  role          text,
  status        text,
  phone         text,
  country       text,
  province      text,
  district      text,
  organization  text,
  created_at    timestamptz
)
language sql stable security definer set search_path = public
as $$
  select p.user_id, u.email::text, p.full_name, p.role, p.status, p.phone,
         p.country, p.province, p.district, p.organization, p.created_at
  from public.ent_profiles p
  join auth.users u on u.id = p.user_id
  where public.can_manage_ent_role(p.role)
  order by p.created_at desc;
$$;

grant execute on function public.ent_list_users() to authenticated;


-- Check: the role rule and the new columns
select pg_get_constraintdef(oid) as role_rule
from pg_constraint
where conname = 'ent_profiles_role_check';

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'ent_profiles'
  and column_name in ('country', 'province', 'district')
order by column_name;