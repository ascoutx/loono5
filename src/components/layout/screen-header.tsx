"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ScreenHeaderWidth = "wide" | "narrow";

/** Kept two steps tighter than `Screen`, so titles line up with page copy. */
const HEADER_PADDING: Record<ScreenHeaderWidth, string> = {
  wide: "px-2 md:px-4 xl:px-6",
  narrow: "mx-auto w-full max-w-[42rem] px-2 md:px-4",
};

interface ScreenHeaderProps {
  title?: ReactNode;
  /** Back target. Omit on root tabs to hide the button. */
  backHref?: string;
  /** Extra classes on the back button, e.g. `xl:hidden` in a two-pane view. */
  backClassName?: string;
  action?: ReactNode;
  /** Centres the title, used by root tabs. */
  center?: boolean;
  /** Matches the `Screen` below it so both share one column width. */
  width?: ScreenHeaderWidth;
  className?: string;
}

export function ScreenHeader({
  title,
  backHref,
  backClassName,
  action,
  center = false,
  width = "wide",
  className,
}: ScreenHeaderProps) {
  const t = useTranslations("common");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-2",
        "bg-background/95 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur",
        HEADER_PADDING[width],
        className,
      )}
    >
      {backHref ? (
        <Link
          href={backHref}
          aria-label={t("back")}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted active:bg-muted",
            backClassName,
          )}
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span className="w-2 shrink-0" />
      )}

      <h1
        className={cn(
          "min-w-0 flex-1 truncate text-base font-semibold",
          !center && "text-center",
        )}
      >
        {title}
      </h1>

      <div className="flex min-w-9 shrink-0 items-center justify-end">
        {action}
      </div>
    </header>
  );
}
