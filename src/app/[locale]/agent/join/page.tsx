import { Check, Copy, Crown, Megaphone, TrendingUp, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";
import { Screen } from "@/components/layout/screen";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { agentLabelKey, COMMISSION_RATES } from "@/lib/agent";
import { currentAgent } from "@/lib/mock-data";

const AGENT_LEVELS = ["base", "pro", "vip"] as const;

export default async function AgentJoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("agent.join");
  const ta = await getTranslations("agent");
  const tc = await getTranslations("common");

  const benefits = [
    { icon: TrendingUp, label: ta("commission", { rate: 70 }) },
    { icon: Users, label: ta("dashboard.totalInvitees") },
    { icon: Megaphone, label: ta("promo.promoCodeTitle") },
  ];

  return (
    <AppShell>
      <ScreenHeader backHref="/" title={ta("join.title")} />

      <Screen
        footer={
          <Button
            size="lg"
            className="w-full rounded-full"
            render={<Link href="/partner" />}
          >
            {t("start")}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-primary/10">
            <Crown className="size-8 text-primary" />
          </span>
          <h2 className="px-2 text-xl font-bold">{t("title")}</h2>
          <p className="max-w-[16rem] text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("benefitsTitle")}</h3>
          <Card className="p-0">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.label}
                  className={`flex items-center gap-3 p-4 ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm">{benefit.label}</span>
                </div>
              );
            })}
          </Card>
        </section>

        <section className="mt-5 flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("commissionTitle")}</h3>
          <ul className="grid grid-cols-3 gap-2">
            {AGENT_LEVELS.map((level) => (
              <li key={level}>
                <Card
                  className={`flex flex-col items-center gap-1 p-3 text-center ${
                    level === currentAgent.level ? "border-primary" : ""
                  }`}
                >
                  <span className="text-[11px] text-muted-foreground">
                    {ta(agentLabelKey(level))}
                  </span>
                  <span className="text-lg font-bold">
                    {Math.round(COMMISSION_RATES[level] * 100)}%
                  </span>
                  {level === currentAgent.level ? (
                    <Badge className="text-[10px]">{tc("current")}</Badge>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("codeLabel")}</h3>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
            <code className="flex-1 font-mono text-sm">
              {currentAgent.refCode}
            </code>
            <Button variant="ghost" size="sm" className="gap-1 rounded-full">
              <Copy className="size-3.5" />
              {t("copy")}
            </Button>
          </div>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Check className="size-3" />
            {t("linkLabel")}
          </p>
        </section>
      </Screen>
    </AppShell>
  );
}
