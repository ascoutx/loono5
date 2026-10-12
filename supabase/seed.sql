-- LOONO — development seed.
--
-- Optional. Run in the Supabase SQL editor after 0001 and 0002 to make the
-- referral flow demonstrable end to end:
--
--     /auth?ref=ALEX60   → the new profile gets referred_by = the row below
--
-- This runs as the table owner, so it bypasses RLS. That is fine here and
-- nowhere else: the API-level insert policy only ever allows a caller to mint
-- a profile for themselves, with `auth_user_id = auth.uid()`.
--
-- The partner row deliberately has no `auth_user_id` — agencies are seeded
-- identities, not logins. Members who arrive through its code still count as
-- referred, because attribution keys off `ref_code`, not off a login.

insert into public.profiles (handle, display_name, ref_code, level, avatar_url)
values
  ('agency_alex', 'Alex · Partner', 'ALEX60', 3,
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2'),
  ('agency_nordic', 'Nordic Match Group', 'NORDIC60', 2, null),
  ('agency_atlas', 'Atlas Union', 'ATLAS70', 3, null)
on conflict (handle) do update
   set display_name = excluded.display_name,
       ref_code     = excluded.ref_code;

-- `ref_code` is immutable (0002), so re-running this against a project that
-- already has these partners fails the DO UPDATE above rather than silently
-- re-pointing live links. That is the intended behaviour; if you need to
-- reset a dev database, drop the rows first:

-- delete from public.profiles where handle like 'agency\_%';