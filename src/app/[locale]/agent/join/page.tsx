import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

/**
 * Legacy path. The consumer site no longer advertises an "agent / referral"
 * programme at all — the only outward-facing door is the Partners application
 * form. Kept as a redirect so existing links and printed QR codes still land
 * somewhere sensible instead of 404-ing.
 */
export default async function AgentJoinRedirect() {
  const locale = await getLocale();
  redirect({ href: "/partners/apply", locale });
}
