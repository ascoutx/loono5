/**
 * Platform-side view of the partnership programme (B2B).
 *
 * Distinct from `types/agent` in one important way: that model is what a
 * *partner* sees about themselves (one record, already totalled), while these
 * are what the *operator* sees across the whole roster — including the raw
 * per-day ledger needed to answer "what did partner X do between A and B".
 */

export const PARTNER_TIERS = [
  "online",
  "city",
  "country",
  "shareholder",
] as const;

export type PartnerTier = (typeof PARTNER_TIERS)[number];

export const PARTNER_STATUSES = ["active", "onboarding", "paused"] as const;

export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

/** Kinds of promotion an operator can log against a partner. */
export const PARTNER_ACTIVITY_KINDS = [
  "campaign",
  "offline",
  "webinar",
  "content",
  "referral",
] as const;

export type PartnerActivityKind = (typeof PARTNER_ACTIVITY_KINDS)[number];

/**
 * A string carrying one variant per supported locale.
 *
 * Activities are authored by the partner in their own language, so unlike UI
 * copy they cannot live in the message catalogues — the value travels with
 * the record and the view picks the variant for the active locale.
 */
export interface LocalizedText {
  zh: string;
  en: string;
  ru: string;
}

export interface PartnerProfile {
  id: string;
  /** Trading name shown to the operator. */
  name: string;
  /** Sign-in handle for this partner's own cabinet account. */
  account: string;
  tier: PartnerTier;
  /** Revenue share, 0..1 — mirrors the four tracks of the partnership plan. */
  share: number;
  region: string;
  countryCode: string;
  refCode: string;
  joinedAt: string;
  status: PartnerStatus;
}

/**
 * One day of platform-side ledger for one partner.
 *
 * `date` is a plain `YYYY-MM-DD` string rather than an instant: the reporting
 * window is inclusive and closed at both ends, and same-format date strings
 * compare correctly with `<`/`>`, which keeps the range filter trivial.
 */
export interface PartnerDailyRecord {
  partnerId: string;
  date: string;
  /** Gross member payments booked that day, USD. */
  gross: number;
  /** Commission accrued to the partner that day, USD. */
  commission: number;
  /** Members signed up through the partner that day. */
  signups: number;
  /** Members who made a payment that day. */
  paying: number;
  /** Members active that day (app opened). */
  active: number;
  /** Conversations started between members that day. */
  conversations: number;
}

export interface PartnerActivity {
  id: string;
  partnerId: string;
  kind: PartnerActivityKind;
  title: LocalizedText;
  city: string;
  startAt: string;
  endAt: string;
  /** Members attributed to this activity. */
  signups: number;
  /** Commission attributed to this activity, USD. */
  commission: number;
}

/** Aggregated ledger for one partner over one window. */
export interface PartnerSummary {
  partnerId: string;
  /** Inclusive window the figures cover. */
  from: string;
  to: string;
  /** Days actually present in the window (a partner may have joined mid-way). */
  days: number;
  gross: number;
  commission: number;
  signups: number;
  paying: number;
  active: number;
  conversations: number;
}
