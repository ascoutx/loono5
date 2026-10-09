# LOONO

> 中文版：[README_CN.md](./README_CN.md)

Front-end for a cross-border matchmaking and dating platform. One codebase carries two surfaces that have nothing in common:

| Surface | Audience | Look | Entry |
| --- | --- | --- | --- |
| **B2C consumer site** | Ordinary members | Light luxury | `loono.com` · locally `:3000` |
| **B2B partner console** | Authorised partners / operators | Dark data surface | `partner.loono.com` · locally `:3001` |

The consumer site **never mentions agents or agencies**. Its bottom navigation is fixed at three core tabs (Search, Chats, Me); the only outward-facing offer is "Partners", reached through an application form. The partner console is **behind an account login** and is not linked from the consumer site in either direction.

> This repository is a **front-end prototype**: no backend, no database, the session is emulated with a cookie and all business data is mocked. Each module's comments mark the point at which a real backend takes over.

---

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router / RSC / Server Actions) | 15 |
| Runtime | React | 19 |
| Language | TypeScript (`strict`) | 5 |
| Styling | Tailwind CSS (`@theme` tokens / `oklch()` colour space) | 4 |
| Components | shadcn/ui (`base-nova` style, on top of `@base-ui/react`) | — |
| Icons | lucide-react | — |
| i18n | next-intl (`zh` / `ru` / `en`) | 4 |
| Fonts | Geist / Geist Mono / Noto Sans SC (`next/font`) | — |
| Checks | ESLint (`next/core-web-vitals` + `next/typescript`), Prettier (with `prettier-plugin-tailwindcss`) | 9 / 3 |

Design constraint: a **mobile-first H5** app, tuned for WeChat's in-app browser (zoom disabled, `safe-area-inset` handled), while also scaling up to a desktop canvas.

---

## Getting started

### Requirements

Node.js 20 or newer (Next.js 15 requires 18.18+), npm.

### Install and run

```bash
npm install

# Two terminals (recommended)
npm run dev            # B2C consumer site → http://localhost:3000
npm run dev:partner    # B2B console       → http://localhost:3001

# Or both at once
npm run dev:all
```

The two dev servers **cannot share a build directory**, so `dev:partner` uses `.next-partner` (already excluded in `.gitignore`), driven by the `NEXT_DIST_DIR` environment variable in `next.config.ts`.

The ports can be overridden:

```bash
SITE_PORT=4000 PARTNER_PORT=4001 npm run dev:all
```

### Demo credentials

| Context | Credentials |
| --- | --- |
| Member sign-in (phone + SMS code, mocked) | any phone number, code fixed at `1234` |
| Partner console | account `partner` / password `loono2026` |

The partner account is case-insensitive; member and partner cookies are separate (30 days and 8 hours respectively).

---

## Two-site architecture

In production the split is by **domain**; locally there is no DNS, so it is by **port** — all of it handled in `src/middleware.ts`:

```
partner.loono.com/login      →  rewrite  →  /[locale]/partner/login   (address bar keeps the partner host)
localhost:3001/login         →  rewrite  →  /[locale]/partner/login
localhost:3000/partner/login → redirect 307 → localhost:3001/login    (the /partner prefix is dropped)
```

Three implementation details matter:

1. **Rewrite, not redirect** — visiting `partner.loono.com` in production never changes the address bar to `/partner`.
2. **The rewrite is handed back to next-intl** — the app tree is `[locale]/partner/...`, so a bare `/partner/login` matches no route at all and the intl middleware has to supply the locale segment.
3. **The cross-port bounce is development-only** (`NODE_ENV !== "production"`), so a deployment that happens to listen on port 3000 cannot hijack its own `/partner` traffic.

Route guarding is not done in middleware but at the **page level**: every protected console page calls `requirePartnerSession()` on its first line and bounces to the sign-in screen when there is no session.

---

## Feature list

### B2C consumer site

| Module | Route | Notes |
| --- | --- | --- |
| Landing | `/` | Below `lg`: a light-luxury single page (warm glow backdrop, rotating headline, feature cards, stats row). From `lg` up: a long-form marketing page (Hero / pillars / stories / pricing / FAQ / regions / footer). Pure CSS swap, no viewport JS |
| Sign-in | `/auth` | Phone + SMS code (mocked); WeChat / Apple buttons are placeholders |
| Onboarding | `/onboarding/*` | Five-step wizard: basics → personal attributes → partner preferences → KYC → plan, with a stepper |
| Search (member catalogue) | `/catalog` | Card grid, tab groups (All / Nearby / New / Online), governed by the tier visibility matrix |
| Member profile | `/user/[id]` | Large portrait plus details; a blurred overlay with an upgrade prompt when the tier is out of range |
| Chat list | `/chats` | Conversation list with unread badges; on desktop the list moves into the left rail |
| Chat thread | `/chats/[id]` | Bilingual message bubbles plus composer |
| Me | `/profile` | Identity card, current tier and expiry, profile completeness, preference summary, verification wall, shortcuts |
| Edit profile | `/profile/edit` | Two-tab editor ("Profile" / "Preferences"); `?tab=partner` opens the second directly |
| Subscription | `/profile/subscription` | Plan picker (monthly / yearly, discount badge) |
| Settings | `/settings` | Account / notifications / privacy groups, plus the locale switcher and the deletion entry |
| Delete account | `/settings/delete-account` | A standalone multi-step flow (deliberately outside the tab group so users do not wander off mid-way) |
| Partner application | `/partners/apply` | **The consumer site's only outward-facing partnership door**: four tracks plus a contact form |

### B2B partner console

| Module | Route | Notes |
| --- | --- | --- |
| Sign-in | `/partner/login` | Account and password form, `useActionState` + Server Action |
| Dashboard | `/partner` | The partner's **own** performance board: KPI strip, revenue trend, conversion ratios, recent conversions, payout history |
| Partner lookup | `/partner/agents` | The operator's view: revenue, members and activities for **any partner over any window** |

The `OperatorBar` in the header switches between the two sections and carries the current account and sign-out.

### Cross-cutting capabilities

| Capability | Location |
| --- | --- |
| Three-language copy | `src/messages/{zh,en,ru}.json`, **715 keys**, with identical key sets across locales |
| Locale switcher | `LocaleSwitcher`, with a palette for the light consumer site and another for the dark console |
| Theme tokens | The `@theme` block in `globals.css`: a warm B2C palette plus a charcoal B2B palette |
| Three responsive tiers | `<md` full-bleed H5 · `md–xl` centred single column · `xl+` desktop canvas (side rail replaces the bottom nav) |
| Sessions and guards | `lib/auth/*` (members), `lib/partner/*` (partners) |
| Verification badges | 8 kinds (real name / education / marital / assets / criminal record / occupation / income / property), each with a validity window and a state machine |

---

## Core business rules

The rules come from `PRD.md` and the membership and partnership plan, and live as pure functions under `src/lib/`.

**1. Equal Pay** — every member, regardless of gender, needs an active subscription to browse profiles or chat. See `hasActiveSubscription()` in `lib/tiers.ts`.

**2. Tier visibility matrix** — a member can only see profiles at or below their own level; higher levels stay reachable but are blurred behind an upgrade prompt:

```
L1 → L1
L2 → L1, L2
L3 → L1, L2, L3
```

See `canView()` / `isLocked()` / `visibleLevels()`.

**3. Free trial** — a promo code activates a 30-day Level 1 trial (`TRIAL_DURATION_DAYS`).

**4. Real-time translated, bilingual messages** — every message carries both its original text and a translation. The UI pairs a **primary line with a secondary one**:

- **Primary (large, 15px)** — the text translated into the **current reader's** language
- **Secondary (small, grey, 11px, with a 🈯 icon)** — the sender's original wording

Messages you sent yourself do not repeat the original line. See `components/chat/message-bubble.tsx`.

**5. Four partnership tracks** — track and revenue share: online promoter 50% / city·provincial 60% / country 70% / shareholder 75%, taken from the membership and partnership plan and reflected both in the application form options and in the console's `PartnerTier`.

---

## Route reference

| Path | Group | Notes |
| --- | --- | --- |
| `/` | public | Landing |
| `/auth` | public | Sign-in |
| `/onboarding/profile` · `attributes` · `partner` · `kyc` · `subscription` | public | The five onboarding steps |
| `/partners/apply` | public | Partner application |
| `/agent/join` | — | **Redirect** → `/partners/apply` (keeps old links and printed QR codes alive) |
| `/catalog` · `/user/[id]` · `/chats` · `/chats/[id]` · `/profile` · `/profile/edit` · `/profile/subscription` · `/settings` | `(main)` | Signed-in body, sharing the bottom tab bar |
| `/settings/delete-account` | public | Deletion flow (no tab bar) |
| `/agent/dashboard` | — | **Redirect** → `/partner` |
| `/partner/login` | `/partner` | B2B sign-in |
| `/partner` · `/partner/agents` | `/partner` | B2B dashboard and lookup (**guarded**) |

`(main)` is a route group and never appears in the URL — it lets the bottom navigation be reused across every signed-in screen while keeping the URLs identical to the PRD sitemap.

---

## Directory layout

```
src/
├── app/
│   ├── globals.css             # Theme tokens (@theme) and both surfaces
│   ├── layout.tsx  · not-found.tsx  · favicon.ico
│   └── [locale]/
│       ├── layout.tsx          # Fonts, metadata, viewport, NextIntlClientProvider
│       ├── page.tsx            # Landing (mobile and desktop trees)
│       ├── (main)/             # Signed-in body (with the bottom tabs)
│       ├── onboarding/         # The five onboarding steps
│       ├── partners/apply/     # Partner application
│       ├── partner/            # B2B console (login / dashboard / agents)
│       ├── agent/              # Legacy path redirects
│       └── settings/           # Account deletion
├── components/
│   ├── ui/                     # 19 shadcn primitives
│   ├── layout/                 # AppShell / AppFrame / bottom nav / side rail / headers
│   ├── landing/                # Mobile landing pieces + desktop/ long-form page
│   ├── chat/  catalog/  profile/  onboarding/  account/  auth/  agent/
│   └── partner/                # Forms, filter bar, operator bar, panel, chart
├── i18n/                       # routing / request / navigation
├── lib/
│   ├── auth/                   # Member session and current user
│   ├── partner/                # Console session, sign-in action, partner data and query layer
│   ├── mock-data.ts            # Members, messages, threads, plans, the partner's own dashboard
│   ├── tiers.ts  plans.ts  agent.ts  profile-options.ts  verification.ts  utils.ts
├── messages/                   # zh.json / en.json / ru.json
├── types/                      # user / chat / agent / partner / profile / verification
└── middleware.ts               # Domain + port routing, locale handling
```

Roughly 125 source files, 22 routed pages and 65 feature components.

---

## Internationalisation

- Locales: `zh` (default) / `ru` / `en`, configured in `src/i18n/routing.ts`.
- `localePrefix: "as-needed"` — the default locale carries no prefix (`/catalog`), the others do (`/ru/catalog`, `/en/catalog`).
- Copy is grouped into 20 namespaces (`common` / `nav` / `guest` / `portal` / `auth` / `onboarding` / `catalog` / `user` / `verification` / `chats` / `profile` / `profileForm` / `partnerPref` / `subscription` / `settings` / `deleteAccount` / `agent` / `tier` / `partners` / `partner`).
- **Careful**: `t()` only resolves string leaves. Asking for an object-shaped namespace throws `INSUFFICIENT_PATH` and then **silently falls back to the raw key without reporting anything** — use `t.raw()` to pull a whole array or object.

When adding copy, all three locales must move together: key sets and placeholders have to stay aligned.

---

## Theme and responsive behaviour

**B2C "Soft Porcelain"** — warm ivory canvas, pure white cards, ink text and champagne accents (`.loono-surface` / `.glass-card` / `.loono-cta`).

**B2B data surface** — charcoal panels, a 32px engineering grid, a sky-blue accent and large tabular figures (`.partner-surface` / `.partner-panel`).

Responsiveness runs entirely on **CSS breakpoints** (`lg:hidden` / `hidden lg:block` swapping two trees) and **never reads the viewport size**, which keeps hydration from mismatching.

---

## Data and mocks

- Members, threads, messages, plans and the partner's own dashboard live in `src/lib/mock-data.ts`.
- The console's **partner roster and daily ledger** live in `src/lib/partner/mock-agents.ts`: eight partners plus roughly 190 days of ledger, **generated deterministically from a seeded PRNG (mulberry32)**. That keeps it byte-stable across renders (a mock that reshuffled would make the date filter look broken), and the window is **anchored to today** (a fixed end date would leave presets like "last 7 days" empty within days). One partner stops trading mid-window, which gives the range filter and the empty state something real to prove themselves against.
- Querying and aggregation are **pure functions** in `src/lib/partner/query.ts`: window parsing (presets / custom / bounds checking / a 366-day cap), summarising, day-week-month bucketing and roster totals. They are decoupled from the UI so the real reporting endpoint can drop in behind them.

---

## Scripts

```bash
npm run dev            # B2C on :3000
npm run dev:partner    # B2B on :3001, separate build directory
npm run dev:all        # both at once
npm run build          # production build
npm run start          # production server
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run format         # Prettier, writing
npm run format:check   # Prettier, checking
```

Conventions:

- Path alias `@/*` → `src/*` (`tsconfig.json`).
- Prettier ships `prettier-plugin-tailwindcss`, which sorts class names against `globals.css`; `.md` is not in scope.
- shadcn configuration lives in `components.json` (style `base-nova`, lucide icons, CSS variables).
- `@base-ui/react` controlled-component quirks: `RadioGroup` takes `value` / `onValueChange`, `Checkbox` takes `checked` / `onCheckedChange`.
- Next.js writes `.next-partner/types/**/*.ts` into the `include` array of `tsconfig.json` by itself; that is expected.

---

## What to replace when a backend lands

| Location | Today | Todo |
| --- | --- | --- |
| `lib/auth/*` | Cookie-based mock session, SMS code fixed at `1234` | A real SMS / session service |
| `lib/partner/{constants,session,actions}.ts` | Hard-coded credentials | A partner identity service plus rate limiting and lockout |
| `lib/mock-data.ts` | Static mock data | Member, messaging and subscription APIs |
| `lib/partner/mock-agents.ts` | Seeded ledger | A reporting endpoint, keeping the input shape `query.ts` expects |
| `components/partner/apply-form.tsx` | `handleSubmit` is a local stub | `POST /partners/applications`, with server-side rate limiting and a captcha (the endpoint is public by definition) |
| `components/agent/promo-tools.tsx` | Referral link and promo codes are placeholders | The referral tooling API |

---

## Related documents

- `PRD.md` — the product requirements and tech-stack baseline, including the sitemap and the core rules.
