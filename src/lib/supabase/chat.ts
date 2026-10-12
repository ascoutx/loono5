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
  "id, chat_id, sender_id, body, original_locale, translated_body, translated_locale, is_translating, created_at";

/**
 * Resolves the chat row for a thread slug, creating it on first open.
 *
 * The slug is the thread id used by the existing `/chats/[id]` URLs, so the
 * seeded demo conversations keep working while the primary key stays a uuid.
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
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not load the conversation: ${lookupError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("chats")
    .insert({
      slug: input.slug,
      // The partner has no profile row yet — they have not signed up — so the
      // viewer is the only member, and the peer rides along as display columns.
      member_ids: [input.viewerProfileId],
      peer_name: input.peer.name,
      peer_avatar_url: input.peer.avatarUrl,
      peer_level: input.peer.level,
      peer_is_online: input.peer.isOnline,
    })
    .select("*")
    .single();

  if (insertError) {
    // Unique violation on `slug` means another tab created it first.
    const { data: raced } = await supabase
      .from("chats")
      .select("*")
      .eq("slug", input.slug)
      .maybeSingle();

    if (raced) {
      return raced;
    }

    throw new Error(`Could not open the conversation: ${insertError.message}`);
  }

  return created;
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
    status: "sent",
    createdAt: row.created_at,
  };
}
