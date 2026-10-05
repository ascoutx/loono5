"use client";

import { Check, Crown, Loader2, LogOut, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";

import { setMockLevelAction, mockSignOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { USER_LEVELS, type UserLevel } from "@/types/user";

/**
 * One-tap tier switch for local testing.
 *
 * Writes the level into the mock session cookie and refreshes the server
 * components so profile blur / access rules re-evaluate immediately.
 */
export function MockLevelSwitcher({
  current,
  signedIn,
  className,
}: {
  /** Active tier, or null when signed out. */
  current: UserLevel | null;
  signedIn: boolean;
  className?: string;
}) {
  const t = useTranslations("settings.mock");
  const tt = useTranslations("tier");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingLevel, setPendingLevel] = useState<UserLevel | null>(null);

  function select(level: UserLevel) {
    setPendingLevel(level);
    startTransition(async () => {
      await setMockLevelAction(level);
      router.refresh();
      setPendingLevel(null);
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-2.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <RotateCcw className="size-3.5" />
          {t("title")}
        </span>
        {!signedIn ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {t("signedOut")}
          </span>
        ) : null}
      </div>

      <p className="pb-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {t("description")}
      </p>

      <div
        role="group"
        aria-label={t("title")}
        className="grid grid-cols-4 gap-1.5"
      >
        {USER_LEVELS.map((level) => {
          const active = current === level;
          const busy = pending && pendingLevel === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => select(level)}
              disabled={pending}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border py-2 text-xs font-medium transition-all",
                "disabled:pointer-events-none disabled:opacity-60",
                active
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_1px_var(--primary)_inset]"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/60",
              )}
            >
              <span className="flex items-center gap-1">
                {busy ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : active ? (
                  <Check className="size-3" />
                ) : (
                  <Crown className="size-3 opacity-60" />
                )}
                {tt("level", { level })}
              </span>
            </button>
          );
        })}
      </div>

      {signedIn ? (
        <form
          action={async () => {
            startTransition(async () => {
              await mockSignOutAction();
            });
          }}
          className="pt-2.5"
        >
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
          >
            <LogOut className="size-3" />
            {t("reset")}
          </button>
        </form>
      ) : null}
    </div>
  );
}
