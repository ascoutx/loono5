import type {
  LocalizedText,
  PartnerActivity,
  PartnerActivityKind,
  PartnerDailyRecord,
  PartnerProfile,
  PartnerStatus,
  PartnerTier,
} from "@/types/partner";

/**
 * Platform-side partner roster and ledger (placeholder data).
 *
 * Until now the cabinet only ever showed one hard-coded partner — the signed-in
 * one, already totalled (see `currentAgent` in `lib/mock-data`). Operators need
 * the *roster* plus the ability to look up any single partner over an arbitrary
 * window, so this module carries eight partners and a per-day ledger for each.
 *
 * Two deliberate choices:
 *
 * 1. The ledger is generated from a seeded PRNG rather than written out. It has
 *    to be byte-stable across renders — a mock that reshuffles on every request
 *    would make the date filter look broken — and 8 partners x ~190 days is far
 *    too much to maintain as a literal.
 * 2. The window is anchored to *today* rather than a fixed end date, so the
 *    "last 7 days" preset kept working after the week this was written.
 *
 * Replace `partnerLedger` and `partnerActivities` with the real reporting
 * endpoint when it lands; the shapes are what the query layer expects.
 */

/** Earliest day the ledger covers; partners who joined later simply start later. */
const LEDGER_START = "2026-04-01";

/** Relative size of a partner's book. Drives the generated daily figures. */
interface PartnerSeed {
  profile: PartnerProfile;
  /** 1 = a modest online partner, 8 = a shareholder-tier book. */
  scale: number;
  /** Stops the ledger early — models a partner who left mid-window. */
  until?: string;
}

const SEEDS: PartnerSeed[] = [
  {
    profile: {
      id: "pt_01",
      name: "Nordic Match Group",
      account: "nordic-match",
      tier: "city",
      share: 0.6,
      region: "Stockholm, Sweden",
      countryCode: "SE",
      refCode: "NORDIC60",
      joinedAt: "2025-11-04T00:00:00.000Z",
      status: "active",
    },
    scale: 3.4,
  },
  {
    profile: {
      id: "pt_02",
      name: "Sakura Bridge",
      account: "sakura-bridge",
      tier: "city",
      share: 0.6,
      region: "Tokyo, Japan",
      countryCode: "JP",
      refCode: "SAKURA60",
      joinedAt: "2026-01-19T00:00:00.000Z",
      status: "active",
    },
    scale: 2.6,
  },
  {
    profile: {
      id: "pt_03",
      name: "Atlas Union",
      account: "atlas-union",
      tier: "country",
      share: 0.7,
      region: "Kazakhstan",
      countryCode: "KZ",
      refCode: "ATLAS70",
      joinedAt: "2025-08-22T00:00:00.000Z",
      status: "active",
    },
    scale: 5.8,
  },
  {
    profile: {
      id: "pt_04",
      name: "Moskva Svyaz",
      account: "moskva-svyaz",
      tier: "country",
      share: 0.7,
      region: "Moscow, Russia",
      countryCode: "RU",
      refCode: "MOSKVA70",
      joinedAt: "2025-06-30T00:00:00.000Z",
      status: "active",
    },
    scale: 7.1,
  },
  {
    profile: {
      id: "pt_05",
      name: "Estrella Latina",
      account: "estrella-latina",
      tier: "city",
      share: 0.6,
      region: "Mexico City, Mexico",
      countryCode: "MX",
      refCode: "ESTRELLA60",
      joinedAt: "2026-03-12T00:00:00.000Z",
      status: "paused",
    },
    scale: 2.1,
    // Stopped trading partway through the window — exercises the range filter.
    until: "2026-08-14",
  },
  {
    profile: {
      id: "pt_06",
      name: "Global Hearts Fund",
      account: "global-hearts",
      tier: "shareholder",
      share: 0.75,
      region: "Singapore",
      countryCode: "SG",
      refCode: "GHF75",
      joinedAt: "2025-04-02T00:00:00.000Z",
      status: "active",
    },
    scale: 8.2,
  },
  {
    profile: {
      id: "pt_07",
      name: "Dubai Match Lab",
      account: "dubai-match-lab",
      tier: "online",
      share: 0.5,
      region: "Dubai, United Arab Emirates",
      countryCode: "AE",
      refCode: "DUBAI50",
      joinedAt: "2026-05-27T00:00:00.000Z",
      status: "onboarding",
    },
    scale: 1.1,
  },
  {
    profile: {
      id: "pt_08",
      name: "Rhein Liebe",
      account: "rhein-liebe",
      tier: "city",
      share: 0.6,
      region: "Frankfurt, Germany",
      countryCode: "DE",
      refCode: "RHEIN60",
      joinedAt: "2026-02-08T00:00:00.000Z",
      status: "active",
    },
    scale: 3.9,
  },
];

export const partnerProfiles: PartnerProfile[] = SEEDS.map(
  (seed) => seed.profile,
);

export function findPartner(id: string): PartnerProfile | undefined {
  return partnerProfiles.find((partner) => partner.id === id);
}

/* ─────────────────────────── ledger generation ─────────────────────────── */

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Ledger end — the newest day any partner can have figures for. */
export const LEDGER_END = todayIso();

/** FNMIX-style string hash, used to seed each partner's generator. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — tiny deterministic PRNG so the ledger never shifts between renders. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shiftDays(date: string, days: number): string {
  const cursor = new Date(`${date}T00:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + days);
  return cursor.toISOString().slice(0, 10);
}

/** Inclusive list of `YYYY-MM-DD` days between two dates. */
function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = shiftDays(cursor, 1);
  }
  return days;
}

/** If the clock is somehow behind the fixed start, fall back to a 90-day window. */
const LEDGER_FROM =
  LEDGER_START < LEDGER_END ? LEDGER_START : shiftDays(LEDGER_END, -90);

const DAYS = eachDay(LEDGER_FROM, LEDGER_END);

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Weekends run quieter on a matchmaking platform, not busier. */
function weekendFactor(date: string): number {
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return weekday === 0 || weekday === 6 ? 0.72 : 1;
}

function buildLedger(seed: PartnerSeed): PartnerDailyRecord[] {
  const rand = seededRandom(hash(seed.profile.id));
  const joined = seed.profile.joinedAt.slice(0, 10);
  const until = seed.until ?? LEDGER_END;
  const last = DAYS.length - 1;
  const records: PartnerDailyRecord[] = [];

  DAYS.forEach((date, index) => {
    if (date < joined || date > until) {
      return;
    }

    // The book ramps up over the window, breathes on a slow cycle, and takes
    // day-to-day noise on top. Every branch calls rand() the same number of
    // times so a given partner always produces the same series.
    const progress = last === 0 ? 1 : index / last;
    const ramp = 0.55 + 0.9 * progress;
    const pulse = 1 + Math.sin(index / 11) * 0.15;
    const gross =
      seed.scale *
      120 *
      ramp *
      weekendFactor(date) *
      (0.6 + rand() * 0.9) *
      pulse;

    const signups = Math.max(
      0,
      Math.round(
        seed.scale * 1.6 * ramp * weekendFactor(date) * (0.5 + rand() * 1.1),
      ),
    );
    const paying = Math.max(0, Math.round(signups * (0.35 + rand() * 0.45)));
    const standing = Math.round(seed.scale * 45 * ramp);
    const active = standing + Math.round(signups * (2 + rand() * 3));
    const conversations =
      Math.round(signups * (0.6 + rand())) + Math.round(active * 0.35);

    records.push({
      partnerId: seed.profile.id,
      date,
      gross: round2(gross),
      commission: round2(gross * seed.profile.share),
      signups,
      paying,
      active,
      conversations,
    });
  });

  return records;
}

export const partnerLedger: PartnerDailyRecord[] = SEEDS.flatMap(buildLedger);

/* ────────────────────────────── activities ────────────────────────────── */

interface ActivitySeed {
  partnerId: string;
  kind: PartnerActivityKind;
  title: LocalizedText;
  city: string;
  /** Days between the activity's last day and the ledger end. */
  daysAgo: number;
  /** Duration in days. */
  span: number;
  signups: number;
  commission: number;
}

const ACTIVITY_SEEDS: ActivitySeed[] = [
  {
    partnerId: "pt_01",
    kind: "offline",
    title: {
      zh: "斯德哥尔摩春季单身之夜",
      en: "Stockholm spring singles night",
      ru: "Весенний вечер знакомств в Стокгольме",
    },
    city: "Stockholm",
    daysAgo: 96,
    span: 1,
    signups: 62,
    commission: 1180.4,
  },
  {
    partnerId: "pt_01",
    kind: "webinar",
    title: {
      zh: "北欧会员线上答疑会",
      en: "Nordic members online clinic",
      ru: "Онлайн-встреча с участниками из Скандинавии",
    },
    city: "Stockholm",
    daysAgo: 24,
    span: 1,
    signups: 41,
    commission: 806.2,
  },
  {
    partnerId: "pt_02",
    kind: "content",
    title: {
      zh: "东京婚活专栏连载",
      en: "Tokyo matchmaking column",
      ru: "Колонка о знакомствах в Токио",
    },
    city: "Tokyo",
    daysAgo: 63,
    span: 30,
    signups: 88,
    commission: 1425.9,
  },
  {
    partnerId: "pt_02",
    kind: "offline",
    title: {
      zh: "大阪联合相亲会",
      en: "Osaka joint meetup",
      ru: "Совместная встреча в Осаке",
    },
    city: "Osaka",
    daysAgo: 18,
    span: 1,
    signups: 54,
    commission: 998.3,
  },
  {
    partnerId: "pt_03",
    kind: "campaign",
    title: {
      zh: "阿拉木图地铁灯箱投放",
      en: "Almaty metro lightbox campaign",
      ru: "Кампания на световых панелях метро Алматы",
    },
    city: "Almaty",
    daysAgo: 74,
    span: 21,
    signups: 213,
    commission: 3260.7,
  },
  {
    partnerId: "pt_03",
    kind: "referral",
    title: {
      zh: "与本地婚庆机构互推",
      en: "Cross-promotion with a local wedding agency",
      ru: "Взаимный промоушен со свадебным агентством",
    },
    city: "Astana",
    daysAgo: 29,
    span: 14,
    signups: 137,
    commission: 2418.5,
  },
  {
    partnerId: "pt_04",
    kind: "campaign",
    title: {
      zh: "莫斯科冬季品牌搜索投放",
      en: "Moscow winter search campaign",
      ru: "Зимняя поисковая кампания в Москве",
    },
    city: "Moscow",
    daysAgo: 118,
    span: 30,
    signups: 348,
    commission: 5120.6,
  },
  {
    partnerId: "pt_04",
    kind: "webinar",
    title: {
      zh: "圣彼得堡线下宣讲会",
      en: "Saint Petersburg information session",
      ru: "Презентация в Санкт-Петербурге",
    },
    city: "Saint Petersburg",
    daysAgo: 41,
    span: 1,
    signups: 176,
    commission: 2874.1,
  },
  {
    partnerId: "pt_04",
    kind: "offline",
    title: {
      zh: "叶卡捷琳堡会员见面会",
      en: "Yekaterinburg member meetup",
      ru: "Встреча участников в Екатеринбурге",
    },
    city: "Yekaterinburg",
    daysAgo: 9,
    span: 2,
    signups: 121,
    commission: 1962.4,
  },
  {
    partnerId: "pt_05",
    kind: "offline",
    title: {
      zh: "墨西哥城文化之夜",
      en: "Mexico City culture night",
      ru: "Вечер культуры в Мехико",
    },
    city: "Mexico City",
    daysAgo: 132,
    span: 1,
    signups: 47,
    commission: 682.9,
  },
  {
    partnerId: "pt_05",
    kind: "content",
    title: {
      zh: "拉美婚恋播客合作",
      en: "Latin America podcast partnership",
      ru: "Партнёрство с подкастом о знакомствах",
    },
    city: "Guadalajara",
    daysAgo: 78,
    span: 28,
    signups: 73,
    commission: 1013.5,
  },
  {
    partnerId: "pt_06",
    kind: "campaign",
    title: {
      zh: "东南亚联合品牌投放",
      en: "Southeast Asia co-branded campaign",
      ru: "Совместная кампания в Юго-Восточной Азии",
    },
    city: "Singapore",
    daysAgo: 87,
    span: 35,
    signups: 402,
    commission: 6842.3,
  },
  {
    partnerId: "pt_06",
    kind: "webinar",
    title: {
      zh: "高净值会员闭门沙龙",
      en: "Private salon for high-net-worth members",
      ru: "Закрытый салон для состоятельных участников",
    },
    city: "Singapore",
    daysAgo: 33,
    span: 1,
    signups: 158,
    commission: 4188.7,
  },
  {
    partnerId: "pt_06",
    kind: "referral",
    title: {
      zh: "与区域家族办公室合作",
      en: "Partnership with a regional family office",
      ru: "Партнёрство с региональным family office",
    },
    city: "Kuala Lumpur",
    daysAgo: 12,
    span: 21,
    signups: 96,
    commission: 2540.9,
  },
  {
    partnerId: "pt_07",
    kind: "campaign",
    title: {
      zh: "迪拜试运营导流测试",
      en: "Dubai soft-launch traffic test",
      ru: "Тест трафика на мягком запуске в Дубае",
    },
    city: "Dubai",
    daysAgo: 37,
    span: 14,
    signups: 34,
    commission: 291.6,
  },
  {
    partnerId: "pt_08",
    kind: "offline",
    title: {
      zh: "法兰克福跨境相亲专场",
      en: "Frankfurt cross-border matchmaking event",
      ru: "Мероприятие по трансграничным знакомствам во Франкфурте",
    },
    city: "Frankfurt",
    daysAgo: 55,
    span: 1,
    signups: 109,
    commission: 1744.2,
  },
  {
    partnerId: "pt_08",
    kind: "content",
    title: {
      zh: "德语区婚恋专栏合作",
      en: "German-language matchmaking column",
      ru: "Колонка о знакомствах на немецком языке",
    },
    city: "Berlin",
    daysAgo: 20,
    span: 30,
    signups: 84,
    commission: 1398.6,
  },
];

export const partnerActivities: PartnerActivity[] = ACTIVITY_SEEDS.map(
  (seed, index) => {
    const end = shiftDays(LEDGER_END, -seed.daysAgo);
    return {
      id: `act_${String(index + 1).padStart(2, "0")}`,
      partnerId: seed.partnerId,
      kind: seed.kind,
      title: seed.title,
      city: seed.city,
      startAt: shiftDays(end, -(seed.span - 1)),
      endAt: end,
      signups: seed.signups,
      commission: seed.commission,
    };
  },
);

/** Tier → advertised revenue share, kept in step with the partnership plan. */
export const TIER_SHARE: Record<PartnerTier, number> = {
  online: 0.5,
  city: 0.6,
  country: 0.7,
  shareholder: 0.75,
};

export const STATUS_ORDER: Record<PartnerStatus, number> = {
  active: 0,
  onboarding: 1,
  paused: 2,
};
