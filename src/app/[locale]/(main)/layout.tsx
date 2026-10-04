import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Signed-in shell. The route group keeps the public URLs identical while
 * sharing the bottom tab bar across every authenticated screen.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell tabbed badges={{ "/chats": 2 }}>
      {children}
    </AppShell>
  );
}
