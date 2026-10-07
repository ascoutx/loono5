import { Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";

import { Container } from "./section";

/**
 * Anchors into the sections below. Kept in one list so the nav and the
 * section ids can never drift apart.
 */
const ANCHORS = [
  { href: "#how", key: "how" },
  { href: "#pricing", key: "pricing" },
  { href: "#stories", key: "stories" },
  { href: "#faq", key: "faq" },
  { href: "#regions", key: "regions" },
] as const;

/**
 * Fixed glass navigation. Server-rendered: the only interactive bits are the
 * language switcher and the links.
 */
export async function DesktopHeader() {
  const t = await getTranslations("portal");
  const tc = await getTranslations("common");

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07060d]/72 backdrop-blur-xl">
      <Container className="flex h-20 items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-loono-rose to-loono-violet shadow-[0_8px_22px_-8px] shadow-loono-rose/80">
            <Heart className="size-[18px] fill-white text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            {tc("appName")}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={tc("appName")}
        >
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {t(`nav.${anchor.key}`)}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LocaleSwitcher />

          <Link
            href="/auth"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white xl:block"
          >
            {t("login")}
          </Link>

          <Link
            href="/auth"
            className="loono-cta flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold"
          >
            {t("join")}
          </Link>
        </div>
      </Container>
    </header>
  );
}
