-- LOONO — per-member chat visibility, blocks and reports.
--
-- Run after 0004, in the Supabase SQL editor or via `supabase db push`.
-- Idempotent.
--
-- Why these reference `profiles(id)` and not `auth.users(id)`
-- ------------------------------------------------------
-- The spec for this feature asked for `auth.users(id)`. That cannot work here
-- yet, and the reason is structural rather than stylistic:
--
--   1. Every other relationship in this schema already hangs off `profiles.id`
--      — `chats.owner_id`, `messages.sender_id`, `profiles.referred_by`. A
--      second identity running through the moderation tables would mean
--      translating between them on every query.
--   2. The people these tables are *about* — Mei, Sofia, everyone in the
--      catalogue — have no `auth.users` row at all. They are reference data
--      created by `seed.sql`, never logins. A foreign key to `auth.users` would
--      make "block this person in the chat header" impossible to satisfy for
--      exactly the people the button appears on.
--
-- `profiles.auth_user_id` is the login link and stays nullable; moderation
-- keys off the profile, which always exists. When real phone auth replaces
-- anonymous sign-in, `auth_user_id` is what the JWT resolves through — the
-- moderation tables do not change.
--
-- A useful side effect: a person can hold a profile without a login, which is
-- what "a member you blocked" is.

/* ────────────────────────── identity helper ──────────────────────────────── */

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.profiles p where p.auth_user_id = auth.uid();
$$;

/*
  `security definer` matters here: this function is called from inside RLS
  policies, including ones on `profiles` itself. Without it, resolving "who am
  I" would re-enter the `profiles` policy and recurse. Being stable as well, the
  planner evaluates it once per statement rather than once per row.
*/

/* ───────────────────────────── chat_visibility ───────────────────────────── */

/*
  Soft delete, scoped to one member. A row here means "this member chose to
  remove this conversation from their list" — nothing is destroyed, and either
  side can still open the thread by URL.
*/
create table if not exists public.chat_visibility (
  chat_id   uuid not null references public.chats (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

-- The list filters by "my hidden chats", which is a lookup on user_id alone.
create index if not exists chat_visibility_user_idx
  on public.chat_visibility (user_id);

/* ─────────────────────────────── user_blocks ─────────────────────────────── */

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  -- Self-blocking would silently hide a member from their own feed.
  check (blocker_id <> blocked_id)
);

/* ─────────────────────────────── user_reports ────────────────────────────── */

/*
  Reasons are a closed set rather than free text: moderation has to be able to
  bucket these, and a `check` constraint keeps junk out without a second table.
  `other` is the escape hatch, and `details` is where the story goes.
*/
create table if not exists public.user_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (
                reason in ('spam', 'harassment', 'inappropriate_content', 'other')
              ),
  details     text check (details is null or length(details) <= 2000),
  created_at  timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

-- Moderation queues are read by date and by subject, never by reporter.
create index if not exists user_reports_created_idx
  on public.user_reports (created_at desc);
create index if not exists user_reports_reported_idx
  on public.user_reports (reported_id);

/* ──────────────────────────── row level security ──────────────────────────── */

alter table public.chat_visibility enable row level security;
alter table public.user_blocks     enable row level security;
alter table public.user_reports    enable row level security;

grant select, insert, delete on public.chat_visibility to authenticated;
grant select, insert, delete on public.user_blocks to authenticated;
grant select, insert on public.user_reports to authenticated;

/*
  Hiding is strictly personal. `chat_visibility.user_id = current_profile_id()`
  means one member can never remove a thread from someone else's list.
*/
drop policy if exists "chat visibility is personal" on public.chat_visibility;
create policy "chat visibility is personal"
  on public.chat_visibility for select
  to authenticated
  using (user_id = public.current_profile_id());

drop policy if exists "chat visibility is hideable" on public.chat_visibility;
create policy "chat visibility is hideable"
  on public.chat_visibility for insert
  to authenticated
  with check (user_id = public.current_profile_id());

drop policy if exists "chat visibility is restorable" on public.chat_visibility;
create policy "chat visibility is restorable"
  on public.chat_visibility for delete
  to authenticated
  using (user_id = public.current_profile_id());

/*
  A block is the blocker's private fact. Nobody is told they were blocked —
  which is the correct behaviour, and it also means a blocked user cannot even
  detect the block by reading the table.
*/
drop policy if exists "blocks are readable by the blocker" on public.user_blocks;
create policy "blocks are readable by the blocker"
  on public.user_blocks for select
  to authenticated
  using (blocker_id = public.current_profile_id());

drop policy if exists "blocks can be created by the blocker" on public.user_blocks;
create policy "blocks can be created by the blocker"
  on public.user_blocks for insert
  to authenticated
  with check (blocker_id = public.current_profile_id());

drop policy if exists "blocks can be lifted by the blocker" on public.user_blocks;
create policy "blocks can be lifted by the blocker"
  on public.user_blocks for delete
  to authenticated
  using (blocker_id = public.current_profile_id());

/*
  A report may be filed by anyone signed in, but only ever under your own name,
  and you can read back only your own. Moderators read these with the service
  role, which bypasses RLS — there is deliberately no moderator policy here, so
  adding one later cannot be forgotten or widened by accident.
*/
drop policy if exists "reports can be filed by the reporter" on public.user_reports;
create policy "reports can be filed by the reporter"
  on public.user_reports for insert
  to authenticated
  with check (reporter_id = public.current_profile_id());

drop policy if exists "reports are readable by the reporter" on public.user_reports;
create policy "reports are readable by the reporter"
  on public.user_reports for select
  to authenticated
  using (reporter_id = public.current_profile_id());

/*
  A block also removes the blocked profile from the directory at the database
  level, so it applies to every read rather than only to whichever screen
  remembered to filter. The feed is served from mock data today and so does not
  consult this yet; the policy is here so that when it moves to Supabase the
  behaviour is already right.
*/
drop policy if exists "profiles are readable by signed-in users" on public.profiles;
create policy "profiles are readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (
    not exists (
      select 1
        from public.user_blocks b
       where b.blocked_id = profiles.id
         and b.blocker_id = public.current_profile_id()
    )
  );

/* ─────────────────────────────── triggers ────────────────────────────────── */

/*
  A new message in a hidden conversation brings it back.

  Runs after insert and is unconditional on who sent it, which is the behaviour
  asked for: if the other party writes, a conversation you had removed is
  relevant again. Deleting the row rather than adding a "restored" flag keeps
  the table a single, honest statement of what is currently hidden.
*/
create or replace function public.restore_hidden_chats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.chat_visibility where chat_id = new.chat_id;

  return new;
end;
$$;

drop trigger if exists messages_restore_visibility on public.messages;

create trigger messages_restore_visibility
  after insert on public.messages
  for each row
  execute function public.restore_hidden_chats();

/*
  Blocks are enforced on the write path, not just in the UI.

  Before insert, so the message is never written and the error surfaces to the
  sender rather than leaving an orphan row behind a failed trigger. Checked in
  both directions: blocking is mutual in effect — the person who blocked cannot
  reach you either — which is what members expect even though only one row
  exists.

  The target is the thread owner, which is the member on the other side of a
  two-person conversation.
*/
create or replace function public.assert_not_blocked()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
begin
  select c.owner_id into recipient from public.chats c where c.id = new.chat_id;

  if recipient is null then
    return new;
  end if;

  if exists (
    select 1
      from public.user_blocks b
     where (b.blocker_id = new.sender_id and b.blocked_id = recipient)
        or (b.blocker_id = recipient and b.blocked_id = new.sender_id)
  ) then
    raise exception 'cannot send: this conversation is blocked'
      using errcode = '42501',
            hint = 'sender and recipient have blocked each other';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_assert_not_blocked on public.messages;

create trigger messages_assert_not_blocked
  before insert on public.messages
  for each row
  execute function public.assert_not_blocked();