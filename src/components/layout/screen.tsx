import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SAFE_AREA } from "./app-frame";

/**
 * `wide`   content pages: catalog grids, profile, chat.
 * `narrow` forms and settings: a centred reading column on desktop, so a
 *          two-field form never stretches across a 1440px window.
 */
type ScreenWidth = "wide" | "narrow";

const BODY_PADDING: Record<ScreenWidth, string> = {
  wide: "px-4 md:px-6 xl:px-8",
  narrow: "mx-auto w-full max-w-[42rem] px-4 md:px-6",
};

interface ScreenProps {
  children: ReactNode;
  /** Sticky footer for primary actions or the chat composer. */
  footer?: ReactNode;
  className?: string;
  /** Removes default horizontal padding, e.g. for full-bleed grids. */
  flush?: boolean;
  width?: ScreenWidth;
}

/**
 * A single screen.
 *
 * `min-h-full` matters: the scroll container is the viewport-sized element
 * above, so a short screen still fills it and its sticky footer lands on the
 * bottom edge instead of floating mid-screen.
 */
export function Screen({
  children,
  footer,
  className,
  flush,
  width = "wide",
}: ScreenProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className={cn("flex-1", !flush && BODY_PADDING[width], className)}>
        {children}
      </div>
      {footer ? (
        <div
          className={cn(
            "sticky bottom-0 z-20 border-t border-border bg-background/95 pt-3 backdrop-blur",
            BODY_PADDING[width],
            "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export { SAFE_AREA };
export type { ScreenWidth };
