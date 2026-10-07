/**
 * Module R — member verification badges (R1/R3).
 *
 * A member holds one entry per badge type; the entry carries the review state
 * so the UI can render the icon in colour (verified) or grey (not verified).
 */

export const VERIFICATION_CODES = [
  "realname",
  "education",
  "marriage",
  "asset",
  "criminal",
  "job",
  "income",
  "property",
] as const;

export type VerificationCode = (typeof VERIFICATION_CODES)[number];

/**
 * R3 — badge lifecycle.
 * `unverified` is the implicit state for badges the member never submitted.
 */
export type VerificationStatus =
  "unverified" | "pending" | "approved" | "rejected" | "expired" | "revoked";

export interface VerificationTag {
  code: VerificationCode;
  status: VerificationStatus;
  /** ISO date the review passed. Null unless the badge has been approved once. */
  verifiedAt: string | null;
  /** ISO date the badge lapses (R5). Null for badges that never expire. */
  expiresAt: string | null;
}

/** True when the badge should be rendered in colour. */
export const VERIFIED_STATUSES: readonly VerificationStatus[] = ["approved"];

export function isVerifiedStatus(status: VerificationStatus): boolean {
  return VERIFIED_STATUSES.includes(status);
}
