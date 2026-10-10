import "server-only";

import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

import { PARTNER_SESSION_COOKIE, type PartnerSession } from "./constants";

function parse(raw: string | undefined): PartnerSession | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as PartnerSession).account === "string"
    ) {
      return parsed as PartnerSession;
    }
  } catch {
    // Corrupted cookie: treat as signed out rather than crashing the render.
  }

  return null;
}

/** Current partner session, or null when signed out. */
export async function getPartnerSession(): Promise<PartnerSession | null> {
  const store = await cookies();
  return parse(store.get(PARTNER_SESSION_COOKIE)?.value);
}

async function write(session: PartnerSession): Promise<void> {
  const store = await cookies();
  store.set(PARTNER_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Short-lived on purpose: an operator console should not stay unlocked
    // for a month the way a consumer session does.
    maxAge: 60 * 60 * 8,
  });
}

export async function createPartnerSession(
  account: string,
): Promise<PartnerSession> {
  const session: PartnerSession = {
    account,
    signedInAt: new Date().toISOString(),
  };

  await write(session);
  return session;
}

export async function clearPartnerSession(): Promise<void> {
  const store = await cookies();
  store.delete(PARTNER_SESSION_COOKIE);
}

/**
 * Route guard for every page inside the B2B cabinet.
 *
 * Call it at the top of a server component: it redirects to the sign-in screen
 * when there is no session, and otherwise returns the session so the caller
 * does not have to re-read the cookie.
 */
export async function requirePartnerSession(): Promise<PartnerSession> {
  const session = await getPartnerSession();

  if (!session) {
    const locale = await getLocale();
    // `redirect` is typed `never` — returning it directly lets TypeScript
    // narrow the branch away instead of complaining about `session` possibly
    // being null on the next line.
    return redirect({ href: "/partner/login", locale });
  }

  return session;
}
