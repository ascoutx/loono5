import {
  ASSET_RANGES,
  CHILDREN_STATUSES,
  EDUCATION_LEVELS,
  EXCLUSIVE_CONDITIONS,
  type ExclusiveConditionCode,
  type ExclusiveConditionDefinition,
  FREQUENCIES,
  LANGUAGE_CODES,
  MARITAL_STATUSES,
  RELIGIONS,
  TATTOO_LEVELS,
  type PartnerPreferences,
  type PersonalProfile,
} from "@/types/profile";
import type { UserLevel } from "@/types/user";

/**
 * Module P — option registries for the profile form and the preference form.
 *
 * Labels are i18n keys under the `profileForm` namespace, so the backend can
 * swap the dictionary without a release (module B2). Everything here is a
 * plain value list: the React layer picks the component (chips vs. input).
 */

export interface Option<T extends string> {
  value: T;
  /** Key inside the `profileForm` namespace. */
  labelKey: string;
}

const toOptions = <T extends string>(
  values: readonly T[],
  group: string,
): Option<T>[] =>
  values.map((value) => ({ value, labelKey: `${group}.${value}` }));

export const EDUCATION_OPTIONS = toOptions(EDUCATION_LEVELS, "education");
export const LANGUAGE_OPTIONS = toOptions(LANGUAGE_CODES, "language");
export const RELIGION_OPTIONS = toOptions(RELIGIONS, "religion");
export const TATTOO_OPTIONS = toOptions(TATTOO_LEVELS, "tattoo");
export const FREQUENCY_OPTIONS = toOptions(FREQUENCIES, "frequency");
export const ASSET_OPTIONS = toOptions(ASSET_RANGES, "asset");
export const CHILDREN_OPTIONS = toOptions(CHILDREN_STATUSES, "children");
export const MARITAL_OPTIONS = toOptions(MARITAL_STATUSES, "marital");

/**
 * Residence picker. Kept short on purpose — the real deployment loads the
 * country list from the backend dictionary.
 */
export const COUNTRY_CODES = [
  "CN",
  "RU",
  "US",
  "GB",
  "DE",
  "FR",
  "JP",
  "KR",
  "SG",
  "AU",
  "CA",
  "AE",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export const COUNTRY_OPTIONS = toOptions(COUNTRY_CODES, "country");

/** Height slider bounds, centimetres. */
export const HEIGHT_CM_MIN = 140;
export const HEIGHT_CM_MAX = 210;

/** Age bounds offered by the preference form. */
export const AGE_MIN = 18;
export const AGE_MAX = 80;

/* -------------------------------------------------------------------------- */
/* P3 — premium conditions                                                     */
/* -------------------------------------------------------------------------- */

/** Fields of `PartnerPreferences` that P3 unlocks behind a level. */
export const PREMIUM_PREFERENCE_KEYS = [
  "education",
  "languages",
  "religions",
  "noTattoo",
  "children",
  "assetMin",
  "cities",
] as const;

export type PremiumPreferenceKey = (typeof PREMIUM_PREFERENCE_KEYS)[number];

/**
 * Level required to use each premium condition. P6 keeps this configurable
 * in the admin console; L4 is exempt from every fee.
 */
export const PREMIUM_PREFERENCE_MIN_LEVEL: Record<
  PremiumPreferenceKey,
  UserLevel
> = {
  education: 3,
  languages: 3,
  religions: 3,
  noTattoo: 3,
  children: 3,
  assetMin: 3,
  cities: 3,
};

export const PREMIUM_LEVEL_EXEMPT: UserLevel = 4;

export function isPremiumUnlocked(
  key: PremiumPreferenceKey,
  level: UserLevel,
): boolean {
  return level >= PREMIUM_PREFERENCE_MIN_LEVEL[key];
}

/** True when every premium condition is available to this level. */
export function hasFullPremiumAccess(level: UserLevel): boolean {
  return PREMIUM_PREFERENCE_KEYS.every((key) => isPremiumUnlocked(key, level));
}

/* -------------------------------------------------------------------------- */
/* P4 — individually charged conditions                                        */
/* -------------------------------------------------------------------------- */

/**
 * The demo price list. A real deployment maps condition → fee per country and
 * currency in the admin console (P6); L4 members get them included.
 */
export const EXCLUSIVE_CONDITION_DEFS: ExclusiveConditionDefinition[] = [
  {
    code: "assetThreshold",
    priceUsd: 99,
    levelExempt: 4,
    sensitive: false,
    blockedCountryCodes: [],
  },
  {
    code: "exactRange",
    priceUsd: 59,
    levelExempt: 4,
    sensitive: false,
    blockedCountryCodes: [],
  },
  {
    code: "regionOnly",
    priceUsd: 49,
    levelExempt: 4,
    sensitive: false,
    blockedCountryCodes: [],
  },
  {
    // P4's most sensitive example. P7 requires a region kill switch, so it is
    // off by default and the UI must show a compliance notice before use.
    code: "virginity",
    priceUsd: 199,
    levelExempt: 4,
    sensitive: true,
    blockedCountryCodes: ["DE", "FR", "GB"],
  },
];

export const EXCLUSIVE_CONDITION_COUNT = EXCLUSIVE_CONDITIONS.length;

const EXCLUSIVE_BY_CODE = new Map(
  EXCLUSIVE_CONDITION_DEFS.map((definition) => [definition.code, definition]),
);

export function getExclusiveCondition(
  code: ExclusiveConditionCode,
): ExclusiveConditionDefinition | undefined {
  return EXCLUSIVE_BY_CODE.get(code);
}

export function exclusivePrice(
  code: ExclusiveConditionCode,
  level: UserLevel,
): number {
  const definition = getExclusiveCondition(code);
  if (!definition || level >= definition.levelExempt) {
    return 0;
  }
  return definition.priceUsd;
}

/**
 * P7 — whether a condition may be offered at all in the member's country.
 * Members outside the restricted list never see the option.
 */
export function isExclusiveConditionAvailable(
  code: ExclusiveConditionCode,
  countryCode: string,
): boolean {
  const definition = getExclusiveCondition(code);
  if (!definition) {
    return false;
  }
  return !definition.blockedCountryCodes.includes(countryCode);
}

/** Total of the individually charged conditions, for the cart summary (P4). */
export function exclusiveTotal(
  codes: ExclusiveConditionCode[],
  level: UserLevel,
): number {
  return codes.reduce((total, code) => total + exclusivePrice(code, level), 0);
}

/* -------------------------------------------------------------------------- */
/* Completeness                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Fields counted by the completeness meter. `languages` needs at least one
 * entry; text fields need a non-empty trimmed string.
 */
export function profileCompletion(profile: PersonalProfile): {
  filled: number;
  total: number;
  percent: number;
} {
  const checks = [
    profile.heightCm !== null,
    profile.education !== null,
    profile.languages.length > 0,
    profile.religion !== null,
    profile.tattoo !== null,
    profile.smoking !== null,
    profile.drinking !== null,
    profile.assetRange !== null,
    profile.children !== null,
    profile.maritalStatus !== null,
    profile.occupation.trim().length > 0,
    profile.countryCode.length > 0,
    profile.city.trim().length > 0,
  ];

  const filled = checks.filter(Boolean).length;
  const total = checks.length;

  return { filled, total, percent: Math.round((filled / total) * 100) };
}

/** True once every P1 attribute has a value. */
export function isProfileComplete(profile: PersonalProfile): boolean {
  return profileCompletion(profile).percent === 100;
}

/** True when the member has set at least one partner condition. */
export function hasPreferences(preferences: PartnerPreferences): boolean {
  return (
    preferences.ageMin !== null ||
    preferences.ageMax !== null ||
    preferences.heightMin !== null ||
    preferences.heightMax !== null ||
    preferences.education.length > 0 ||
    preferences.languages.length > 0 ||
    preferences.religions.length > 0 ||
    preferences.noTattoo ||
    preferences.children.length > 0 ||
    preferences.assetMin !== null ||
    preferences.countries.length > 0 ||
    preferences.cities.length > 0 ||
    preferences.smoking !== null ||
    preferences.drinking !== null ||
    preferences.exclusive.length > 0
  );
}
