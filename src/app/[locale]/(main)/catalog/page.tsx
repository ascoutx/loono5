import { SlidersHorizontal } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { UserCard } from "@/components/catalog/user-card";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { catalogUsers } from "@/lib/mock-data";
import { hasActiveSubscription, visibleLevels } from "@/lib/tiers";

const TABS = ["tabsAll", "tabsNearby", "tabsNew", "tabsOnline"] as const;

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("catalog");
  const tc = await getTranslations("common");

  // The session tier drives the visibility matrix (PRD rule 2).
  const viewer = await getCurrentUser();
  const subscribed = hasActiveSubscription(viewer);
  const viewerLevel = viewer.subscription.level ?? 1;
  const visible = new Set(visibleLevels(viewerLevel));

  return (
    <>
      <ScreenHeader
        title={t("title")}
        center
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label={t("filter")}>
              <SlidersHorizontal className="size-5" />
            </Button>
            <LocaleSwitcher />
          </div>
        }
      />

      <div className="sticky top-14 z-20 flex gap-2 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur md:px-6 xl:px-8">
        {TABS.map((tab, index) => (
          <Badge
            key={tab}
            variant={index === 0 ? "default" : "outline"}
            className="shrink-0 rounded-full px-3 py-1"
          >
            {t(tab)}
          </Badge>
        ))}
      </div>

      {subscribed ? (
        <div className="px-4 pb-2 text-xs text-muted-foreground md:px-6 xl:px-8">
          {t("resultsCount", { count: catalogUsers.length })}
        </div>
      ) : (
        <div className="px-4 pb-2 md:px-6 xl:px-8">
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {tc("comingSoon")}
          </Badge>
        </div>
      )}

      {catalogUsers.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-muted-foreground md:px-6 xl:px-8">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 px-4 pb-6 md:grid-cols-3 md:gap-3 md:px-6 xl:grid-cols-4 xl:gap-4 xl:px-8">
          {catalogUsers.map((user) => (
            <li key={user.id}>
              <Link href={`/user/${user.id}`} className="block">
                <UserCard user={user} unlocked={visible.has(user.level)} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
