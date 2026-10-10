import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { partnerSignOutAction } from "@/lib/partner/actions";
import { cn } from "@/lib/utils";

export type CabinetSection = "dashboard" | "agents";

const IDENTITY_ICON = {
  dashboard: LayoutDashboard,
  agents: Users,
} as const;

/**
 * Cabinet top bar: identity, section switcher, sign-out.
 *
 * Lifted out of the dashboard page when the partner lookup landed — both
 * sections need the same chrome, and the two must not drift apart visually.
 * The nav labels are resolved with explicit branches rather than a computed
 * key so the message keys stay statically checkable.
 */
export async function OperatorBar({
  account,
  section,
  badge,
}: {
  account: string;
  section: CabinetSection;
  /** Optional standing detail for the right-hand side, e.g. "Pro · 60%". */
  badge?: string;
}) {
  const t = await getTranslations("partner");

  const items = [
    { id: "dashboard" as const, href: "/partner", label: t("nav.dashboard") },
    { id: "agents" as const, href: "/partner/agents", label: t("nav.agents") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-partner-canvas/85 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6 xl:px-8">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {t("title")}
          </span>
          <span className="block truncate font-mono text-[10px] text-muted-foreground">
            {account}
          </span>
        </span>

        <nav aria-label={t("title")} className="ms-1 flex items-center gap-0.5">
          {items.map((item) => {
            const Icon = IDENTITY_ICON[item.id];
            const active = item.id === section;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground/85",
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          {badge ? (
            <span className="hidden rounded-md border border-border px-2 py-1 text-[10px] tracking-wide text-muted-foreground uppercase sm:block">
              {badge}
            </span>
          ) : null}

          <form action={partnerSignOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
