-- =====================================================================
-- Peak Star Entertainment: social media links on the profile
-- Run AFTER 01 to 04, 06, 07 and 08, in the Supabase SQL Editor tab
-- "entertainment_schema". Safe to run more than once.
--
-- Adds ent_profiles.socials: one small record per person, for example
--   {"instagram": "https://instagram.com/aline", "youtube": "https://..."}
-- The person edits it on their own profile (the existing "update my own
-- profile" rule already allows that).
-- =====================================================================

alter table public.ent_profiles
  add column if not exists socials jsonb not null default '{}'::jsonb;

-- Check: should return one row
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'ent_profiles' and column_name = 'socials';