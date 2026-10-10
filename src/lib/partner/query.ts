import type {
  PartnerActivity,
  PartnerDailyRecord,
  PartnerProfile,
  PartnerSummary,
} from "@/types/partner";

import {
  partnerActivities,
  partnerLedger,
  partnerProfiles,
} from "./mock-agents";

/**
 * Query layer for the operator's partner lookup.
 *
 * Everything here is a pure function over the ledger: parse the requested
 * window, filter, aggregate. Keeping it separate from both the mock data and
 * the page means the reporting endpoint can replace `mock-agents` without
 * touching the filter UI, and the range rules are testable on their own.
 */

/* ───────────────────────────── window parsing ───────────────────────────── */

export const RANGE_PRESETS = ["7d", "30d", "90d", "ytd"] as const;

export type RangePreset = (typeof RANGE_PRESETS)[number];

export const DEFAULT_PRESET: RangePreset = "30d";

/** Guards against someone hand-editing `?from=1900-01-01`. */
export const MAX_RANGE_DAYS = 366;

export interface ResolvedRange {
  /** Inclusive first day, `YYYY-MM-DD`. */
  from: string;
  /** Inclusive last day, `YYYY-MM-DD`. */
  to: string;
  /** Preset that produced the window, or null for a custom one. */
  preset: RangePreset | null;
  /** Set when the requested input was unusable and the default was applied. */
  fellBack: boolean;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True only for a real calendar day in `YYYY-MM-DD` form. */
export function isIsoDate(value: string | undefined): value is string {
  if (!value || !DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDays(date: string, days: number): string {
  const cursor = new Date(`${date}T00:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + days);
  return cursor.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  return Math.round((end - start) / 86_400_000) + 1;
}

export function isRangePreset(value: string | undefined): value is RangePreset {
  return !!value && (RANGE_PRESETS as readonly string[]).includes(value);
}

function presetWindow(
  preset: RangePreset,
  today: string,
): { from: string; to: string } {
  if (preset === "ytd") {
    return { from: `${today.slice(0, 4)}-01-01`, to: today };
  }
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  return { from: shiftDays(today, -(days - 1)), to: today };
}

export interface RangeInput {
  preset?: string;
  from?: string;
  to?: string;
}

/**
 * Turns raw search params into a usable window.
 *
 * Explicit dates win over the preset (so editing a date field after clicking
 * "last 7 days" does the obvious thing). A reversed pair is swapped rather
 * than rejected — picking the end before the start is a slip, not an error.
 */
export function resolveRange(
  input: RangeInput,
  today: string = todayIso(),
): ResolvedRange {
  if (isIsoDate(input.from) && isIsoDate(input.to)) {
    let from = input.from;
    let to = input.to;
    if (from > to) {
      [from, to] = [to, from];
    }
    if (daysBetween(from, to) > MAX_RANGE_DAYS) {
      from = shiftDays(to, -(MAX_RANGE_DAYS - 1));
    }
    return { from, to, preset: null, fellBack: false };
  }

  if (isRangePreset(input.preset)) {
    return {
      ...presetWindow(input.preset, today),
      preset: input.preset,
      fellBack: false,
    };
  }

  // Nothing usable was asked for: that is a first visit, not a failure, so
  // fall back to the default window without flagging it. Only a request that
  // *did* carry params and still could not be honoured counts as a fallback.
  const requested = Boolean(input.preset || input.from || input.to);

  return {
    ...presetWindow(DEFAULT_PRESET, today),
    preset: DEFAULT_PRESET,
    fellBack: requested,
  };
}

/* ─────────────────────────────── aggregation ─────────────────────────────── */

export type PartnerTotals = Omit<
  PartnerSummary,
  "partnerId" | "from" | "to" | "days"
>;

const EMPTY_TOTALS: PartnerTotals = {
  gross: 0,
  commission: 0,
  signups: 0,
  paying: 0,
  active: 0,
  conversations: 0,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function inRange(record: PartnerDailyRecord, range: ResolvedRange): boolean {
  return record.date >= range.from && record.date <= range.to;
}

export function summarizeRecords(records: PartnerDailyRecord[]): PartnerTotals {
  const totals = records.reduce<PartnerTotals>(
    (acc, record) => {
      acc.gross += record.gross;
      acc.commission += record.commission;
      acc.signups += record.signups;
      acc.paying += record.paying;
      acc.active += record.active;
      acc.conversations += record.conversations;
      return acc;
    },
    { ...EMPTY_TOTALS },
  );

  return {
    gross: round2(totals.gross),
    commission: round2(totals.commission),
    signups: totals.signups,
    paying: totals.paying,
    active: totals.active,
    conversations: totals.conversations,
  };
}

function recordsFor(
  partnerId: string,
  range: ResolvedRange,
): PartnerDailyRecord[] {
  return partnerLedger.filter(
    (record) => record.partnerId === partnerId && inRange(record, range),
  );
}

export function summarizePartner(
  partnerId: string,
  range: ResolvedRange,
): PartnerSummary {
  const records = recordsFor(partnerId, range);
  return {
    partnerId,
    from: range.from,
    to: range.to,
    days: records.length,
    ...summarizeRecords(records),
  };
}

export interface RosterRow {
  partner: PartnerProfile;
  totals: PartnerTotals;
  /** Days of ledger actually present in the window. */
  days: number;
}

/** Every partner for the window, biggest earner first. */
export function buildRoster(range: ResolvedRange): RosterRow[] {
  return partnerProfiles
    .map((partner) => {
      const records = recordsFor(partner.id, range);
      return {
        partner,
        totals: summarizeRecords(records),
        days: records.length,
      };
    })
    .sort((a, b) => b.totals.commission - a.totals.commission);
}

/* ──────────────────────────────── trend line ─────────────────────────────── */

export type BucketUnit = "day" | "week" | "month";

export interface TrendPoint {
  key: string;
  label: string;
  amount: number;
}

/** Coarser buckets as the window grows, so the chart stays readable. */
export function bucketUnitFor(range: ResolvedRange): BucketUnit {
  const span = daysBetween(range.from, range.to);
  if (span <= 45) {
    return "day";
  }
  if (span <= 200) {
    return "week";
  }
  return "month";
}

/** Monday of the week containing `date`. */
function weekStart(date: string): string {
  const cursor = new Date(`${date}T00:00:00.000Z`);
  const weekday = (cursor.getUTCDay() + 6) % 7; // 0 = Monday
  cursor.setUTCDate(cursor.getUTCDate() - weekday);
  return cursor.toISOString().slice(0, 10);
}

function bucketKey(date: string, unit: BucketUnit): string {
  if (unit === "month") {
    return date.slice(0, 7);
  }
  return unit === "week" ? weekStart(date) : date;
}

function bucketLabel(key: string, unit: BucketUnit): string {
  return unit === "month" ? key : key.slice(5);
}

/**
 * Commission per bucket across the whole window.
 *
 * Empty buckets are kept (at zero) so the line reflects the real shape of the
 * period rather than collapsing gaps — a partner who stopped trading halfway
 * through should read as a drop, not as a shorter line.
 */
export function buildTrend(
  records: PartnerDailyRecord[],
  range: ResolvedRange,
): TrendPoint[] {
  const unit = bucketUnitFor(range);
  const buckets = new Map<string, number>();

  for (let date = range.from; date <= range.to; date = shiftDays(date, 1)) {
    buckets.set(bucketKey(date, unit), 0);
  }

  for (const record of records) {
    if (!inRange(record, range)) {
      continue;
    }
    const key = bucketKey(record.date, unit);
    buckets.set(key, (buckets.get(key) ?? 0) + record.commission);
  }

  return [...buckets.entries()].map(([key, amount]) => ({
    key,
    label: bucketLabel(key, unit),
    amount: round2(amount),
  }));
}

/** Trend for one partner over a window. */
export function partnerTrend(
  partnerId: string,
  range: ResolvedRange,
): TrendPoint[] {
  return buildTrend(recordsFor(partnerId, range), range);
}

/* ──────────────────────────────── activities ─────────────────────────────── */

/** Activities that *overlap* the window — a campaign spanning the boundary counts. */
export function partnerActivitiesInRange(
  partnerId: string,
  range: ResolvedRange,
): PartnerActivity[] {
  return partnerActivities
    .filter(
      (activity) =>
        activity.partnerId === partnerId &&
        activity.startAt <= range.to &&
        activity.endAt >= range.from,
    )
    .sort((a, b) => (a.startAt < b.startAt ? 1 : -1));
}

/* ──────────────────────────────── derived ratios ─────────────────────────── */

/** Average commission per trading day, rounded to cents. */
export function dailyAverage(totals: PartnerTotals, days: number): number {
  return days > 0 ? round2(totals.commission / days) : 0;
}

/** Gross per paying member, rounded to cents. */
export function arpu(totals: PartnerTotals): number {
  return totals.paying > 0 ? round2(totals.gross / totals.paying) : 0;
}

/** Commission actually earned per dollar of member spend, 0..1. */
export function effectiveShare(totals: PartnerTotals): number {
  return totals.gross > 0 ? totals.commission / totals.gross : 0;
}

/** Share of signups that went on to pay within the window, 0..1. */
export function payRate(totals: PartnerTotals): number {
  return totals.signups > 0 ? Math.min(1, totals.paying / totals.signups) : 0;
}
