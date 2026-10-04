import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * B2B partner cabinet: dark surface, no B2C tab bar. Reached only via
 * /partner — it is intentionally absent from the consumer bottom nav.
 */
export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <AppShell surface="dark">{children}</AppShell>;
}
