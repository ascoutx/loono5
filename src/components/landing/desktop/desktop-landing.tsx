import { AuroraBackdrop } from "@/components/landing/aurora-backdrop";

import { DesktopFooter } from "./desktop-footer";
import { DesktopHeader } from "./desktop-header";
import { DesktopHero } from "./desktop-hero";
import { FaqSection } from "./faq-section";
import { PillarSection } from "./pillar-section";
import { PricingSection } from "./pricing-section";
import { RegionsSection } from "./regions-section";
import { StoriesSection } from "./stories-section";

/**
 * A second, wider scatter of aurora blobs.
 *
 * The hero backdrop only lights the first viewport; the page is several
 * thousand pixels tall, so without these the lower half reads as flat black.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute top-[14%] -left-40 size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.21_290/0.22),transparent_70%)] blur-3xl" />
      <div className="absolute top-[42%] -right-48 size-[460px] rounded-full bg-[radial-gradient(circle,oklch(0.72_0.19_350/0.16),transparent_70%)] blur-3xl" />
      <div className="absolute top-[68%] left-1/4 size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.45_0.15_265/0.22),transparent_70%)] blur-3xl" />
    </div>
  );
}

/**
 * Desktop-only home page.
 *
 * Information architecture follows a classic long-form dating-site landing
 * (hero → three pillars → social proof → pricing → FAQ → local links →
 * footer); the palette is LOONO's own dark aurora surface, unchanged.
 *
 * Rendered from `lg` up. Below that the H5 landing takes over — the two trees
 * are swapped purely in CSS, so there is no viewport JS and no hydration
 * mismatch.
 */
export async function DesktopLanding({ locale }: { locale: string }) {
  return (
    <div className="loono-surface relative min-h-dvh text-white">
      <AuroraBackdrop />
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
