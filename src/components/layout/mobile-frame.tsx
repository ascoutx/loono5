import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Fixed safe-area tokens so every screen can pad itself consistently.
 * Pair with `viewport-fit=cover` in the root layout metadata.
 */
export const SAFE_AREA = {
  top: "pt-[env(safe-area-inset-top)]",
  bottom: "pb-[env(safe-area-inset-bottom)]",
} as const;

/** Height of the pinned bottom nav, used to clear it inside scroll areas. */
export const BOTTOM_NAV_CLEARANCE =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom))]";

type Surface = "light" | "dark";

interface MobileFrameProps {
  children: ReactNode;
  /**
   * Pinned below the scroll area and outside it, so it can never be pushed
   * up by short content.
   */
  footer?: ReactNode;
  /** Extra classes for the scroll container, e.g. bottom-nav clearance. */
  scrollClassName?: string;
  /** Renders a WeChat-style status bar inside the frame (desktop preview only). */
  showChrome?: boolean;
  /** B2C is light "soft porcelain"; the B2B partner cabinet is dark. */
  surface?: Surface;
}

/**
 * Mobile H5 wrapper (PRD: mobile-first, WeChat browser + mobile web).
 *
 * Geometry, from the outside in:
 *   outer      h-dvh flex            — exactly one viewport tall
 *   device     flex-1 flex-col       — fills the viewport on mobile
 *   main       min-h-0 flex-1        — the ONLY scroll container
 *   footer     shrink-0              — pinned, never scrolled
 *
 * The scroll region is a separate flex item from the footer, which is what
 * keeps the bottom nav anchored to the bottom edge instead of floating after
 * short content.
 *
 * Implemented purely with CSS so there is no viewport JS and no hydration
 * mismatch between server and client.
 */
export function MobileFrame({
  children,
  footer,
  scrollClassName,
  showChrome = true,
  surface = "light",
}: MobileFrameProps) {
  const dark = surface === "dark";

  return (
    <div
      className={cn(
        "flex h-dvh min-h-screen w-full justify-center",
        dark ? "bg-neutral-950" : "bg-neutral-100",
        "md:items-center md:p-6",
      )}
    >
      <div
        className={cn(
          "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
          // Activates the shadcn dark tokens so B2B components theme
          // themselves without every card needing dark: variants.
          dark && "dark",
          // Real device: fill the screen.
          "h-dvh",
          // Desktop preview: fixed phone viewport with a device bezel.
          "md:h-[min(844px,calc(100dvh-3rem))] md:w-[390px] md:flex-none",
          "md:rounded-[2.25rem] md:border-[10px] md:border-neutral-900",
          "md:shadow-2xl md:shadow-neutral-900/20",
          "bg-background text-foreground",
        )}
      >
        {showChrome ? <StatusBar dark={dark} /> : null}

        {/*
          The scrollport is a plain block, NOT a flex column.

          As a flex container it would have a definite height (flex-1 of a
          fixed-height device), so its direct children would default to
          flex-shrink:1 and get compressed whenever content overflowed —
          e.g. the catalog filter row was squashed from 36px to 16px and
          clipped. A block scrollport plus one `min-h-full` column child
          keeps every child at its natural height, and still lets sticky
          footers reach the bottom edge on short screens.
        */}
        <main
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            scrollClassName,
          )}
        >
          <div className="flex min-h-full flex-col">{children}</div>
        </main>

        {footer}

        {/* Home indicator, desktop preview only. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-6 justify-center md:flex"
        >
          <div
            className={cn(
              "mt-2 h-1 w-28 rounded-full",
              dark ? "bg-white/25" : "bg-foreground/25",
            )}
          />
        </div>
      </div>
    </div>
  );
}

/** Simulated iOS status bar; hidden on real devices where the OS draws it. */
function StatusBar({ dark }: { dark: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-x-0 top-0 z-30 hidden h-11 items-center justify-between px-6",
        "text-[13px] font-semibold",
        dark ? "text-white" : "text-neutral-900",
        SAFE_AREA.top,
      )}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-4 fill-current" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.5" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-3 w-4 fill-current" aria-hidden>
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0-4.2a5.7 5.7 0 0 1 4 1.6l-1.4 1.4a3.8 3.8 0 0 0-5.2 0L4 6.9a5.7 5.7 0 0 1 4-1.6Zm0-3.3c2.6 0 5 1 6.8 2.7l-1.4 1.4a7.8 7.8 0 0 0-10.8 0L1.2 4.7A9.6 9.6 0 0 1 8 2Z" />
        </svg>
        <svg viewBox="0 0 25 12" className="h-3 w-5 fill-current" aria-hidden>
          <rect
            x="0.6"
            y="0.6"
            width="21"
            height="10.8"
            rx="3"
            className="fill-none stroke-current"
            strokeWidth="1.2"
          />
          <rect x="2.4" y="2.4" width="15" height="7.2" rx="1.8" />
          <path d="M23 4.2v3.6c1-.3 1.5-1 1.5-1.8s-.5-1.5-1.5-1.8Z" />
        </svg>
      </div>
    </div>
  );
}
