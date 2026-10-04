import type { Plan, UserLevel } from "@/types/user";

/** i18n keys for plan names, keyed by level (PRD tiers 1-3). */
export const PLAN_LABEL_KEYS = {
  1: "plans.level1",
  2: "plans.level2",
  3: "plans.level3",
} as const;

export type PlanLabelKey = (typeof PLAN_LABEL_KEYS)[UserLevel];

export function planLabelKey(level: UserLevel): PlanLabelKey {
  return PLAN_LABEL_KEYS[level];
}

/** Yearly price as a percentage cheaper than twelve monthly payments. */
export function yearlySavingPercent(plan: Plan): number {
  const monthlyTotal = plan.priceMonthly * 12;
  if (monthlyTotal <= 0) {
    return 0;
  }
  return Math.round((1 - plan.priceYearly / monthlyTotal) * 100);
}

export function formatPrice(
  amount: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
