# PRD: LOONO - International H5 Dating Platform

## Tech Stack
- Framework: Next.js 15 (App Router, TypeScript)
- Styling: Tailwind CSS, Shadcn UI, Lucide Icons
- i18n: next-intl (Locales: zh, ru, en)
- Layout: Mobile-First H5 (optimized for WeChat browser & mobile web)

## Key Product Logic
1. Equal Pay Rule: All users (men and women) must have an active tier/subscription to view profiles and chat.
2. Tier Visibility Matrix:
   - User Level 1: can view Level 1 profiles.
   - User Level 2: can view Level 1 & 2 profiles.
   - User Level 3: can view Level 1, 2 & 3 profiles.
   - Higher-tier profiles appear blurred with an "Upgrade Level" overlay.
3. Free Trial: 30-day trial for Level 1 activated via promo codes.
4. Real-time Chat with Auto-translation: Dual-text display (Original text + Translated text in CN/RU/EN).
5. Agent / Referral Program:
   - Commission rates: 50% (Base), 60% (Pro), 70% (VIP).
   - Agent tools: Custom ref links, 30-day promo code generator, payout request interface.

## App Sitemap & Routes
- Guest: `/`, `/auth`, `/agent/join`
- Onboarding: `/onboarding/profile`, `/onboarding/kyc`, `/onboarding/subscription`
- Main App: `/catalog`, `/user/:id`, `/chats`, `/chats/:id`
- User Profile: `/profile`, `/profile/subscription`, `/settings`
- Agent Portal: `/agent/dashboard`