import {
  AGENT_LEVELS,
  type AgentLevel,
  type PayoutStatus,
} from "@/types/agent";

/** Commission rates per PRD rule 5. */
export const COMMISSION_RATES: Record<AgentLevel, number> = {
  base: 0.5,
  pro: 0.6,
  vip: 0.7,
};

/** i18n keys for agent tier names. */
export const AGENT_LABEL_KEYS = {
  base: "levels.base",
  pro: "levels.pro",
  vip: "levels.vip",
} as const;

export function agentLabelKey(level: AgentLevel) {
  return AGENT_LABEL_KEYS[level];
}

/** i18n keys for payout states. */
export const PAYOUT_STATUS_KEYS = {
  pending: "status.pending",
  processing: "status.processing",
  paid: "status.paid",
  rejected: "status.rejected",
} as const;

export function payoutStatusKey(status: PayoutStatus) {
  return PAYOUT_STATUS_KEYS[status];
}

export const PROMO_CODE_TTL_DAYS = 30;

export function commissionRate(level: AgentLevel): number {
  return COMMISSION_RATES[level];
}

export function commissionFor(
  level: AgentLevel,
  paymentAmount: number,
): number {
  return round2(paymentAmount * COMMISSION_RATES[level]);
}

export function nextAgentLevel(level: AgentLevel): AgentLevel | null {
  const index = AGENT_LEVELS.indexOf(level);
  return index >= 0 && index < AGENT_LEVELS.length - 1
    ? AGENT_LEVELS[index + 1]
    : null;
}

export function promoCodeExpiry(from: Date = new Date()): string {
  const expiry = new Date(from);
  expiry.setDate(expiry.getDate() + PROMO_CODE_TTL_DAYS);
  return expiry.toISOString();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
