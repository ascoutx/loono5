import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { clearRefCookie, readRefCookie } from "@/lib/referral";
import { ensureSession } from "@/lib/supabase/session";

/**
 * The member's own profile row, and the referral attribution that rides along
 * with it.
 *
 * `ensureViewerProfile` is the one place a `profiles` row is created, so it is
 * also the one place `referred_by` is ever written. Keeping it here means the
 * two cannot drift apart: there is no other code path that creates a profile,
 * so no way to accidentally skip attribution.
 */

export interface ViewerProfileInput {
  displayName: string;
  avatarUrl: string | null;
  level: number;
}

/**
 * Returns the caller's profile, creating it on first use.
 *
 * Idempotent by construction: an existing row short-circuits, which is what
 * makes attribution first-touch for free — once `referred_by` is set it is
 * never reconsidered, no matter which links the member clicks afterwards.
 */
export async function ensureViewerProfile(
  input: ViewerProfileInput,
): Promise<ProfileRow> {
  const session = await ensureSession();
  const supabase = getSupabaseBrowserClient();
  const authUserId = session.user.id;

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Could not load your profile: ${lookupError.message}`);
  }

  if (existing) {
    return existing;
  }

  // Resolve the captured code to a profile *before* inserting, so the new row
  // is written complete. An unrecognised code is not an error: plenty of
  // links in the wild are dead, and refusing to sign someone up over a stale
  // one would be the wrong trade.
  const referredBy = await resolveReferrer();

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: authUserId,
      handle: `u_${authUserId.replace(/-/g, "").slice(0, 12)}`,
      display_name: input.displayName,
      avatar_url: input.avatarUrl,
      level: input.level,
      // Null when there was no link, or none that matched a profile.
      referred_by: referredBy,
    })
    .select("*")
    .single();

  if (insertError) {
    // A second tab can win the race between the lookup and the insert. That is
    // expected, not a failure — re-read and carry on.
    const { data: raced } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (raced) {
      return raced;
    }

    throw new Error(`Could not create your profile: ${insertError.message}`);
  }

  // Spent. Clearing last means a failed insert leaves the code in place to be
  // retried rather than burning it on an attempt that never landed.
  clearRefCookie();

  return created;
}

/**
 * The profile id the captured `?ref=` code points at, or null.
 *
 * Returns null — never throws — because attribution is a side effect of
 * signing up, not a precondition for it. A lookup failure must not be able to
 * stop a member from registering.
 */
async function resolveReferrer(): Promise<string | null> {
  const refCode = readRefCookie();

  if (!refCode) {
    return null;
  }

  try {
    const { data, error } = await getSupabaseBrowserClient()
      .from("profiles")
      .select("id")
      .eq("ref_code", refCode)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data?.id ?? null;
  } catch {
    return null;
  }
}
