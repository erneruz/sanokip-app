-- =====================================================================
-- Peak Star: Entertainment people are NOT Engineering users
-- Run AFTER 01, 02, 03 and 04, in the Supabase SQL Editor tab
-- "entertainment_schema". Safe to run more than once.
--
-- What it does
--  1. Peak Star Engineering creates an Engineering profile for every new
--     login. From now on, a person who signs up on the Entertainment
--     pages does NOT keep that Engineering profile, so they never show in
--     the Engineering Users list or its counts.
--  2. It removes the Engineering profile of the people who already signed
--     up through the Entertainment pages (admins and staff are never touched).
--
-- People who registered on Engineering are not changed. When they log in
-- on Entertainment they choose how to join, and get their own
-- Entertainment profile.
-- =====================================================================


-- 1. The sign-up trigger function (same as before, plus the clean-up of
--    the Engineering profile)
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

    -- Entertainment people are not Engineering users: remove the
    -- Engineering profile that the Engineering trigger just created.
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
  -- never block a sign-up because of this step
  raise warning 'handle_new_ent_user failed: %', sqlerrm;
  return new;
end;
$$;


-- 2. The trigger must run AFTER the Engineering trigger that creates the
--    Engineering profile. Triggers on the same event run in alphabetical
--    order, so this one gets a name that sorts last.
drop trigger if exists on_auth_user_created_ent on auth.users;
drop trigger if exists zz_ent_on_auth_user_created on auth.users;
create trigger zz_ent_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_ent_user();


-- 3. Clean up the people who already signed up through the Entertainment
--    pages: remove their Engineering profile (never for admins or staff).
do $$
declare
  v_removed integer;
begin
  with gone as (
    delete from public.profiles p
    using auth.users u
    where p.id = u.id
      and u.raw_user_meta_data ->> 'site' = 'entertainment'
      and coalesce(p.role, 'user') <> 'admin'
      and not exists (select 1 from public.platform_staff s where s.user_id = p.id)
    returning p.id
  )
  select count(*) into v_removed from gone;
  raise notice 'Engineering profiles removed for Entertainment sign-ups: %', v_removed;
exception when others then
  raise notice 'Clean-up skipped: %', sqlerrm;
end;
$$;


-- Check 1: should show the trigger zz_ent_on_auth_user_created
select tgname
from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal
order by tgname;

-- Check 2: Entertainment sign-ups that still have an Engineering profile
-- (should be 0, admins and staff excepted)
select count(*) as still_in_engineering
from public.profiles p
join auth.users u on u.id = p.id
where u.raw_user_meta_data ->> 'site' = 'entertainment'
  and coalesce(p.role, 'user') <> 'admin';