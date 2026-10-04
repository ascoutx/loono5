import type { ReactNode } from "react";

import { BottomNav } from "./bottom-nav";
import { MobileFrame } from "./mobile-frame";

/**
 * Root chrome for every route: the H5 frame plus, for signed-in areas,
 * the bottom tab bar.
 */
export function AppShell({
  children,
  tabbed = false,
  showChrome = true,
  badges,
}: {
  children: ReactNode;
  tabbed?: boolean;
  /** Fake iOS status bar shown in the desktop device preview. */
  showChrome?: boolean;
  badges?: Partial<Record<string, number>>;
}) {
  return (
    <MobileFrame showChrome={showChrome}>
      {children}
      {tabbed ? <BottomNav badges={badges} /> : null}
    </MobileFrame>
  );
}
