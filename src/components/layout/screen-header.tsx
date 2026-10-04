"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title?: ReactNode;
  /** Back target. Omit on root tabs to hide the button. */
  backHref?: string;
  action?: ReactNode;
  /** Centres the title, used by root tabs. */
  center?: boolean;
  className?: string;
}

export function ScreenHeader({
  title,
  backHref,
  action,
  center = false,
  className,
}: ScreenHeaderProps) {
  const t = useTranslations("common");

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-2",
        "bg-background/95 px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur",
        className,
      )}
    >
      {backHref ? (
        <Link
          href={backHref}
          aria-label={t("back")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted active:bg-muted"
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
