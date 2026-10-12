-- LOONO — scope a thread slug to the member who opened it.
--
-- Run after 0001 and 0002, in the Supabase SQL editor or via
-- `supabase db push`. Idempotent.
--
-- The bug
-- -------
-- 0001 made `chats.slug` globally unique. That is wrong, because a slug is not
-- a conversation identity — it is viewer-relative. `c_01` means "Mei ↔ whoever
-- is currently looking", so two different members opening `/chats/c_01` are
-- looking at two different conversations that happen to share a name.
--
-- With a global unique index the first of them wins the slug for the whole
-- platform and everyone else collides:
--
--   duplicate key value violates unique constraint "chats_slug_key"
--
-- An upsert does not rescue this. The duplicate row belongs to a *different*
-- member, so the `chats are visible to their members` RLS policy filters it out
-- of the retry lookup and the insert still fails.
--
-- The fix
-- -------
-- Move uniqueness from the slug alone to (slug, owner_id). Each member gets
-- their own `c_01`, which is what the mock data always meant. Once real users
-- exist on both sides, the natural key becomes the canonical participant pair
-- (see the note at the bottom).

alter table public.chats
  add column if not exists owner_id uuid references public.profiles (id) on delete cascade;

-- Existing rows predate the column; attribute each to its first member so no
-- thread becomes orphaned (and so the new index cannot collide below).
update public.chats
   set owner_id = member_ids[1]
 where owner_id is null;

alter table public.chats
  drop constraint if exists chats_slug_key;

create unique index if not exists chats_slug_owner_key
  on public.chats (slug, owner_id);

-- Backfill can only be complete for rows that have at least one member. A row
-- with an empty `member_ids` would be invisible under the RLS policies anyway;
-- these exist to be cleaned up rather than to be served.
delete from public.chats
 where owner_id is null;

/* ─────────────────────────── policy tightening ───────────────────────────── */

/*
  Creating a conversation now also asserts that you are the one who opened it.
  Without this a caller could stamp somebody else's profile into `owner_id`,
  which is not a privilege escalation today but is attribution data, and
  attribution that a member can write onto another member is not worth having.
*/
drop policy if exists "chats can be opened by their members" on public.chats;

create policy "chats can be opened by their members"
  on public.chats for insert
  to authenticated
  with check (
    owner_id = (
      select p.id from public.profiles p where p.auth_user_id = auth.uid()
    )
    and exists (
      select 1 from public.profiles p
       where p.id = any (member_ids)
         and p.auth_user_id = auth.uid()
    )
  );

/*
  Next step, once both participants have profiles: replace the (slug, owner)
  key with a canonical pair key — sort the two member ids, hash them, make that
  unique — and resolve a conversation by the pair rather than by whoever
  happened to open it. Until then the peer has no `profiles` row, so a pair key
  has nothing to pair.
*/