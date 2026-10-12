import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * The browser's Supabase session.
 *
 * Anonymous sign-in is what gives us a JWT, and therefore an `auth.uid()` the
 * RLS policies can match against — without it every insert is rejected as
 * coming from an unauthenticated caller. Enable it once under
 * Supabase → Authentication → Sign In / Providers → Anonymous.
 */
export async function ensureSession(): Promise<Session> {
  const supabase = getSupabaseBrowserClient();

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return data.session;
  }

  const { data: signedIn, error } = await supabase.auth.signInAnonymously();

  if (error || !signedIn.session) {
    // The overwhelmingly common cause is a project setting rather than a bug in
    // this code, so say so explicitly instead of surfacing the raw 422.
    if (error?.code === "anonymous_provider_disabled") {
      throw new Error(
        "Supabase anonymous sign-in is disabled for this project. Enable it under " +
          "Authentication → Sign In / Providers → Anonymous, then reload.",
      );
    }

    throw new Error(
      `Supabase anonymous sign-in failed: ${error?.message ?? "no session returned"}.`,
    );
  }

  return signedIn.session;
}