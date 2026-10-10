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

/**
 * Height of the pinned bottom nav, used to clear it inside scroll areas.
 * The tab bar is hidden from `xl` up, where the side rail takes over, so the
 * clearance collapses to a plain page gutter on desktop.
 */
export const BOTTOM_NAV_CLEARANCE =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom))] xl:pb-6";

/**
 * Bottom gutter on desktop, as a raw length so components that size
 * themselves against the viewport can subtract it. Keep in sync with the
 * `xl:` padding in BOTTOM_NAV_CLEARANCE above.
 */
export const DESKTOP_GUTTER = "1.5rem";

/**
 * Horizontal rhythm + max width for the page column.
 *
 *   md–lg   a centred reading column, never wider than it needs to be
 *   xl+     the desktop canvas, minus the side rail
 */
export const CONTENT_WIDTH =
  "mx-auto w-full max-w-[46rem] lg:max-w-[60rem] xl:max-w-[72rem]";

type Surface = "light" | "partner";

interface AppFrameProps {
  children: ReactNode;
  /**
   * Pinned below the scroll area and outside it, so it can never be pushed
   * up by short content. The B2C tab bar, on mobile only.
   */
  footer?: ReactNode;
  /** Desktop navigation rail, laid out to the left of the scroll column. */
  sidebar?: ReactNode;
  /** Extra classes for the scroll container, e.g. bottom-nav clearance. */
  scrollClassName?: string;
  /**
   * B2C is the warm ivory consumer site; the B2B partner cabinet is a cool
   * light data surface. Both are light — the difference is hue, not luminance.
   */
  surface?: Surface;
}

/**
 * Responsive app frame (PRD: mobile-first, WeChat browser + mobile web).
 *
 * Three tiers, all driven by CSS — there is deliberately no viewport JS, so
 * there is no hydration mismatch between server and client:
 *
 *   < md    full-bleed H5: the device IS the viewport, tab bar pinned
 *   md–xl   the same single column, centred, with a page gutter
 *   xl+     desktop canvas: navigation moves to a left rail, tab bar hides
 *
 * Geometry, from the outside in:
 *   outer      h-dvh flex        — exactly one viewport tall
 *   shell      flex-row          — side rail + scroll column
 *   main       min-h-0 flex-1    — the ONLY scroll container
 *   footer     shrink-0          — pinned, never scrolled
 *
 * The scroll region is a separate flex item from the footer, which is what
 * keeps the bottom nav anchored to the bottom edge instead of floating after
 * short content.
 */
export function AppFrame({
  children,
  footer,
  sidebar,
  scrollClassName,
  surface = "light",
}: AppFrameProps) {
  const partner = surface === "partner";

  return (
    <div
      className={cn(
        "flex h-dvh min-h-screen w-full justify-center",
        // Letterbox around the app column. B2C uses a warm sand, one step
        // deeper than the ivory canvas, so the column still reads as a
        // distinct surface; B2B uses its own cool grey.
        partner ? "bg-partner-canvas" : "bg-loono-sand",
      )}
    >
      <div
        className={cn(
          "relative flex h-dvh min-h-0 w-full flex-1 flex-row overflow-hidden text-foreground",
          // Both surfaces are light, but the cabinet re-declares the shadcn
          // tokens inside `.partner-surface` so its own chrome resolves cool.
          partner ? "bg-partner-canvas" : "bg-background",
        )}
      >
        {sidebar}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/*
            The scrollport is a plain block, NOT a flex column.

            As a flex container it would have a definite height (flex-1 of a
            fixed-height shell), so its direct children would default to
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
            <div className={cn("flex min-h-full flex-col", CONTENT_WIDTH)}>
              {children}
            </div>
          </main>

          {footer}
        </div>
      </div>
    </div>
  );
}
