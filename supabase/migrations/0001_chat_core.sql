-- LOONO — chat core: profiles, chats, messages.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query),
-- or via `supabase db push`. It is idempotent: every statement is
-- `create ... if not exists` / `drop ... if exists`, so re-running it on an
-- existing project is safe.
--
-- Identity model
-- --------------
-- The app signs the browser in anonymously through Supabase Auth, so every
-- request carries a real JWT and `auth.uid()` resolves to a row in
-- `auth.users`. That is what lets RLS scope rows per user — see the policies
-- at the bottom. Do not relax them into `using (true)`: the anon key is
-- compiled into the client bundle and is therefore public, so a permissive
-- policy here would expose every private message to every visitor.
--
-- `profiles.id` is the canonical member identifier used by chats/messages.
-- `auth_user_id` links a profile to its login. Only rows with a login can be
-- created through the API (see the insert policy); a conversation partner who
-- has not signed up yet is carried by the denormalised peer columns on
-- `chats`, so no placeholder profile row is needed for them.

create extension if not exists pgcrypto;

/* ──────────────────────────────── profiles ──────────────────────────────── */

create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete cascade,
  -- Stable application handle, e.g. "u_01". Unique so demo peers can be
  -- upserted idempotently by slug.
  handle        text unique not null,
  display_name  text not null default '',
  avatar_url    text,
  level         smallint not null default 1 check (level between 1 and 3),
  is_online     boolean not null default false,
  phone         text,
  -- Referral attribution. `ref_code` is the agent code that was in the
  -- signup link; `referred_by` is the partner profile it resolved to.
  ref_code      text,
  referred_by   uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.profiles.ref_code is
  'Agent/partner code captured from the ?ref= signup link.';

/* ────────────────────────────────── chats ───────────────────────────────── */

-- One row per conversation. A thread between two people is a single row seen
-- from both sides, so `member_ids` holds both profile ids rather than a
-- `user_a`/`user_b` pair (which would need two rows, or a canonical ordering
-- rule, for what is conceptually one thing).
create table if not exists public.chats (
  id               uuid primary key default gen_random_uuid(),
  -- Preserves the existing `/chats/c_01` URLs while the id stays a uuid.
  slug             text unique not null,
  member_ids       uuid[] not null default '{}',
  peer_id          uuid references public.profiles (id) on delete set null,
  -- Denormalised peer display fields so the conversation list does not need
  -- a join. Safe to keep stale: they are cosmetic.
  peer_name        text,
  peer_avatar_url  text,
  peer_level       smallint,
  peer_is_online   boolean not null default false,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now()
);

-- The list view orders by recency, per member.
create index if not exists chats_member_ids_idx
  on public.chats using gin (member_ids);

-- Phone is how a signing-in member is matched to their existing profile.
create index if not exists profiles_phone_idx on public.profiles (phone);

/* ──────────────────────────────── messages ─────────────────────────────── */

create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  chat_id           uuid not null references public.chats (id) on delete cascade,
  sender_id         uuid not null references public.profiles (id) on delete cascade,
  -- Text as written. Never translated in place: the original stays
  -- inspectable and each reader can be shown their own language (PRD rule 4).
  body              text not null check (length(btrim(body)) between 1 and 4000),
  original_locale   text not null default 'en',
  translated_body   text,
  translated_locale text,
  -- Set by the translation worker; the UI shows a placeholder meanwhile.
  is_translating    boolean not null default false,
  created_at        timestamptz not null default now()
);

-- The thread view reads one conversation in chronological order; this is the
-- index that makes it an index scan rather than a sort.
create index if not exists messages_chat_created_idx
  on public.messages (chat_id, created_at);

/* ──────────────── keep chats.last_message_at in step ───────────────────── */

-- Without this the conversation list would need to aggregate messages on
-- every read, and "sort by recent" would silently break.
create or replace function public.touch_chat_on_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chats
     set last_message_at = new.created_at
   where id = new.chat_id;

  return new;
end;
$$;

drop trigger if exists messages_touch_chat on public.messages;

create trigger messages_touch_chat
  after insert on public.messages
  for each row
  execute function public.touch_chat_on_message();

/* ────────────────────────── row level security ───────────────────────────── */

alter table public.profiles enable row level security;
alter table public.chats    enable row level security;
alter table public.messages enable row level security;

-- Both surfaces are reached with the anon key, so the grants must be
-- explicit rather than relying on Supabase's default privileges.
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.chats to authenticated;
grant select, insert on public.messages to authenticated;

/*
  Membership test used by the chat policies below: "is the caller one of the
  profiles on this chat?" Kept as its own helper so the two policies cannot
  drift apart.
*/
create or replace function public.is_chat_member(target_chat uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.chats c
      join public.profiles p on p.id = any (c.member_ids)
     where c.id = target_chat
       and p.auth_user_id = auth.uid()
  );
$$;

-- Profiles are readable by any signed-in user: they are directory entries
-- (name, avatar, level) that the catalog already exposes.
drop policy if exists "profiles are readable by signed-in users" on public.profiles;
create policy "profiles are readable by signed-in users"
  on public.profiles for select
  to authenticated
  using (true);

-- A user may only ever create a profile for themselves. This is deliberately
-- strict: conversation partners who have not signed up are carried by the
-- denormalised peer columns on `chats`, so there is no legitimate reason to
-- mint a profile row that is not your own.
drop policy if exists "profiles can be created by their owner" on public.profiles;
create policy "profiles can be created by their owner"
  on public.profiles for insert
  to authenticated
  with check (auth_user_id = auth.uid());

-- Editing is likewise limited to the row already linked to the caller's login.
drop policy if exists "profiles are self-service editable" on public.profiles;
create policy "profiles are self-service editable"
  on public.profiles for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- A conversation is visible only to the people on it.
drop policy if exists "chats are visible to their members" on public.chats;
create policy "chats are visible to their members"
  on public.chats for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = any (member_ids)
         and p.auth_user_id = auth.uid()
    )
  );

-- Creating a conversation requires actually being one of its members —
-- otherwise anyone could insert a row and read it back through the select
-- policy above.
drop policy if exists "chats can be opened by their members" on public.chats;
create policy "chats can be opened by their members"
  on public.chats for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
       where p.id = any (member_ids)
         and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "chats are editable by their members" on public.chats;
create policy "chats are editable by their members"
  on public.chats for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = any (member_ids)
         and p.auth_user_id = auth.uid()
    )
  );

-- Messages inherit the chat's visibility: readable by its members.
drop policy if exists "messages are visible to chat members" on public.messages;
create policy "messages are visible to chat members"
  on public.messages for select
  to authenticated
  using (public.is_chat_member(chat_id));

-- A sender may only post as themselves, and only into a chat they are on.
-- Both halves matter: `sender_id` alone would let anyone write into anyone's
-- conversation.
drop policy if exists "messages can be sent by chat members" on public.messages;
create policy "messages can be sent by chat members"
  on public.messages for insert
  to authenticated
  with check (
    public.is_chat_member(chat_id)
    and exists (
      select 1 from public.profiles p
       where p.id = sender_id
         and p.auth_user_id = auth.uid()
    )
  );

/* ─────────────────────────────── realtime ───────────────────────────────── */

-- Pushes new messages into an open thread (PRD rule 4). Harmless if you would
-- rather not have it — the chat client treats realtime as an enhancement and
-- the thread still works without it.
--
-- ALTER PUBLICATION is DDL, so it has to go through EXECUTE inside a DO block.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
exception
  when undefined_object then
    -- No supabase_realtime publication on this project; nothing to add to.
    null;
  when duplicate_object then
    null;
end;
$$;