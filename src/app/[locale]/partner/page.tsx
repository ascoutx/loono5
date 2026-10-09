import { LogOut, Ticket, TrendingUp, Users, Wallet } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PromoTools } from "@/components/agent/promo-tools";
import { RevenueChart } from "@/components/partner/revenue-chart";
import { Button } from "@/components/ui/button";
import { agentLabelKey, commissionRate } from "@/lib/agent";
import { currentAgent, payouts, referrals } from "@/lib/mock-data";
import { partnerSignOutAction } from "@/lib/partner/actions";
import { requirePartnerSession } from "@/lib/partner/session";
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

/** Panel chrome: hairline header, flat body. Shared by every block below. */
function Panel({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("partner-panel flex flex-col", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="text-[11px] font-medium tracking-[0.12em] text-white/70 uppercase">
          {title}
        </h2>
        {hint ? (
          <span className="text-[11px] text-white/40">{hint}</span>
        ) : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

/**
 * B2B partner cabinet — dark data surface.
 *
 * Deliberately instrument-like rather than warm: charcoal, hairline rules,
 * big tabular numbers. Nothing here is shared with the consumer surface, and
 * the page is gated — see `requirePartnerSession`.
 */
export default async function PartnerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Gate first: unauthenticated visitors never see the numbers below.
  const session = await requirePartnerSession();

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
    <div className="partner-surface relative flex min-h-full flex-1 flex-col">
      {/* ── Operator bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-partner-canvas/85 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6 xl:px-8">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {t("title")}
            </span>
            <span className="block truncate font-mono text-[10px] text-white/40">
              {session.account} · {currentAgent.refCode}
            </span>
          </span>

          <span className="ms-auto hidden rounded-md border border-white/12 px-2 py-1 text-[10px] tracking-wide text-white/50 uppercase sm:block">
            {ta(agentLabelKey(currentAgent.level))} · {rate}%
          </span>

          <form action={partnerSignOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/55 hover:text-white"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[76rem] px-4 py-5 pb-14 md:px-6 xl:px-8">
        {/* ── KPI strip ──────────────────────────────────────────────── */}
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <li key={kpi.label} className="partner-panel p-4">
                <span className="flex items-center gap-1.5 text-[11px] tracking-wide text-white/45 uppercase">
                  <Icon className="size-3.5" />
                  <span className="truncate">{kpi.label}</span>
                </span>
                <p className="mt-2.5 text-2xl font-semibold tabular-nums text-white">
                  ${kpi.value.toLocaleString(locale)}
                </p>
              </li>
            );
          })}
        </ul>

        {/* ── Trend + ratios ─────────────────────────────────────────── */}
        <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Panel
            title={t("revenue")}
            hint={t("revenueHint")}
            className="min-w-0"
          >
            <RevenueChart data={MONTHLY_REVENUE} currency={CURRENCY} />

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              {[
                { label: t("newInvites"), value: "24" },
                { label: t("activeSubs"), value: "96" },
                { label: t("arpu"), value: "$34" },
              ].map((item) => (
                <div key={item.label}>
                  <dd className="text-lg font-semibold tabular-nums text-white">
                    {item.value}
                  </dd>
                  <dt className="text-[10px] text-white/40">{item.label}</dt>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel
            title={t("quickActions")}
            hint={`${t("since")} ${new Date(currentAgent.joinedAt).toLocaleDateString(locale)}`}
          >
            <PromoTools
              refLink={currentAgent.refLink}
              refCode={currentAgent.refCode}
            />
          </Panel>
        </div>

        {/* ── Tables ─────────────────────────────────────────────────── */}
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <Panel
            title={td("recent")}
            hint={`${t("conversion")} ${Math.round(stats.conversionRate * 100)}%`}
            className="overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] tracking-wide text-white/40 uppercase">
                  <th className="pb-2 text-left font-medium">
                    {td("tabs.overview")}
                  </th>
                  <th className="pb-2 text-left font-medium">—</th>
                  <th className="pb-2 text-right font-medium">USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/8 text-[10px] font-medium">
                          {referral.nickname.slice(0, 1)}
                        </span>
                        <span className="truncate">{referral.nickname}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] text-white/40">
                      {new Date(referral.joinedAt).toLocaleDateString(locale)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {referral.subscribed ? (
                        <span className="text-emerald-400">
                          +${referral.earnings.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel
            title={tp("history")}
            hint={`${payouts.length} ${t("byMonth")}`}
            className="overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] tracking-wide text-white/40 uppercase">
                  <th className="pb-2 text-left font-medium">
                    {tp("title")}
                  </th>
                  <th className="pb-2 text-left font-medium">
                    {tp("available")}
                  </th>
                  <th className="pb-2 text-right font-medium">
                    {tp("status.pending")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="py-2.5 tabular-nums">
                      ${payout.amount.toFixed(2)}
                    </td>
                    <td className="truncate py-2.5 text-[11px] text-white/40">
                      {payout.account}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={cn(
                          "rounded-md border px-1.5 py-0.5 text-[10px]",
                          payout.status === "paid" &&
                            "border-emerald-500/40 text-emerald-400",
                          payout.status === "rejected" &&
                            "border-destructive/40 text-destructive",
                          payout.status !== "paid" &&
                            payout.status !== "rejected" &&
                            "border-white/15 text-white/50",
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
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </div>
  );
}
