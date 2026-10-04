"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { isUserLevel, MOCK_SMS_CODE } from "@/lib/auth/constants";
import {
  clearMockSession,
  createMockSession,
  updateMockLevel,
} from "@/lib/auth/session";
import type { UserLevel } from "@/types/user";

export interface SignInState {
  /** Translation key under the `auth.errors` namespace. */
  error?: "phoneRequired" | "invalidCode";
}

export type SignInResult = SignInState & { ok?: boolean };

/**
 * Validate on digit count rather than raw length: international numbers carry
 * spaces, dashes and parens, and E.164 caps them at 15 digits.
 */
const MIN_DIGITS = 6;
const MAX_DIGITS = 15;

function isValidPhone(raw: string): boolean {
  if (!/^[+\d\s()-]+$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= MIN_DIGITS && digits.length <= MAX_DIGITS;
}

export async function mockSignInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInResult> {
  const phone = String(formData.get("phone") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!isValidPhone(phone)) {
    return { error: "phoneRequired" };
  }

  if (code !== MOCK_SMS_CODE) {
    return { error: "invalidCode" };
  }

  await createMockSession(phone);

  // Fresh members land in onboarding; the level switcher in settings/profile
  // makes it a single tap to jump back out for testing.
  const locale = await getLocale();
  return redirect({ href: "/onboarding/profile", locale });
}

export async function setMockLevelAction(level: UserLevel): Promise<void> {
  if (!isUserLevel(level)) {
    return;
  }

  await updateMockLevel(level);
}

export async function mockSignOutAction(): Promise<void> {
  await clearMockSession();

  const locale = await getLocale();
  return redirect({ href: "/", locale });
}
