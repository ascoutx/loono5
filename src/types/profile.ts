import type { UserLevel } from "@/types/user";

/**
 * Module P — extended member attributes and partner preferences.
 *
 * Two halves:
 *   `PersonalProfile`    → the extra attributes a member fills in on
 *                          「完善个人信息」 (P1 field list).
 *   `PartnerPreferences` → the conditions a member puts on the person they
 *                          want to meet (P1–P4), split into free, premium
 *                          (level-gated) and individually charged conditions.
 */

export const EDUCATION_LEVELS = [
  "highschool",
  "college",
  "bachelor",
  "master",
  "doctorate",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const LANGUAGE_CODES = [
  "zh",
  "en",
  "ru",
  "es",
  "fr",
  "de",
  "ar",
  "ja",
  "ko",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const RELIGIONS = [
  "none",
  "christian",
  "catholic",
  "muslim",
  "buddhist",
  "hindu",
  "jewish",
  "other",
] as const;

export type Religion = (typeof RELIGIONS)[number];

/** Tattoo coverage, from clean skin to openly visible work. */
export const TATTOO_LEVELS = ["none", "small", "visible"] as const;

export type TattooLevel = (typeof TATTOO_LEVELS)[number];

/** Shared by smoking and drinking habits. */
export const FREQUENCIES = ["never", "socially", "regularly"] as const;

export type Frequency = (typeof FREQUENCIES)[number];

export const ASSET_RANGES = [
  "under100k",
  "100k_500k",
  "500k_1m",
  "1m_5m",
  "above5m",
] as const;

export type AssetRange = (typeof ASSET_RANGES)[number];

/** Childbearing intention (生育意愿). */
export const CHILDREN_STATUSES = [
  "no",
  "want",
  "have",
  "have_want",
  "undecided",
] as const;

export type ChildrenStatus = (typeof CHILDREN_STATUSES)[number];

export const MARITAL_STATUSES = [
  "single",
  "divorced",
  "widowed",
  "separated",
] as const;

export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

/**
 * P1 — the attribute set behind 「完善个人信息」.
 *
 * Every field is nullable: members fill these in over time, and the profile
 * completeness meter counts what is set.
 */
export interface PersonalProfile {
  /** Centimetres. */
  heightCm: number | null;
  education: EducationLevel | null;
  /** Spoken languages; multi-select. */
  languages: LanguageCode[];
  religion: Religion | null;
  tattoo: TattooLevel | null;
  smoking: Frequency | null;
  drinking: Frequency | null;
  /** Declared asset bracket — verified separately by the asset badge (R1). */
  assetRange: AssetRange | null;
  children: ChildrenStatus | null;
  maritalStatus: MaritalStatus | null;
  occupation: string;
  /** Residence, distinct from the passport country in `PublicUser`. */
  countryCode: string;
  city: string;
}

/**
 * P1–P4 — partner conditions.
 *
 * `countries` / `cities` come from P1's 居住国家、居住城市; the boolean
 * `noTattoo` covers "指定无纹身" from P3.
 */
export interface PartnerPreferences {
  ageMin: number | null;
  ageMax: number | null;
  heightMin: number | null;
  heightMax: number | null;
  /** P3 premium. */
  education: EducationLevel[];
  /** P3 premium. */
  languages: LanguageCode[];
  /** P3 premium. */
  religions: Religion[];
  /** P3 premium — "指定无纹身". */
  noTattoo: boolean;
  /** P3 premium. */
  children: ChildrenStatus[];
  /** P3 premium — minimum asset bracket the partner must clear. */
  assetMin: AssetRange | null;
  /** Free filter. */
  countries: string[];
  /** P3 premium — narrowing to specific cities. */
  cities: string[];
  smoking: Frequency | null;
  drinking: Frequency | null;
  /** P4 — codes of the individually charged conditions that are switched on. */
  exclusive: ExclusiveConditionCode[];
}

/** P4 — conditions billed one by one rather than unlocked by level. */
export const EXCLUSIVE_CONDITIONS = [
  "assetThreshold",
  "exactRange",
  "regionOnly",
  "virginity",
] as const;

export type ExclusiveConditionCode = (typeof EXCLUSIVE_CONDITIONS)[number];

export interface ExclusiveConditionDefinition {
  code: ExclusiveConditionCode;
  /** Price in USD; backend-configurable per country/currency (P6). */
  priceUsd: number;
  /** Level that waives the fee entirely (P6 — L4 private clients). */
  levelExempt: UserLevel;
  /**
   * P7 — sensitive conditions must respect a per-region kill switch and are
   * hidden or disabled where local law forbids them.
   */
  sensitive: boolean;
  /** Regions where the condition must not be offered at all. */
  blockedCountryCodes: string[];
}
