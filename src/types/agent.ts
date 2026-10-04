export const AGENT_LEVELS = ["base", "pro", "vip"] as const;

export type AgentLevel = (typeof AGENT_LEVELS)[number];

export interface Agent {
  id: string;
  userId: string;
  level: AgentLevel;
  /** Percent of every payment made by an invited user, per PRD rule 5. */
  commissionRate: number;
  refCode: string;
  refLink: string;
  joinedAt: string;
  stats: AgentStats;
}

export interface AgentStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayout: number;
  totalInvitees: number;
  activeInvitees: number;
  /** activeInvitees / totalInvitees, 0..1 */
  conversionRate: number;
}

export interface Referral {
  id: string;
  /** Display name is masked until the referral becomes an active subscriber. */
  nickname: string;
  avatarUrl: string | null;
  joinedAt: string;
  subscribed: boolean;
  level: number | null;
  earnings: number;
}

export interface PromoCode {
  code: string;
  /** Level 1 for all agent-generated codes (PRD rule 3). */
  level: 1;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

export type PayoutStatus = "pending" | "processing" | "paid" | "rejected";

export type PayoutMethod = "wechat" | "alipay" | "bank";

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  method: PayoutMethod;
  account: string;
  status: PayoutStatus;
  requestedAt: string;
  settledAt: string | null;
}
