-- LOONO — read state and conversation-list projections.
--
-- Run after 0003, in the Supabase SQL editor or via `supabase db push`.
-- Idempotent.
--
-- The two symptoms this fixes both came from the same place: the conversation
-- list was rendered from a module-level mock while the thread screen was
-- writing to Supabase. Nothing was reading back what was written.
--
-- So the list is served from `chats`, and the values it shows are maintained by
-- triggers rather than by the client:
--
--   last_message_text   preview line — set on message insert
--   unread_count        red badge    — incremented on insert from the peer,
--                                     recomputed when messages are marked read
--   messages.is_read    per-message   — the source of truth for the count

/* ────────────────────────────── new columns ──────────────────────────────── */

alter table public.messages
  add column if not exists is_read boolean not null default false;

alter table public.chats
  add column if not exists last_message_text text;

alter table public.chats
  add column if not exists unread_count integer not null default 0;

/*
  Counting unread is the only per-chat query the list makes, and it always
  filters on `is_read = false`. A partial index keeps that cheap and small
  regardless of how much history accumulates.
*/
create index if not exists messages_unread_idx
  on public.messages (chat_id)
  where is_read = false;

/*
  Backfill rows written before this migration. Both counters and the preview
  are derived from the messages that are already there.

  Every pre-existing message defaults to unread, because nothing in the old
  code ever marked anything read. That is the honest reading of the data —
  those conversations genuinely were never opened — but it does mean the first
  load after this migration shows real badge numbers rather than none. Open the
  thread once and each one clears.
*/
update public.chats c
   set last_message_text = (
         select m.body
           from public.messages m
          where m.chat_id = c.id
          order by m.created_at desc
          limit 1
       ),
       unread_count = (
         select count(*)
           from public.messages m
          where m.chat_id = c.id
            and m.is_read = false
       )
 where exists (
         select 1 from public.messages m where m.chat_id = c.id
       );

/* ──────────────────── preview + badge on insert ─────────────────────────── */

/*
  Replaces the 0001 version, which only maintained `last_message_at`.

  The badge is incremented only for messages the member did not send
  themselves. Today `owner_id` is the member the thread belongs to, so
  `sender_id = owner_id` is exactly "this is my own message". Once both
  participants have profiles this should become a per-member counter rather
  than one number on the chat — see the note at the bottom.
*/
create or replace function public.touch_chat_on_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chats
     set last_message_at  = new.created_at,
         last_message_text = new.body,
         unread_count      = case
           when new.sender_id = owner_id then unread_count
           else unread_count + 1
         end
   where id = new.chat_id;

  return new;
end;
$$;

drop trigger if exists messages_touch_chat on public.messages;

create trigger messages_touch_chat
  after insert on public.messages
  for each row
  execute function public.touch_chat_on_message();

/* ──────────────────────────── badge on read ──────────────────────────────── */

/*
  Marking a thread read flips every message in it in one statement, so the
  counter is recomputed once per statement rather than decremented per row —
  both cheaper and impossible to drift out of sync with the rows.

  This is a statement-level trigger over a transition table, which is what lets
  "mark 200 messages read" cost one recount instead of 200.
*/
create or replace function public.refresh_chat_unread_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chats c
     set unread_count = (
           select count(*)
             from public.messages m
            where m.chat_id = c.id
              and m.is_read = false
         )
   where c.id in (select distinct chat_id from updated_rows);

  return null;
end;
$$;

drop trigger if exists messages_refresh_unread on public.messages;

create trigger messages_refresh_unread
  after update on public.messages
  referencing new table as updated_rows
  for each statement
  execute function public.refresh_chat_unread_counts();

/* ────────────────────────── permissions ─────────────────────────────────── */

/*
  Members may mark their own conversations read — and nothing else.

  The column-level grant is doing real work here. An ordinary RLS UPDATE
  policy can decide *which rows* you may touch but not *which columns*, so
  without this a member could rewrite the body of a message somebody else sent.
  Granting `update (is_read)` alone means a tampered payload naming `body` is
  rejected by Postgres before RLS is ever consulted.

  The translation worker is unaffected: it uses the service role, which bypasses
  both grants and policies.
*/
drop policy if exists "messages can be marked read by chat members" on public.messages;

create policy "messages can be marked read by chat members"
  on public.messages for update
  to authenticated
  using (public.is_chat_member(chat_id))
  with check (public.is_chat_member(chat_id));

revoke update on public.messages from authenticated;
grant update (is_read) on public.messages to authenticated;

/* ─────────────────────────────── realtime ───────────────────────────────── */

/*
  Both surfaces of this fix are delivered by the same subscription: both
  `last_message_text` and `unread_count` live on `chats`, and both are written
  by the triggers above. So the list subscribes to `chats` once and refetches
  when either changes — no client-side bookkeeping of previews or counters.
*/
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'chats'
  ) then
    execute 'alter publication supabase_realtime add table public.chats';
  end if;
exception
  when undefined_object then
    null;
  when duplicate_object then
    null;
end;
$$;

/*
  Next step, once both participants have profiles: replace the single
  `unread_count` with a per-member table (`chat_members(chat_id, profile_id,
  last_read_at)`). A counter on the chat can only ever describe one reader, and
  a two-sided conversation has two. The insert trigger would then increment for
  every member except the sender.
*/