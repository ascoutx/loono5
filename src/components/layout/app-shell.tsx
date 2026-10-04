import type { ReactNode } from "react";

import { BottomNav } from "./bottom-nav";
import { BOTTOM_NAV_CLEARANCE, MobileFrame } from "./mobile-frame";

type Surface = "light" | "dark";

interface AppShellProps {
  children: ReactNode;
  /** Shows the B2C bottom tab bar and reserves clearance for it. */
  tabbed?: boolean;
  showChrome?: boolean;
  surface?: Surface;
  badges?: Record<string, number>;
}

/**
 * Root chrome for every route.
 *
 * The bottom nav is passed to MobileFrame as `footer`, i.e. it lives outside
 * the scroll container — that is what keeps it anchored to the bottom edge
 * instead of drifting up behind short content.
 */
export function AppShell({
  children,
  tabbed = false,
  showChrome = true,
  surface = "light",
  badges,
}: AppShellProps) {
  return (
    <MobileFrame
      showChrome={showChrome}
      surface={surface}
      scrollClassName={tabbed ? BOTTOM_NAV_CLEARANCE : undefined}
      footer={tabbed ? <BottomNav badges={badges} /> : null}
    >
      {children}
    </MobileFrame>
  );
}

export type { Surface };
