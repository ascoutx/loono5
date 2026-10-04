"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * The main landing CTA. Deliberately not a shadcn `Button`: it needs the
 * gradient/glow/press treatment from globals.css and a tall touch target.
 */
export function PrimaryCta({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children?: ReactNode;
}) {
  const t = useTranslations("guest");

  return (
    <Link
      href={href}
      className={cn(
        "loono-cta flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold tracking-tight",
        className,
      )}
    >
      {children ?? t("ctaPrimary")}
    </Link>
  );
}

/** Quieter frosted counterpart to {@link PrimaryCta}. */
export function GhostCta({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "loono-cta-ghost flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold",
        className,
      )}
    >
      {children}
    </Link>
  );
}
