import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatRow, MessageRow } from "@/lib/supabase/database.types";
import type { Message } from "@/types/chat";

/**
 * Chat persistence against Supabase.
 *
 * Everything here runs in the browser: the anon key is public, and RLS (see
 * `supabase/migrations/0001_chat_core.sql`) is what actually decides which
 * rows a caller may touch. That is why the chat screens are client components
 * — they hold their own message list rather than rendering one that a server
 * component read from a module-level mock.
 *
 * Rows are surfaced in the app's own `Message` shape so the existing presentational
 * components (`MessageBubble`) keep working unchanged.
 */

/** Everything the app needs to describe the other side of a conversation. */
export interface PeerDisplay {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  isOnline: boolean;
}

const SELECT_COLUMNS =
  "id, chat_id, sender_id, body, original_locale, translated_body, translated_locale, is_translating, is_read, created_at";

/**
 * Resolves the chat row for a thread slug, creating it on first open.
 *
 * A slug is viewer-relative, not a conversation identity: `c_01` means "Mei ↔
 * whoever is currently looking". So the lookup and the write are both scoped to
 * `owner_id` — two members opening the same slug get their own conversation,
 * and the unique key is `(slug, owner_id)` rather than `slug` alone. See
 * `supabase/migrations/0003_chat_owner.sql`.
 *
 * Ordering matters. The SELECT is a fast path that keeps the common case (chat
 * already exists) from writing a row on every open; the upsert is what makes
 * the cold path correct, because it collapses "create, and if someone else
 * created it first take theirs" into one atomic statement. A separate
 * try-SELECT-then-INSERT would still lose the race between the two calls.
 */
export async function ensureChatThread(input: {
  slug: string;
  viewerProfileId: string;
  peer: PeerDisplay;
}): Promise<ChatRow> {
  const supabase = getSupabaseBrowserClient();

  const { data: existing, error: lookupError } = await supabase
    .from("chats")
    .select("*")
    .eq("slug", input.slug)
    .eq("owner_id", input.viewerProfileId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not load the conversation: ${lookupError.message}`);
  }

  if (existing) {
    return existing;
  }

  /*
    `onConflict` turns a duplicate into an update, so this returns the winning
    row whether this call created it or found it already there. Peer display
    fields are refreshed on the way, which is what keeps a stale avatar or name
    from surviving in the conversation list.

    The peer has no `profiles` row yet — they have not signed up — so the
    viewer is the only member, and the peer rides along as display columns.
  */
  const { data: chat, error: upsertError } = await supabase
    .from("chats")
    .upsert(
      {
        slug: input.slug,
        owner_id: input.viewerProfileId,
        member_ids: [input.viewerProfileId],
        peer_name: input.peer.name,
        peer_avatar_url: input.peer.avatarUrl,
        peer_level: input.peer.level,
        peer_is_online: input.peer.isOnline,
      },
      { onConflict: "slug,owner_id" },
    )
    .select("*")
    .single();

  if (upsertError) {
    throw new Error(`Could not open the conversation: ${upsertError.message}`);
  }

  return chat;
}

/** Loads one conversation's history, oldest first. */
export async function fetchThreadMessages(chatId: string): Promise<Message[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("messages")
    .select(SELECT_COLUMNS)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    throw new Error(`Could not load messages: ${error.message}`);
  }

  return (data ?? []).map(toMessage);
}

/**
 * The conversation list, newest activity first.
 *
 * Served from `chats` rather than from a mock, and the values it renders —
 * preview text, timestamp, unread badge — are columns that database triggers
 * maintain on every message write. That is what keeps the list and the open
 * thread from disagreeing: there is one source of truth and the client never
 * recomputes any of it.
 *
 * RLS already narrows this to the caller's own threads, so the `owner_id`
 * filter is an index hint rather than the thing making it private.
 */
export async function listChats(viewerProfileId: string): Promise<ChatRow[]> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("owner_id", viewerProfileId)
    // Threads with no messages yet have a null timestamp and sort last rather
    // than jumping to the top of the list.
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load conversations: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Marks every message in a thread as read.
 *
 * Deliberately fire-and-forget from the caller's point of view: it runs on
 * every open, and a thread that renders its history whether or not this
 * succeeds is better than one that waits on it. The trigger recomputes
 * `unread_count` from `messages.is_read`, so the badge is derived rather than
 * decremented and cannot drift.
 *
 * Only `is_read` is updatable by a member (see migration 0004), so this
 * cannot be used to rewrite somebody else's message.
 */
export async function markThreadRead(chatId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("chat_id", chatId)
    // Without this the statement rewrites every message in the thread, which
    // costs a row lock per message for no benefit.
    .eq("is_read", false);

  if (error) {
    throw new Error(`Could not mark the conversation read: ${error.message}`);
  }
}

/**
 * Notifies when a conversation's projection changes — new preview, cleared
 * badge, online flag.
 *
 * One subscription covers both reported bugs because both are written to the
 * same row: a sent message updates `last_message_text` through the trigger,
 * and opening a thread updates `unread_count` through the other one. The list
 * refetches on either rather than trying to patch its own copy, so what it
 * shows is always what the database says.
 */
export function subscribeToChats(onChange: () => void): () => void {
  const supabase = getSupabaseBrowserClient();

  const channel = supabase
    .channel("chats:list")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chats" },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Appends a message and returns the stored row.
 *
 * The caller is responsible for clearing its input and reconciling its
 * optimistic entry — this returns the persisted row so the two can be swapped
 * without a refetch.
 */
export async function sendMessage(input: {
  chatId: string;
  senderId: string;
  body: string;
  locale: string;
}): Promise<Message> {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: input.chatId,
      sender_id: input.senderId,
      body: input.body,
      original_locale: input.locale,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Message was not sent: ${error.message}`);
  }

  return toMessage(data);
}

/**
 * Pushes messages as they land, so a second window (or the other participant)
 * sees them without a refresh.
 *
 * Falls back to nothing when the table is not in the `supabase_realtime`
 * publication — the caller treats realtime as an enhancement, never a
 * requirement, so an un-subscribed thread simply polls on focus instead.
 */
export function subscribeToMessages(
  chatId: string,
  onMessage: (message: Message) => void,
): () => void {
  const supabase = getSupabaseBrowserClient();

  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        onMessage(toMessage(payload.new as MessageRow));
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/** DB row → the app's `Message`, which the existing bubble already speaks. */
function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    threadId: row.chat_id,
    senderId: row.sender_id,
    originalText: row.body,
    originalLocale: row.original_locale,
    translatedText: row.translated_body ?? undefined,
    translatedLocale: row.translated_locale ?? undefined,
    isTranslating: row.is_translating,
    isRead: row.is_read,
    status: "sent",
    createdAt: row.created_at,
  };
}
