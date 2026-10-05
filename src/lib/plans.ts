import type { Plan, UserLevel } from "@/types/user";

/** i18n keys for plan names, keyed by level. */
export const PLAN_LABEL_KEYS = {
  1: "plans.level1",
  2: "plans.level2",
  3: "plans.level3",
  4: "plans.level4",
} as const;

export type PlanLabelKey = (typeof PLAN_LABEL_KEYS)[UserLevel];

export function planLabelKey(level: UserLevel): PlanLabelKey {
  return PLAN_LABEL_KEYS[level];
}

/** True for invite-only tiers that have no listable price. */
export function isContactSales(plan: Plan): boolean {
  return plan.isContactSales === true || plan.priceMonthly === null;
}

/** Yearly price as a percentage cheaper than twelve monthly payments. */
export function yearlySavingPercent(plan: Plan): number {
  const monthlyTotal = (plan.priceMonthly ?? 0) * 12;
  if (monthlyTotal <= 0 || plan.priceYearly === null) {
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
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
