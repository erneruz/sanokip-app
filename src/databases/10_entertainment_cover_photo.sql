-- =====================================================================
-- Peak Star Entertainment: cover picture of the profile
-- Run AFTER 01 to 04, 06, 07, 08 and 09, in the Supabase SQL Editor tab
-- "entertainment_schema". Safe to run more than once.
--
-- Adds ent_profiles.cover_url (the address of the cover picture).
-- The pictures are stored in the same bucket as the profile photos
-- ("ent-avatars", created by script 08), in the person's own folder,
-- so no new storage rules are needed.
-- =====================================================================

alter table public.ent_profiles
  add column if not exists cover_url text;

-- Check: should return one row
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'ent_profiles' and column_name = 'cover_url';