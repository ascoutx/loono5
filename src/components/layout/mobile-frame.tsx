import type { ReactNode } from "react";

/**
 * Fixed safe-area tokens so every screen can pad itself consistently.
 * Pair with `viewport-fit=cover` in the root layout metadata.
 */
export const SAFE_AREA = {
  top: "pt-[env(safe-area-inset-top)]",
  bottom: "pb-[env(safe-area-inset-bottom)]",
} as const;

interface MobileFrameProps {
  children: ReactNode;
  /** Renders a WeChat-style status bar inside the frame (desktop preview only). */
  showChrome?: boolean;
}

/**
 * Mobile H5 wrapper (PRD: mobile-first, WeChat browser + mobile web).
 *
 * - On phones and tablets the app fills the viewport edge to edge.
 * - On desktop it is centred inside a device frame so the H5 layout is
 *   previewed at its real size instead of stretching across the screen.
 *
 * Implemented purely with CSS so there is no viewport JS and no hydration
 * mismatch between server and client.
 */
export function MobileFrame({ children, showChrome = true }: MobileFrameProps) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-neutral-100 md:items-center md:p-6 dark:bg-neutral-950">
      <div
        className={[
          "relative flex w-full flex-col overflow-hidden bg-background",
          // Real device: fill the screen.
          "h-dvh",
          // Desktop preview: fixed phone viewport with a device bezel.
          "md:h-[min(844px,calc(100dvh-3rem))] md:w-[390px] md:rounded-[2.25rem]",
          "md:border-[10px] md:border-neutral-900 md:shadow-2xl md:shadow-neutral-900/20",
        ].join(" ")}
      >
        {showChrome ? <StatusBar /> : null}

        {/* Scroll container: keeps pull-to-refresh and rubber-banding inside the app. */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Home indicator, desktop preview only. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-6 justify-center md:flex"
        >
          <div className="mt-2 h-1 w-28 rounded-full bg-foreground/25" />
        </div>
      </div>
    </div>
  );
}

/** Simulated iOS status bar; hidden on real devices where the OS draws it. */
function StatusBar() {
  return (
    <div
      aria-hidden
      className={`absolute inset-x-0 top-0 z-30 hidden h-11 items-center justify-between px-6 text-[13px] font-semibold md:flex ${SAFE_AREA.top}`}
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

/** Desktop notch, drawn above the scroll area. */
export function Notch() {
  return (
    <div
      aria-hidden
      className="absolute top-0 left-1/2 z-40 hidden h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-neutral-900 md:block"
    />
  );
}
