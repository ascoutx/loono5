import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SAFE_AREA } from "./mobile-frame";

interface ScreenProps {
  children: ReactNode;
  /** Sticky footer for primary actions or the chat composer. */
  footer?: ReactNode;
  className?: string;
  /** Removes default horizontal padding, e.g. for full-bleed grids. */
  flush?: boolean;
}

/**
 * A single H5 screen: fills the frame, scrolls internally, and keeps the
 * footer pinned above the home indicator.
 */
export function Screen({ children, footer, className, flush }: ScreenProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div
        className={cn("flex-1", !flush && "px-4", !footer && "pb-6", className)}
      >
        {children}
      </div>
      {footer ? (
        <div
          className={cn(
            "sticky bottom-0 z-20 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur",
            SAFE_AREA.bottom,
            "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
