import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_SIGN_IN_LEVEL,
  isUserLevel,
  MOCK_SAMPLE_PHONE,
  type MockSession,
} from "@/lib/auth/constants";
import type { UserLevel } from "@/types/user";

/**
 * Local-only auth emulation.
 *
 * There is no backend yet: "sign in" means storing a small JSON session in a
 * cookie so the tier logic and route guards have something realistic to read.
 * Replace this module with real session handling once the API exists.
 */

export const SESSION_COOKIE = "loono_mock_session";

function parse(raw: string | undefined): MockSession | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as MockSession).phone === "string" &&
      isUserLevel((parsed as MockSession).level)
    ) {
      return parsed as MockSession;
    }
  } catch {
    // Corrupted cookie: treat as signed out rather than crashing the render.
  }

  return null;
}

/** Current mock session, or null when signed out. */
export async function getMockSession(): Promise<MockSession | null> {
  const store = await cookies();
  return parse(store.get(SESSION_COOKIE)?.value);
}

async function write(session: MockSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function createMockSession(
  phone: string,
  level: UserLevel = DEFAULT_SIGN_IN_LEVEL,
): Promise<MockSession> {
  const session: MockSession = {
    phone,
    level,
    createdAt: new Date().toISOString(),
  };

  await write(session);
  return session;
}

/** Used by the one-tap level switcher to re-test profile visibility. */
export async function updateMockLevel(level: UserLevel): Promise<void> {
  const current = await getMockSession();

  if (!current) {
    // Switching level without a session implies signing in as that tier.
    await createMockSession(MOCK_SAMPLE_PHONE, level);
    return;
  }

  await write({ ...current, level });
}

export async function clearMockSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
