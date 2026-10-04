import {
  BadgeCheck,
  ChevronRight,
  Crown,
  LogOut,
  Settings as SettingsIcon,
  Ticket,
  UserCog,
  Users,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MockLevelSwitcher } from "@/components/auth/mock-level-switcher";
import { Screen } from "@/components/layout/screen";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { currentAgent, plans } from "@/lib/mock-data";
import { planLabelKey } from "@/lib/plans";
import { daysUntilExpiry, hasActiveSubscription } from "@/lib/tiers";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("profile");
  const ts = await getTranslations("subscription");

  const currentUser = await getCurrentUser();

  const active = hasActiveSubscription(currentUser);
  const expiresAt = currentUser.subscription.expiresAt;
  const plan = plans.find(
    (item) => item.level === currentUser.subscription.level,
  );

  const rows = [
    { href: "/profile/subscription", icon: Crown, label: t("subscription") },
    { href: "/agent/dashboard", icon: Users, label: t("agentCenter") },
    { href: "/onboarding/profile", icon: UserCog, label: t("edit") },
    { href: "/settings", icon: SettingsIcon, label: t("settings") },
  ];

  return (
    <>
      <ScreenHeader title={t("title")} />

      <Screen>
        <Card className="flex items-center gap-3 p-4">
          <Avatar className="size-14">
            <AvatarImage src={currentUser.avatarUrl} alt="" />
            <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-base font-semibold">
                {currentUser.name}
              </span>
              {currentUser.kycStatus === "approved" ? (
                <BadgeCheck className="size-4 shrink-0 text-emerald-600" />
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.age} · {currentUser.city}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            render={<Link href="/onboarding/profile" />}
          >
            {t("edit")}
          </Button>
        </Card>

        <Card className="mt-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("myLevel")}
            </span>
            <Badge className="gap-1 rounded-full">
              <Crown className="size-3" />
              {t("level", { level: currentUser.subscription.level ?? 1 })}
            </Badge>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold">
                {plan ? ts(planLabelKey(plan.level)) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {active && expiresAt
                  ? `${t("expiresAt")}: ${new Date(expiresAt).toLocaleDateString(locale)} · ${t("daysLeft", { days: daysUntilExpiry(expiresAt) })}`
                  : t("expired")}
              </p>
            </div>
            <Button
              size="sm"
              className="rounded-full"
              render={<Link href="/profile/subscription" />}
            >
              {t("upgrade")}
            </Button>
          </div>
        </Card>

        <MockLevelSwitcher
          current={currentUser.subscription.level}
          signedIn={true}
          className="mt-3"
        />

        <Card className="mt-3 overflow-hidden p-0">
          {rows.map((row, index) => {
            const Icon = row.icon;
            return (
              <div key={row.href}>
                {index > 0 ? <Separator /> : null}
                <Link
                  href={row.href}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm">{row.label}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </div>
            );
          })}
        </Card>

        <Button
          variant="ghost"
          className="mt-4 w-full gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="size-4" />
          {t("logout")}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Ticket className="size-3" />
          {t("myReferrals")}: {currentAgent.refCode}
        </p>
      </Screen>
    </>
  );
}
