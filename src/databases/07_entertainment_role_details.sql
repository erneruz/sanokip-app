-- =====================================================================
-- Peak Star Entertainment: the professional information of each kind of
-- member (talent category and level, scouting areas, organisation type...)
-- Run AFTER 01 to 04 and 06, in the Supabase SQL Editor tab
-- "entertainment_schema". Safe to run more than once.
--
-- What it does
--  1. Adds the column ent_profiles.details (the answers, stored as JSON).
--  2. The sign-up trigger saves the answers sent by the sign-up form.
--  3. ent_list_users() also returns the answers, so admins can read them
--     in the member details.
-- =====================================================================


-- 1. The new column
alter table public.ent_profiles
  add column if not exists details jsonb not null default '{}'::jsonb;


-- 2. The sign-up trigger function (same as script 06, plus the answers)
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
  v_details jsonb := '{}'::jsonb;
begin
  if v_meta ->> 'site' = 'entertainment' then
    v_role := v_meta ->> 'ent_role';
    if v_role is null or v_role not in ('visitor', 'talent', 'guardian', 'scout', 'manager', 'partner') then
      v_role := 'visitor';
    end if;

    -- the answers must be a small JSON object, nothing else
    if jsonb_typeof(v_meta -> 'ent_details') = 'object'
       and octet_length((v_meta -> 'ent_details')::text) < 6000
       and v_role <> 'visitor' then
      v_details := v_meta -> 'ent_details';
    end if;

    insert into public.ent_profiles
      (user_id, role, status, full_name, phone, region, organization, country, province, district, details)
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
      v_district,
      v_details
    )
    on conflict (user_id) do nothing;

    -- Entertainment people are not Engineering users (see script 06)
    begin
      delete from public.profiles
      where id = new.id
        and coalesce(role, 'user') <> 'admin';
    exception when others then
      raise warning 'could not remove the Engineering profile: %', sqlerrm;
    end;
  end if;
  return new;
exception when others then
  raise warning 'handle_new_ent_user failed: %', sqlerrm;
  return new;
end;
$$;

-- the trigger itself stays as created by script 06
drop trigger if exists zz_ent_on_auth_user_created on auth.users;
create trigger zz_ent_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_ent_user();


-- 3. The admin list also returns the answers
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
  created_at    timestamptz,
  details       jsonb
)
language sql stable security definer set search_path = public
as $$
  select p.user_id, u.email::text, p.full_name, p.role, p.status, p.phone,
         p.country, p.province, p.district, p.organization, p.created_at, p.details
  from public.ent_profiles p
  join auth.users u on u.id = p.user_id
  where public.can_manage_ent_role(p.role)
  order by p.created_at desc;
$$;

grant execute on function public.ent_list_users() to authenticated;


-- Check: the column exists (should return one row)
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'ent_profiles' and column_name = 'details';