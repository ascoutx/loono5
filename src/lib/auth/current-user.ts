import "server-only";

import { TRIAL_DAYS } from "@/lib/auth/constants";
import { getMockSession } from "@/lib/auth/session";
import { currentUser } from "@/lib/mock-data";
import type { PublicUser, UserLevel } from "@/types/user";

/**
 * Tier shown when browsing without signing in. Keeps the demo usable while
 * still exercising the blur path (L3 profiles stay locked).
 */
export const DEFAULT_DEMO_LEVEL: UserLevel = 2;

function withLevel(user: PublicUser, level: UserLevel): PublicUser {
  const startedAt = new Date();
  const expiresAt = new Date(startedAt);
  expiresAt.setDate(expiresAt.getDate() + TRIAL_DAYS);

  return {
    ...user,
    level,
    subscription: {
      ...user.subscription,
      status: "active",
      level,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isTrial: false,
      scheduledLevel: null,
    },
  };
}

/**
 * The signed-in member, with the tier taken from the mock session so the
 * one-tap level switcher immediately changes what is visible.
 */
export async function getCurrentUser(): Promise<PublicUser> {
  const session = await getMockSession();
  return withLevel(currentUser, session?.level ?? DEFAULT_DEMO_LEVEL);
}

/** null when signed out. */
export async function getCurrentLevel(): Promise<UserLevel | null> {
  const session = await getMockSession();
  return session?.level ?? null;
}

export async function isSignedIn(): Promise<boolean> {
  return (await getMockSession()) !== null;
}
