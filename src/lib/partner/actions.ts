"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

import { MOCK_PARTNER_ACCOUNT, MOCK_PARTNER_PASSWORD } from "./constants";
import { clearPartnerSession, createPartnerSession } from "./session";

export interface PartnerSignInState {
  /** Translation key under the `partner.login.errors` namespace. */
  error?: "accountRequired" | "invalidCredentials";
}

/**
 * Account + password sign-in for the B2B cabinet.
 *
 * Demo only: credentials are compared against the constants in
 * `lib/partner/constants`. When the backend lands this must move server-side
 * for real, with rate limiting and lockout — a partner console holds revenue
 * data, so it is a much juicier target than the consumer app.
 */
export async function partnerSignInAction(
  _prev: PartnerSignInState,
  formData: FormData,
): Promise<PartnerSignInState> {
  const account = String(formData.get("account") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!account) {
    return { error: "accountRequired" };
  }

  if (
    account.toLowerCase() !== MOCK_PARTNER_ACCOUNT ||
    password !== MOCK_PARTNER_PASSWORD
  ) {
    return { error: "invalidCredentials" };
  }

  await createPartnerSession(account);

  const locale = await getLocale();
  return redirect({ href: "/partner", locale });
}

export async function partnerSignOutAction(): Promise<void> {
  await clearPartnerSession();

  const locale = await getLocale();
  return redirect({ href: "/partner/login", locale });
}
