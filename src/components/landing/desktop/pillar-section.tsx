import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container, Section, SectionHeading } from "./section";

interface Pillar {
  tag: string;
  title: string;
  body: string;
  points: string[];
}

/** The three "why us" blocks — the editorial core of the page. */
export async function PillarSection() {
  const t = await getTranslations("portal");
  const items = t.raw("pillars.items") as Pillar[];

  return (
    <Section id="how">
      <Container>
        <SectionHeading
          eyebrow={t("pillars.eyebrow")}
          title={t("pillars.title")}
          subtitle={t("pillars.subtitle")}
        />

        <ul className="mt-14 grid gap-5 lg:grid-cols-3 xl:gap-6">
          {items.map((item) => (
            <li
              key={item.tag}
              className="glass-card flex flex-col gap-4 rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/25 to-white/5 text-base font-bold text-white ring-1 ring-white/20">
                {item.tag}
              </span>

              <h3 className="text-lg leading-snug font-semibold text-white">
                {item.title}
              </h3>

              <p className="text-sm leading-relaxed text-white/60">
                {item.body}
              </p>

              <ul className="mt-auto flex flex-col gap-2.5 pt-2">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-xs leading-relaxed text-white/75"
                  >
                    <Check
                      className="mt-px size-3.5 shrink-0 text-loono-rose"
                      strokeWidth={2.6}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
