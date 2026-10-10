import { BarChart3, Globe2, Headset } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";
import { ScreenHeader } from "@/components/layout/screen-header";
import { PartnerApplyForm } from "@/components/partner/apply-form";
import { SoftBackdrop } from "@/components/landing/soft-backdrop";

interface Highlight {
  icon: string;
  title: string;
  body: string;
}

const ICONS: Record<string, LucideIcon> = {
  reach: Globe2,
  tools: BarChart3,
  support: Headset,
};

/**
 * Partners application — the single partner-facing entry point on the consumer
 * site.
 *
 * The B2B cabinet itself lives on its own host (partner.loono.com) behind an
 * account login; nothing on this side links into it, and no page in the
 * consumer product names agents or agencies.
 */
export default async function PartnerApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("partners");
  const highlights = t.raw("highlights") as Highlight[];

  return (
    <AppShell>
      <div className="loono-surface relative flex min-h-full flex-1 flex-col">
        <SoftBackdrop />

        <ScreenHeader
          backHref="/"
          title={t("title")}
          width="narrow"
          className="relative z-10"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[42rem] flex-1 flex-col px-4 pb-14 md:px-6">
          <div className="flex flex-col gap-1.5 pt-2 pb-6">
            <h2 className="text-xl font-bold tracking-tight">{t("heading")}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("intro")}
            </p>
          </div>

          <ul className="mb-7 grid gap-2.5 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = ICONS[item.icon] ?? Globe2;

              return (
                <li
                  key={item.icon}
                  className="glass-card flex flex-col gap-2 rounded-2xl p-4"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-loono-sand text-loono-champagne-deep ring-1 ring-loono-champagne/40">
                    <Icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </span>
                </li>
              );
            })}
          </ul>

          <PartnerApplyForm />
        </div>
      </div>
    </AppShell>
  );
}
