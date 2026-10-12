"use client";

import { useTranslations } from "next-intl";

import { useUnreadTotals } from "@/components/chat/unread-provider";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { NAV_TABS } from "./nav-tabs";

/**
 * Pinned to the bottom of the frame. Rendered outside the scroll container by
 * AppFrame, so `shrink-0` keeps it full height at the bottom.
 *
 * `xl:hidden` hands navigation over to the desktop side rail, which renders
 * from the same NAV_TABS list.
 *
 * Badge counts come from the unread context rather than a prop: they are
 * maintained in the database and published over realtime, and threading them
 * down from a server layout is what had them hardcoded to a literal `2`.
 */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const totals = useUnreadTotals();

  return (
    <nav
      className={cn(
        "relative z-30 shrink-0 border-t border-border bg-background/95 backdrop-blur",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        "xl:hidden",
      )}
    >
      {/* Capped so the three tabs stay a comfortable tap size once the frame
          stops being phone-width (md–xl). */}
      <ul className="mx-auto grid w-full max-w-[42rem] grid-cols-3">
        {NAV_TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          const badge = totals[tab.href] ?? 0;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                  {badge > 0 ? (
                    <span className="text-destructive-foreground absolute -top-1 -right-2 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
