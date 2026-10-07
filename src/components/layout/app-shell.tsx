import type { ReactNode } from "react";

import { AppFrame, BOTTOM_NAV_CLEARANCE } from "./app-frame";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./side-nav";

type Surface = "light" | "dark";

interface AppShellProps {
  children: ReactNode;
  /** Shows the B2C navigation: tab bar on mobile, side rail on desktop. */
  tabbed?: boolean;
  surface?: Surface;
  badges?: Record<string, number>;
}

/**
 * Root chrome for every route.
 *
 * The navigation is handed to AppFrame as `footer` / `sidebar`, i.e. both
 * live outside the scroll container — that is what keeps the tab bar
 * anchored to the bottom edge instead of drifting up behind short content.
 */
export function AppShell({
  children,
  tabbed = false,
  surface = "light",
  badges,
}: AppShellProps) {
  return (
    <AppFrame
      surface={surface}
      scrollClassName={tabbed ? BOTTOM_NAV_CLEARANCE : undefined}
      sidebar={tabbed ? <SideNav badges={badges} /> : null}
      footer={tabbed ? <BottomNav badges={badges} /> : null}
    >
      {children}
    </AppFrame>
  );
}

export type { Surface };
