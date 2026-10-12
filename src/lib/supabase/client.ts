import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Browser-side Supabase client.
 *
 * The project URL and anon key are both `NEXT_PUBLIC_*`, so they are inlined
 * into the bundle and therefore public. That is the intended arrangement —
 * access is controlled entirely by the RLS policies in
 * `supabase/migrations/0001_chat_core.sql`, not by hiding the key. Never add
 * the service-role key to a `NEXT_PUBLIC_` variable.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    // Throwing here beats handing Supabase `undefined`, which fails much
    // later with an opaque "Invalid API key" from inside the client.
    throw new Error(
      `Missing ${name}. Add it to .env.local — see README for the Supabase setup.`,
    );
  }

  return value;
}

/**
 * One client per browser context.
 *
 * `createClient` stashes its state on `globalThis` internally, so a module-
 * level singleton is enough — but the memo keeps the *auth session* in sync:
 * two clients would each hold their own token and race on refresh.
 */
let client: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  // These two must be read as static `process.env.NEXT_PUBLIC_*` member
  // accesses. Next.js rewrites exactly that form when it builds the client
  // bundle; a dynamic lookup like `process.env[name]` is left as-is and
  // resolves to `undefined` in the browser.
  const url = required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
  const anonKey = required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );

  client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return client;
}

export type { Database };
