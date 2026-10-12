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


-- ── Members ────────────────────────────────────────────────────────────────
--
-- The catalogue (Mei, Sofia, and everyone in the feed) is mock data, but
-- blocking and reporting need a `profiles` row to act on: both tables key off
-- `profiles.id`, and a catalogue entry has no identity in the database.
--
-- These rows exist for that reason alone. Their `handle` deliberately matches
-- the mock ids (`u_01`, `u_02`, …) so `resolveProfileIdByHandle()` can line a
-- catalogue entry up with a profile. `auth_user_id` stays null — these are
-- reference data, not logins, and the RLS insert policy would refuse them if
-- they were not created here as the table owner.

insert into public.profiles (handle, display_name, avatar_url, level)
values
  ('u_01', 'Mei',    'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 1),
  ('u_02', 'Sofia',  'https://images.unsplash.com/photo-1517841905240-472988babdf9', 2),
  ('u_03', 'Ines',   'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 1),
  ('u_04', 'Amara',  'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 3),
  ('u_05', 'Noor',   'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f', 1),
  ('u_06', 'Yuki',   'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91', 2)
on conflict (handle) do update
   set display_name = excluded.display_name,
       avatar_url   = excluded.avatar_url;

-- `auth_user_id` is deliberately not touched by the update above: the
-- immutability trigger on `ref_code` does not cover it, but re-asserting a
-- login from a seed script would be a good way to break a real member's row.