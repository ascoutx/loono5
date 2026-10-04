import { USER_LEVELS, type UserLevel } from "@/types/user";

/** Fixed code accepted by the mock SMS flow. */
export const MOCK_SMS_CODE = "1234";

/** Tier granted by a fresh sign-in (PRD rule 3: Level 1 + 30-day trial). */
export const DEFAULT_SIGN_IN_LEVEL: UserLevel = 1;

export const TRIAL_DAYS = 30;

/** Seed phone number pre-filled in the mock form. */
export const MOCK_SAMPLE_PHONE = "+86 138 0000 0000";

export interface MockSession {
  phone: string;
  level: UserLevel;
  createdAt: string;
}

export function isUserLevel(value: unknown): value is UserLevel {
  return USER_LEVELS.includes(value as UserLevel);
}
