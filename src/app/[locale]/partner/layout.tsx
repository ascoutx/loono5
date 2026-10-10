import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * B2B partner cabinet: cool light data surface, no B2C tab bar.
 *
 * Reached only via partner.loono.com (middleware rewrites the subdomain to
 * /partner) — it is intentionally absent from the consumer bottom nav and is
 * never linked from any B2C page.
 *
 * The shell itself is unguarded so that /partner/login can render inside it;
 * the guard lives in `requirePartnerSession()`, called by every protected
 * page.
 */
export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <AppShell surface="partner">{children}</AppShell>;
}
