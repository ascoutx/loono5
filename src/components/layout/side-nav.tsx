"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { NAV_TABS } from "./nav-tabs";

interface SideNavProps {
  badges?: Record<string, number>;
}

/**
 * Desktop counterpart of the bottom tab bar (≥1280px only).
 *
 * Below `xl` this renders `display:none`, so the mobile shell is unaffected.
 * It reuses the same `NAV_TABS` and the same active-route rule as
 * `BottomNav` — only the axis changes.
 */
export function SideNav({ badges }: SideNavProps) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();

  return (
    <nav className="hidden shrink-0 border-r border-border bg-background xl:flex xl:w-60 xl:flex-col xl:px-3 xl:py-6">
      <span className="px-3 pb-6 text-lg font-semibold tracking-tight">
        {tc("appName")}
      </span>

      <ul className="flex flex-col gap-1">
        {NAV_TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          const badge = badges?.[tab.href] ?? 0;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span className="relative shrink-0">
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                  {badge > 0 ? (
                    <span className="text-destructive-foreground absolute -top-1 -right-2 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{t(tab.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
