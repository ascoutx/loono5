"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALE_SHORT: Record<Locale, string> = { zh: "中文", ru: "RU", en: "EN" };

/**
 * Switches locale while staying on the current route.
 *
 * Uses the locale-aware `useRouter`/`usePathname` from `@/i18n/navigation` so the
 * active prefix (`as-needed`: zh unprefixed, en/ru prefixed) is handled for us.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
          "text-white/80 transition-all duration-200",
          "hover:bg-white/10 hover:text-white active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none",
          isPending && "opacity-50",
          className,
        )}
        aria-label={t("language")}
      >
        <Globe className="size-4" />
        <span>{LOCALE_SHORT[locale]}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-40 rounded-2xl border border-white/10 bg-neutral-900/80 p-1.5 text-neutral-50 shadow-2xl shadow-black/50 backdrop-blur-xl"
      >
        {locales.map((option) => {
          const selected = option === locale;

          return (
            <DropdownMenuItem
              key={option}
              // Base UI's Menu.Item renders a <div> and fires onClick.
              // Radix's onSelect does not exist here and would be a no-op.
              onClick={() => {
                setOpen(false);
                if (selected) return;
                startTransition(() => {
                  router.replace(pathname, { locale: option });
                });
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm",
                "text-neutral-200 transition-colors hover:bg-white/10 hover:text-white",
                "focus-visible:bg-white/10 focus-visible:outline-none",
                selected && "text-white",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-[11px] font-semibold tracking-wide text-neutral-400">
                  {option.toUpperCase()}
                </span>
                <span>{localeLabels[option]}</span>
              </span>
              {selected ? <Check className="size-4 text-emerald-400" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
