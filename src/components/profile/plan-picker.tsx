"use client";

import { Check, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  isContactSales,
  planLabelKey,
  yearlySavingPercent,
} from "@/lib/plans";
import type { Plan, UserLevel } from "@/types/user";

type Period = "monthly" | "yearly";

interface PlanPickerProps {
  plans: Plan[];
  locale: string;
  currentLevel: UserLevel | null;
}

export function PlanPicker({ plans, locale, currentLevel }: PlanPickerProps) {
  const t = useTranslations("subscription");
  const [period, setPeriod] = useState<Period>("monthly");
  const [selected, setSelected] = useState<UserLevel>(currentLevel ?? 1);

  return (
    <>
      <div className="mb-4 flex rounded-full bg-muted p-1 text-sm">
        {(["monthly", "yearly"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPeriod(option)}
            aria-pressed={period === option}
            className={cn(
              "flex-1 rounded-full py-1.5 transition-colors",
              period === option
                ? "bg-background font-medium shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {t(option)}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {plans.map((plan) => {
          const active = selected === plan.level;
          const isCurrent = currentLevel === plan.level;
          const saving = yearlySavingPercent(plan);
          const price = isContactSales(plan)
            ? null
            : period === "monthly"
              ? plan.priceMonthly
              : plan.priceYearly;

          return (
            <li key={plan.level}>
              <Card
                className={cn(
                  "cursor-pointer p-4 transition-colors",
                  active ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                )}
                onClick={() => setSelected(plan.level)}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      active ? "border-primary" : "border-border",
                    )}
                  >
                    {active ? (
                      <span className="size-2.5 rounded-full bg-primary" />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {t(planLabelKey(plan.level))}
                      </span>
                      <Badge variant="outline" className="gap-0.5 text-[10px]">
                        <Crown className="size-2.5" />L{plan.level}
                      </Badge>
                      {isCurrent ? (
                        <Badge className="text-[10px]">{t("active")}</Badge>
                      ) : null}
                      {period === "yearly" && saving > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-600/40 text-[10px] text-emerald-600"
                        >
                          {t("saveBadge", { percent: saving })}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("visibilityText", { from: 1, to: plan.level })}
                    </p>

                    <ul className="mt-2 flex flex-col gap-1">
                      {(
                        [
                          "featureChat",
                          "featureTranslate",
                          "featureBlur",
                        ] as const
                      ).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <Check className="size-3 shrink-0 text-emerald-600" />
                          {t(feature)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="shrink-0 text-right">
                    {price !== null ? (
                      <>
                        <p className="text-base font-bold">
                          {formatPrice(price, plan.currency, locale)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {period === "monthly" ? t("perMonth") : t("perYear")}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-primary">
                          {t("contactUs")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t("byInvitation")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <Button
        size="lg"
        className="mt-4 w-full rounded-full"
        render={<Link href="/settings" />}
      >
        {t("upgrade")}
      </Button>
    </>
  );
}
