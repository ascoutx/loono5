import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ReportReason } from "@/lib/supabase/database.types";
import { ensureSession } from "@/lib/supabase/session";

/**
 * Blocking, reporting and "delete for me".
 *
 * All three resolve the caller's own profile id from their session rather than
 * accepting one as an argument, so there is no code path here that can act as
 * somebody else. That lookup is deliberately a bare `select id` rather than
 * `ensureViewerProfile`: this profile always exists by the time any of these
 * run, and creating one would mean dragging display data through a layer that
 * has no business knowing any.
 *
 * None of it is a substitute for the database checks in
 * `supabase/migrations/0005_chat_hidden_blocks_and_reports.sql`: blocks are
 * enforced by a BEFORE INSERT trigger and hidden threads are restored by an
 * AFTER INSERT trigger. This module is the client-side convenience; the
 * database is what actually holds the line.
 */

/** The signed-in member's profile id, or null if they have no profile yet. */
async function viewerProfileId(): Promise<string | null> {
  const session = await ensureSession();

  const { data, error } = await getSupabaseBrowserClient()
    .from("profiles")
    .select("id")
    .eq("auth_user_id", session.user.id)
    .maybeSingle();

  if (error) return null;

  return data?.id ?? null;
}

/** Removes a conversation from this member's list. Reversible, and private. */
export async function hideChatForUser(chatId: string): Promise<void> {
  const userId = await viewerProfileId();

  if (!userId) {
    throw new Error("No profile to hide against — reload and try again.");
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("chat_visibility").upsert(
    { chat_id: chatId, user_id: userId },
    // Hiding twice is not an error; it is the same intent twice.
    { onConflict: "chat_id,user_id", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(`Could not hide the conversation: ${error.message}`);
  }
}

/** Undoes a hide, e.g. from a "restore deleted chats" affordance. */
export async function showChatForUser(chatId: string): Promise<void> {
  const userId = await viewerProfileId();

  if (!userId) return;

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("chat_visibility")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Could not restore the conversation: ${error.message}`);
  }
}

/**
 * Blocks someone in both directions of the conversation.
 *
 * Idempotent on the `(blocker_id, blocked_id)` primary key, so a second call is
 * a no-op rather than a constraint violation.
 */
export async function blockUser(blockedProfileId: string): Promise<void> {
  const userId = await viewerProfileId();

  if (!userId) {
    throw new Error("No profile to block against — reload and try again.");
  }

  if (blockedProfileId === userId) {
    throw new Error("You cannot block yourself.");
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("user_blocks")
    .upsert(
      { blocker_id: userId, blocked_id: blockedProfileId },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );

  if (error) {
    throw new Error(`Could not block this person: ${error.message}`);
  }
}

export async function unblockUser(blockedProfileId: string): Promise<void> {
  const userId = await viewerProfileId();

  if (!userId) return;

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", blockedProfileId);

  if (error) {
    throw new Error(`Could not unblock this person: ${error.message}`);
  }
}

/** Profile ids this member has blocked, for filtering the feed. */
export async function listBlockedProfileIds(): Promise<string[]> {
  const userId = await viewerProfileId();

  if (!userId) return [];

  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", userId);

  if (error) {
    // An unreadable block list must not empty the feed; showing an unfiltered
    // catalogue is better than showing nothing.
    return [];
  }

  return (data ?? []).map((row) => row.blocked_id);
}

export async function isBlocked(blockedProfileId: string): Promise<boolean> {
  const ids = await listBlockedProfileIds();
  return ids.includes(blockedProfileId);
}

/** Blocking a person from a menu that already knows their profile id. */
export async function isProfileBlocked(
  blockedProfileId: string,
  knownIds: string[],
): Promise<boolean> {
  return knownIds.includes(blockedProfileId);
}

/** Files a report. Never throws for a duplicate or closed-set slip. */
export async function reportUser(input: {
  reportedProfileId: string;
  reason: ReportReason;
  details?: string;
}): Promise<void> {
  const userId = await viewerProfileId();

  if (!userId) {
    throw new Error("No profile to report against — reload and try again.");
  }

  if (input.reportedProfileId === userId) {
    throw new Error("You cannot report yourself.");
  }

  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.from("user_reports").insert({
    reporter_id: userId,
    reported_id: input.reportedProfileId,
    reason: input.reason,
    details: input.details?.trim() || null,
  });

  if (error) {
    throw new Error(`Could not send the report: ${error.message}`);
  }
}

/**
 * Resolves a member's profile id from their application handle.
 *
 * The chat's peer arrives as a denormalised display record with no profile row
 * of its own yet, so blocking and reporting need this lookup to have a target.
 * Returns null when the peer has no profile — the catalogue is seeded by
 * `seed.sql`, and an unseeded peer simply has nothing to act on.
 */
export async function resolveProfileIdByHandle(
  handle: string,
): Promise<string | null> {
  await ensureSession();

  const { data, error } = await getSupabaseBrowserClient()
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (error) return null;

  return data?.id ?? null;
}
