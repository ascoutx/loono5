import { Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { Container } from "./section";

/**
 * Footer columns.
 *
 * `href: null` marks a page that does not exist in the demo yet — it renders
 * as quiet text instead of a link that would 404.
 *
 * The consumer surface exposes exactly one partner-facing door, and this is
 * it: the application form, filed under "product" as a plain link. Nothing
 * here ever names agents or agencies.
 */
const COLUMNS = [
  {
    key: "product",
    items: [
      { key: 0, href: "/catalog" },
      { key: 1, href: "/profile/subscription" },
      { key: 2, href: "/profile" },
      { key: 3, href: "/partners/apply" },
    ],
  },
  {
    key: "about",
    items: [
      { key: 0, href: null },
      { key: 1, href: null },
      { key: 2, href: null },
      { key: 3, href: null },
    ],
  },
  {
    key: "legal",
    items: [
      { key: 0, href: null },
      { key: 1, href: null },
      { key: 2, href: "/settings/delete-account" },
      { key: 3, href: null },
    ],
  },
  {
    key: "support",
    items: [
      { key: 0, href: null },
      { key: 1, href: "#faq" },
      { key: 2, href: null },
      { key: 3, href: null },
    ],
  },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

export async function DesktopFooter() {
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");

  return (
    <footer className="relative border-t border-border bg-loono-sand/60">
      <Container className="flex flex-col gap-12 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="flex flex-col gap-4 lg:pe-8">
            <span className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-loono-champagne to-loono-champagne-deep">
                <Heart className="size-[18px] fill-white text-white" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                {tc("appName")}
              </span>
            </span>

            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              {tc("tagline")}
            </p>

            <p className="text-[11px] text-muted-foreground/70">
              {t("footer.appStore")}
            </p>
          </div>

          {COLUMNS.map((column) => {
            const labels = t.raw(`footer.${column.key}`) as string[];

            return (
              <nav key={column.key} className="flex flex-col gap-4">
                <h3 className="text-xs font-semibold tracking-wide text-foreground/80 uppercase">
                  {t(`footer.columns.${column.key as ColumnKey}`)}
                </h3>

                <ul className="flex flex-col gap-2.5">
                  {column.items.map((item) => {
                    const label = labels[item.key];

                    return (
                      <li key={label}>
                        {item.href === null ? (
                          <span className="text-xs text-muted-foreground/80">
                            {label}
                          </span>
                        ) : item.href.startsWith("#") ? (
                          <a
                            href={item.href}
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {label}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            );
          })}
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground/70">
          {t("footer.disclaimer")}
        </p>

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-[11px] text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("footer.rights")}</span>
          <span>{t("footer.company")}</span>
        </div>
      </Container>
    </footer>
  );
}
