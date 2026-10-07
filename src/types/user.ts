import type { PartnerPreferences, PersonalProfile } from "@/types/profile";
import type { VerificationTag } from "@/types/verification";

export const USER_LEVELS = [1, 2, 3, 4] as const;

export type UserLevel = (typeof USER_LEVELS)[number];

export type Gender = "male" | "female";

export type KycStatus = "unverified" | "pending" | "approved" | "rejected";

export type SubscriptionStatus = "none" | "trialing" | "active" | "expired";

export interface PublicUser {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  city: string;
  countryCode: string;
  avatarUrl: string;
  photoUrls: string[];
  bio: string;
  interests: string[];
  level: UserLevel;
  kycStatus: KycStatus;
  /** Module R — badges the member submitted or passed. */
  verifications: VerificationTag[];
  /**
   * Module P — extended attributes. Optional so members who have not filled
   * the form in yet (and partial API payloads) stay valid.
   */
  profile?: PersonalProfile;
  /** Module P — the member's conditions on the person they want to meet. */
  preferences?: PartnerPreferences;
  isOnline: boolean;
  lastActiveAt: string;
  subscription: Subscription;
}

export interface Subscription {
  status: SubscriptionStatus;
  /** Null while the user has never subscribed. */
  level: UserLevel | null;
  /** ISO date; null for a free trial that has not started. */
  startedAt: string | null;
  expiresAt: string | null;
  /** True while a 30-day Level 1 trial granted by a promo code is running. */
  isTrial: boolean;
  /** Set when a downgrade is scheduled to apply at the end of the cycle. */
  scheduledLevel: UserLevel | null;
}

export interface Plan {
  level: UserLevel;
  /** null when the tier has no public price (see `isContactSales`). */
  priceMonthly: number | null;
  priceYearly: number | null;
  currency: string;
  /** Invite-only tier: the UI shows a contact CTA instead of an amount. */
  isContactSales?: boolean;
}
