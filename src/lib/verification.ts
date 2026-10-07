import type { VerificationCode, VerificationTag } from "@/types/verification";

/**
 * Module R — badge registry (R1) and derived helpers.
 *
 * Icons live in `components/profile/verification-badges.tsx`; this file stays
 * React-free so it can be imported from server and client code alike.
 */

export interface VerificationTagDefinition {
  code: VerificationCode;
  /** Display order; also the order used by the tag wall. */
  order: number;
  /**
   * Tailwind classes applied when the badge is verified. Written out in full
   * so the JIT compiler can see them.
   */
  verifiedClass: string;
  /** R5 — how long the badge stays valid, in months. Null = never expires. */
  validityMonths: number | null;
}

/** Applied to badges that are not (yet) verified — R2 grey state. */
export const VERIFICATION_MUTED_CLASS =
  "bg-muted text-muted-foreground/45 ring-transparent";

export const VERIFICATION_TAGS: VerificationTagDefinition[] = [
  {
    code: "realname",
    order: 1,
    verifiedClass:
      "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
    validityMonths: null,
  },
  {
    code: "education",
    order: 2,
    verifiedClass:
      "bg-blue-500/10 text-blue-600 ring-blue-500/25 dark:text-blue-400",
    validityMonths: null,
  },
  {
    code: "job",
    order: 3,
    verifiedClass:
      "bg-cyan-500/10 text-cyan-600 ring-cyan-500/25 dark:text-cyan-400",
    validityMonths: null,
  },
  {
    code: "income",
    order: 4,
    verifiedClass:
      "bg-teal-500/10 text-teal-600 ring-teal-500/25 dark:text-teal-400",
    validityMonths: 12,
  },
  {
    code: "asset",
    order: 5,
    verifiedClass:
      "bg-amber-500/10 text-amber-600 ring-amber-500/25 dark:text-amber-400",
    validityMonths: 12,
  },
  {
    code: "property",
    order: 6,
    verifiedClass:
      "bg-orange-500/10 text-orange-600 ring-orange-500/25 dark:text-orange-400",
    validityMonths: 24,
  },
  {
    code: "marriage",
    order: 7,
    verifiedClass:
      "bg-rose-500/10 text-rose-600 ring-rose-500/25 dark:text-rose-400",
    validityMonths: 12,
  },
  {
    code: "criminal",
    order: 8,
    verifiedClass:
      "bg-violet-500/10 text-violet-600 ring-violet-500/25 dark:text-violet-400",
    validityMonths: 12,
  },
];

export const VERIFICATION_TAG_COUNT = VERIFICATION_TAGS.length;

const TAGS_BY_CODE = new Map(
  VERIFICATION_TAGS.map((definition) => [definition.code, definition]),
);

export function getTagDefinition(
  code: VerificationCode,
): VerificationTagDefinition | undefined {
  return TAGS_BY_CODE.get(code);
}

/** Members hold whatever subset the backend returned; lookups stay defensive. */
export function getTag(
  tags: VerificationTag[] | undefined,
  code: VerificationCode,
): VerificationTag | undefined {
  return tags?.find((tag) => tag.code === code);
}

export function isTagVerified(
  tags: VerificationTag[] | undefined,
  code: VerificationCode,
): boolean {
  return getTag(tags, code)?.status === "approved";
}

/** Verified badges only, in registry order — used by the compact icon row. */
export function verifiedTags(
  tags: VerificationTag[] | undefined,
): VerificationTag[] {
  if (!tags?.length) {
    return [];
  }
  return VERIFICATION_TAGS.map((definition) =>
    getTag(tags, definition.code),
  ).filter((tag): tag is VerificationTag => tag?.status === "approved");
}

export function countVerifiedTags(tags: VerificationTag[] | undefined): number {
  return verifiedTags(tags).length;
}
