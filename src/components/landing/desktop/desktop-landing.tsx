import { SoftBackdrop } from "@/components/landing/soft-backdrop";

import { DesktopFooter } from "./desktop-footer";
import { DesktopHeader } from "./desktop-header";
import { DesktopHero } from "./desktop-hero";
import { FaqSection } from "./faq-section";
import { PillarSection } from "./pillar-section";
import { PricingSection } from "./pricing-section";
import { RegionsSection } from "./regions-section";
import { StoriesSection } from "./stories-section";

/**
 * A second, much wider scatter of warm light.
 *
 * The hero backdrop only lights the first viewport; the page is several
 * thousand pixels tall, so without these the lower half reads as flat paper.
 * Opacity is kept very low — on an ivory canvas these have to whisper.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute top-[14%] -left-40 size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.93_0.05_45/0.7),transparent_70%)] blur-3xl" />
      <div className="absolute top-[42%] -right-48 size-[460px] rounded-full bg-[radial-gradient(circle,oklch(0.94_0.05_82/0.65),transparent_70%)] blur-3xl" />
      <div className="absolute top-[68%] left-1/4 size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.95_0.03_20/0.6),transparent_70%)] blur-3xl" />
    </div>
  );
}

/**
 * Desktop-only home page.
 *
 * Information architecture follows a classic long-form dating-site landing
 * (hero → three pillars → social proof → pricing → FAQ → local links →
 * footer). The palette is the B2C light-luxury surface: ivory canvas, white
 * cards, ink type, champagne accents — the same one the H5 landing uses.
 *
 * Rendered from `lg` up. Below that the H5 landing takes over — the two trees
 * are swapped purely in CSS, so there is no viewport JS and no hydration
 * mismatch.
 */
export async function DesktopLanding({ locale }: { locale: string }) {
  return (
    <div className="loono-surface relative min-h-dvh text-foreground">
      <SoftBackdrop />
      <AmbientGlow />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <DesktopHeader />

        <main className="flex-1">
          <DesktopHero />
          <PillarSection />
          <StoriesSection />
          <PricingSection locale={locale} />
          <FaqSection />
          <RegionsSection />
        </main>

        <DesktopFooter />
      </div>
    </div>
  );
}
