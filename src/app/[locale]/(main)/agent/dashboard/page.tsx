import {
  ArrowUpRight,
  Copy,
  Crown,
  Share2,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AgentStatsGrid } from "@/components/agent/stats-grid";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PromoTools } from "@/components/agent/promo-tools";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { agentLabelKey, payoutStatusKey } from "@/lib/agent";
import { currentAgent, payouts, referrals } from "@/lib/mock-data";

export default async function AgentDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("agent.dashboard");
  const ta = await getTranslations("agent");
  const tp = await getTranslations("agent.payout");
  const tc = await getTranslations("common");

  const { stats } = currentAgent;

  return (
    <>
      <ScreenHeader title={t("title")} center action={<LocaleSwitcher />} />

      <div className="flex flex-col gap-4 px-4 pb-6">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Crown className="size-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">
                {ta(agentLabelKey(currentAgent.level))}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {ta("commission", {
                  rate: Math.round(currentAgent.commissionRate * 100),
                })}
              </Badge>
            </div>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {currentAgent.refCode}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("title")}
            render={<Link href="/agent/join" />}
          >
            <ArrowUpRight className="size-4" />
          </Button>
        </Card>

        <AgentStatsGrid
          stats={[
            {
              icon: TrendingUp,
              label: t("totalEarnings"),
              value: stats.totalEarnings,
              currency: "USD",
            },
            {
              icon: Wallet,
              label: t("thisMonth"),
              value: stats.thisMonthEarnings,
              currency: "USD",
            },
            {
              icon: Users,
              label: t("totalInvitees"),
              value: stats.totalInvitees,
            },
            {
              icon: Ticket,
              label: t("pendingPayout"),
              value: stats.pendingPayout,
              currency: "USD",
            },
          ]}
        />

        <PromoTools
          refLink={currentAgent.refLink}
          refCode={currentAgent.refCode}
        />

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">{t("recent")}</h2>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              render={<Link href="/agent/dashboard" />}
            >
              {t("viewAll")}
            </Button>
          </div>

          {referrals.length === 0 ? (
            <Card className="p-6 text-center text-xs text-muted-foreground">
              {t("noData")}
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              {referrals.map((referral, index) => (
                <div
                  key={referral.id}
                  className={`flex items-center gap-3 p-3.5 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {referral.nickname.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {referral.nickname}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {new Date(referral.joinedAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  {referral.subscribed ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      L{referral.level}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      —
                    </Badge>
                  )}
                </div>
              ))}
            </Card>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-semibold">{tp("history")}</h2>
          <Card className="overflow-hidden p-0">
            {payouts.map((payout, index) => (
              <div
                key={payout.id}
                className={`flex items-center gap-3 p-3.5 ${
                  index > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    ${payout.amount.toFixed(2)}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {payout.account}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] ${
                    payout.status === "paid"
                      ? "border-emerald-600/40 text-emerald-600"
                      : payout.status === "rejected"
                        ? "border-destructive/40 text-destructive"
                        : ""
                  }`}
                >
                  {tp(payoutStatusKey(payout.status))}
                </Badge>
              </div>
            ))}
          </Card>
        </section>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 rounded-full"
          >
            <Copy className="size-4" />
            {ta("promo.copyLink")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <Share2 className="size-4" />
            {ta("promo.shareToWechat")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <Wallet className="size-4" />
            {tp("submit")}
          </Button>
        </div>

        <p className="pt-2 text-center text-[11px] text-muted-foreground">
          {tc("appName")}
        </p>
      </div>
    </>
  );
}
