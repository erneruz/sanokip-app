-- =====================================================================
-- Peak Star Entertainment: profile pictures
-- Run AFTER 01 to 04, 06 and 07, in the Supabase SQL Editor tab
-- "entertainment_schema". Safe to run more than once.
--
-- What it does
--  1. Adds the column ent_profiles.avatar_url (the address of the picture).
--  2. Creates the public storage bucket "ent-avatars" (pictures up to 2 MB).
--  3. Each person can add, replace and delete ONLY the pictures inside
--     their own folder (the folder is named with their user id).
--     Everybody can see the pictures (they are shown on profiles).
-- =====================================================================


-- 1. The new column
alter table public.ent_profiles
  add column if not exists avatar_url text;


-- 2. The bucket for profile pictures
insert into storage.buckets (id, name, public)
values ('ent-avatars', 'ent-avatars', true)
on conflict (id) do nothing;

-- size and type limits (skipped quietly if your Supabase version has no such columns)
do $$
begin
  update storage.buckets
     set file_size_limit = 2097152,
         allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
   where id = 'ent-avatars';
exception when others then
  raise notice 'Bucket limits not set: %', sqlerrm;
end;
$$;


-- 3. Who may change what
drop policy if exists ent_avatars_insert on storage.objects;
drop policy if exists ent_avatars_update on storage.objects;
drop policy if exists ent_avatars_delete on storage.objects;

create policy ent_avatars_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'ent-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy ent_avatars_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'ent-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy ent_avatars_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'ent-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- Check: should show the column and the bucket
select 'column' as what, column_name as name
from information_schema.columns
where table_schema = 'public' and table_name = 'ent_profiles' and column_name = 'avatar_url'
union all
select 'bucket', id from storage.buckets where id = 'ent-avatars';