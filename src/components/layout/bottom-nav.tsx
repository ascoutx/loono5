"use client";

import { Compass, MessageCircle, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/catalog", icon: Compass, key: "catalog" },
  { href: "/chats", icon: MessageCircle, key: "chats" },
  { href: "/profile", icon: User, key: "profile" },
  { href: "/agent/dashboard", icon: Users, key: "agent" },
] as const;

interface BottomNavProps {
  /** Unread badge counts keyed by tab href. */
  badges?: Partial<Record<string, number>>;
}

/** Fixed H5 tab bar; shown only inside the main app area. */
export function BottomNav({ badges }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "sticky bottom-0 z-30 shrink-0 border-t border-border bg-background/95 backdrop-blur",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
      )}
    >
      <ul className="grid grid-cols-4">
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
                  "relative flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors",
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
