import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container, Section, SectionHeading } from "./section";

interface FaqItem {
  q: string;
  a: string;
}

/**
 * Accordion built on native `<details>`.
 *
 * Zero JavaScript and no client component, so the answers stay in the
 * server-rendered HTML for crawlers.
 */
export async function FaqSection() {
  const t = await getTranslations("portal");
  const items = t.raw("faq.items") as FaqItem[];

  return (
    <Section id="faq">
      <Container className="max-w-[820px]">
        <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />

        <div className="mt-12 flex flex-col gap-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="glass-card group rounded-2xl px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground xl:text-base">
                {item.q}
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                  strokeWidth={2}
                />
              </summary>

              <p className="pt-4 text-xs leading-relaxed text-muted-foreground xl:text-sm">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
