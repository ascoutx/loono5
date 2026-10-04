import {
  ArrowLeft,
  Crown,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PromoTools } from "@/components/agent/promo-tools";
import { AuroraBackdrop } from "@/components/landing/aurora-backdrop";
import { RevenueChart } from "@/components/partner/revenue-chart";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { agentLabelKey, commissionRate } from "@/lib/agent";
import { currentAgent, payouts, referrals } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Placeholder series; replace with the real earnings endpoint. */
const MONTHLY_REVENUE = [
  { label: "May", amount: 412 },
  { label: "Jun", amount: 528 },
  { label: "Jul", amount: 486 },
  { label: "Aug", amount: 674 },
  { label: "Sep", amount: 741 },
  { label: "Oct", amount: 612 },
];

const CURRENCY = "USD";

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("partner");
  const td = await getTranslations("agent.dashboard");
  const ta = await getTranslations("agent");
  const tp = await getTranslations("agent.payout");

  const { stats } = currentAgent;
  const rate = Math.round(commissionRate(currentAgent.level) * 100);

  const kpis = [
    { icon: TrendingUp, label: t("totalRevenue"), value: stats.totalEarnings },
    { icon: Wallet, label: td("thisMonth"), value: stats.thisMonthEarnings },
    { icon: Users, label: td("totalInvitees"), value: stats.totalInvitees },
    { icon: Ticket, label: td("pendingPayout"), value: stats.pendingPayout },
  ];

  return (
    <div className="relative flex min-h-full flex-col">
      <AuroraBackdrop />

      <ScreenHeader
        title={td("title")}
        backHref="/catalog"
        action={
          <Badge variant="outline" className="gap-1 rounded-full text-[10px]">
            <Crown className="size-2.5" />
            {rate}%
          </Badge>
        }
      />

      <div className="relative z-10 flex flex-col gap-3 px-4 pt-2 pb-8">
        {/* Partner identity */}
        <Card className="flex flex-row items-center gap-3 border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-loono-rose to-loono-violet">
            <Crown className="size-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {ta(agentLabelKey(currentAgent.level))}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {currentAgent.refCode}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium">
            {t("partnerOnly")}
          </span>
        </Card>

        {/* Revenue analytics */}
        <Card className="gap-3 border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{t("revenue")}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {t("revenueHint")}
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-[10px] text-emerald-400"
            >
              +18.4%
            </Badge>
          </div>

          <RevenueChart data={MONTHLY_REVENUE} currency={CURRENCY} />

          <dl className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
            {[
              { label: t("newInvites"), value: "24" },
              { label: t("activeSubs"), value: "96" },
              { label: t("arpu"), value: "$34" },
            ].map((kpi) => (
              <div key={kpi.label}>
                <dd className="text-sm font-bold tabular-nums">{kpi.value}</dd>
                <dt className="text-[10px] text-muted-foreground">
                  {kpi.label}
                </dt>
              </div>
            ))}
          </dl>
        </Card>

        {/* KPI grid */}
        <ul className="grid grid-cols-2 gap-2">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <li key={kpi.label}>
                <Card className="border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon className="size-3.5" />
                    <span className="truncate">{kpi.label}</span>
                  </span>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    ${kpi.value.toLocaleString(locale)}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>

        {/* Referral link + promo code generator */}
        <PromoTools
          refLink={currentAgent.refLink}
          refCode={currentAgent.refCode}
        />

        {/* Referrals */}
        <Card className="gap-2 border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{td("recent")}</p>
            <span className="text-[11px] text-muted-foreground">
              {t("conversion")} {Math.round(stats.conversionRate * 100)}%
            </span>
          </div>

          <ul className="flex flex-col divide-y divide-white/10">
            {referrals.map((referral) => (
              <li key={referral.id} className="flex items-center gap-3 py-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                  {referral.nickname.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{referral.nickname}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {new Date(referral.joinedAt).toLocaleDateString(locale)}
                  </p>
                </div>
                {referral.subscribed ? (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-emerald-500/40 text-[10px] text-emerald-400"
                  >
                    L{referral.level} · ${referral.earnings.toFixed(2)}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0 text-[10px]")}
                  >
                    —
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* Payouts */}
        <Card className="gap-2 border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-sm font-semibold">{tp("history")}</p>
          <ul className="flex flex-col divide-y divide-white/10">
            {payouts.map((payout) => (
              <li key={payout.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    ${payout.amount.toFixed(2)}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {payout.account}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px]",
                    payout.status === "paid" &&
                      "border-emerald-500/40 text-emerald-400",
                    payout.status === "rejected" &&
                      "border-destructive/40 text-destructive",
                  )}
                >
                  {tp(
                    payout.status === "paid"
                      ? "status.paid"
                      : payout.status === "rejected"
                        ? "status.rejected"
                        : payout.status === "processing"
                          ? "status.processing"
                          : "status.pending",
                  )}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Button
          variant="ghost"
          className="mt-1 w-full gap-2 text-muted-foreground"
          render={<Link href="/catalog" />}
        >
          <ArrowLeft className="size-4" />
          {t("backToApp")}
        </Button>
      </div>
    </div>
  );
}
