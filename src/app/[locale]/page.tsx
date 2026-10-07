import {
  Heart,
  Languages,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuroraBackdrop } from "@/components/landing/aurora-backdrop";
import { GhostCta, PrimaryCta } from "@/components/landing/cta";
import { DesktopLanding } from "@/components/landing/desktop/desktop-landing";
import { FeatureCard } from "@/components/landing/feature-card";
import { RotatingTitle } from "@/components/landing/rotating-title";
import { StatsRow } from "@/components/landing/stats-row";
import { VerifiedBadge } from "@/components/landing/verified-badge";
import { AppShell } from "@/components/layout/app-shell";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guest");
  const tc = await getTranslations("common");

  const titles = t.raw("heroTitles") as string[];

  const features = [
    {
      icon: ShieldCheck,
      title: t("featuresVerified"),
      description: t("featuresVerifiedDesc"),
    },
    {
      icon: Sparkles,
      title: t("featuresTier"),
      description: t("featuresTierDesc"),
    },
    {
      icon: Languages,
      title: t("featuresTranslate"),
      description: t("featuresTranslateDesc"),
    },
  ];

  const stats = [
    { value: "120K+", label: t("stats.members") },
    { value: "80+", label: t("stats.countries") },
    { value: "8.4K", label: t("stats.online") },
  ];

  return (
    <>
      {/*
        Below `lg` (H5 + tablet): the original dark aurora landing, unchanged.
        From `lg` up: the long-form marketing home in `landing/desktop`.
        The swap is pure CSS — no viewport JS, so no hydration mismatch.
      */}
      <div className="lg:hidden">
        <AppShell>
          <div className="loono-surface relative flex min-h-full flex-1 flex-col text-white">
            <AuroraBackdrop />

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="relative z-10 mx-auto flex w-full max-w-[64rem] items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 md:px-8">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-opacity hover:opacity-85"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-loono-rose to-loono-violet shadow-[0_6px_18px_-6px] shadow-loono-rose/70">
                  <Heart className="size-4 fill-white text-white" />
                </span>
                <span className="text-base font-bold tracking-tight">
                  {tc("appName")}
                </span>
              </Link>

              <LocaleSwitcher className="glass-pill" />
            </header>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <main className="relative z-10 mx-auto flex w-full max-w-[64rem] flex-1 flex-col px-5 pb-2 md:px-8">
              <section className="flex flex-col items-center gap-5 pt-6 pb-7 text-center md:pt-14 md:pb-12">
                <VerifiedBadge>{t("verifiedBadge")}</VerifiedBadge>

                <h1 className="text-[1.9rem] leading-[1.12] font-bold tracking-tight">
                  <span className="bg-gradient-to-br from-white via-white to-white/75 bg-clip-text text-transparent">
                    {t("heroTitle")}
                  </span>
                  <RotatingTitle
                    phrases={titles}
                    className="mt-1.5 text-[1.6rem] sm:text-[1.9rem]"
                  />
                </h1>

                <p className="max-w-[19rem] text-sm leading-relaxed text-white/65">
                  {t("heroSubtitle")}
                </p>

                <div className="w-full max-w-xs">
                  <StatsRow stats={stats} className="mb-5" />

                  <div className="flex flex-col gap-2.5">
                    <PrimaryCta href="/auth" />
                    <GhostCta href="/catalog">{t("ctaSecondary")}</GhostCta>
                  </div>

                  <p className="mt-3.5 text-[11px] leading-relaxed text-white/45">
                    {t("trustLine")}
                  </p>
                </div>
              </section>

              {/* ── Benefits ─────────────────────────────────────────────────── */}
              <ul className="flex flex-col gap-2.5 pb-3 md:grid md:grid-cols-3 md:gap-3">
                {features.map((feature) => (
                  <FeatureCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </ul>
            </main>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <footer className="relative z-10 mx-auto w-full max-w-[64rem] px-5 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8">
              <Link
                href="/agent/join"
                className="group flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <TrendingUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                {t("agentCta")}
                <span
                  aria-hidden
                  className="text-white/30 transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>

              <p className="pt-1 text-center text-[10px] text-white/30">
                {tc("tagline")}
              </p>
            </footer>
          </div>
        </AppShell>
      </div>

      <div className="hidden lg:block">
        <DesktopLanding locale={locale} />
      </div>
    </>
  );
}
