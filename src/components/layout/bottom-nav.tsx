"use client";

import { Compass, MessageCircle, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * B2C tabs only. The partner (B2B) cabinet is deliberately absent — it is
 * reached exclusively via /partner.
 */
const TABS = [
  { href: "/catalog", icon: Compass, key: "catalog" },
  { href: "/chats", icon: MessageCircle, key: "chats" },
  { href: "/profile", icon: User, key: "profile" },
] as const;

interface BottomNavProps {
  badges?: Record<string, number>;
}

/**
 * Pinned to the bottom of the device frame. Rendered outside the scroll
 * container by MobileFrame, so `shrink-0` keeps it full height at the bottom.
 */
export function BottomNav({ badges }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "relative z-30 shrink-0 border-t border-border bg-background/95 backdrop-blur",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
      )}
    >
      <ul className="grid grid-cols-3">
        {TABS.map((tab) => {
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
