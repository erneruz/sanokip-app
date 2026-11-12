-- =====================================================================
-- Peak Star Entertainment: automatic sign-up profile + staff tools
-- Run AFTER 01 and 02. Safe to run more than once.
-- =====================================================================


-- 1. When someone signs up from the Entertainment pages, create their
--    Entertainment profile automatically.
--    The sign-up form sends: site = 'entertainment' and ent_role.
--    talent / guardian  -> active at once
--    scout / partner    -> pending until an admin approves
--    Any other value becomes 'talent'. Nobody can sign up as an admin.
create or replace function public.handle_new_ent_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if v_meta ->> 'site' = 'entertainment' then
    v_role := v_meta ->> 'ent_role';
    if v_role is null or v_role not in ('talent', 'scout', 'partner', 'guardian') then
      v_role := 'talent';
    end if;

    insert into public.ent_profiles
      (user_id, role, status, full_name, phone, region, organization)
    values (
      new.id,
      v_role,
      case when v_role in ('scout', 'partner') then 'pending' else 'active' end,
      nullif(trim(coalesce(v_meta ->> 'first_name', '') || ' ' || coalesce(v_meta ->> 'last_name', '')), ''),
      nullif(trim(v_meta ->> 'phone'), ''),
      nullif(trim(v_meta ->> 'region'), ''),
      nullif(trim(v_meta ->> 'organization'), '')
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
exception when others then
  -- never block a sign-up because of this step
  raise warning 'handle_new_ent_user failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ent on auth.users;
create trigger on_auth_user_created_ent
  after insert on auth.users
  for each row execute function public.handle_new_ent_user();


-- 2. Super Admin gives a staff role to someone by email
--    (the person must already have an account)
create or replace function public.staff_grant(p_email text, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.is_super_admin() then
    raise exception 'Only the Super Admin can give staff roles.';
  end if;

  if p_role not in (
    'super_admin', 'engineering_admin', 'entertainment_admin',
    'scouting_manager', 'partner_manager', 'content_manager'
  ) then
    raise exception 'Unknown staff role: %', p_role;
  end if;

  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No account found for %. Ask the person to sign up first.', p_email;
  end if;

  insert into public.platform_staff (user_id, role, created_by)
  values (v_user, p_role, auth.uid())
  on conflict (user_id, role) do nothing;
end;
$$;

grant execute on function public.staff_grant(text, text) to authenticated;


-- 3. Ids of everyone who belongs to Peak Star Entertainment.
--    The Engineering Users screen uses this to hide them, so the two
--    sites keep separate user lists. Only admins/staff get an answer.
create or replace function public.ent_member_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id
  from public.ent_profiles p
  where public.is_admin()
     or exists (select 1 from public.platform_staff s where s.user_id = auth.uid());
$$;

grant execute on function public.ent_member_ids() to authenticated;


-- Check: should list the three new functions
select proname
from pg_proc
where proname in ('handle_new_ent_user', 'staff_grant', 'ent_member_ids')
order by proname;