import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

/**
 * The B2B cabinet moved to /partner so it is no longer reachable from the B2C
 * tab bar. Kept as a redirect so existing links still resolve.
 */
export default async function AgentDashboardRedirect() {
  const locale = await getLocale();
  redirect({ href: "/partner", locale });
}
