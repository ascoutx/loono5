"use client";

import { Check, Copy, Gift, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildReferralUrl } from "@/lib/referral";
import { ensureViewerProfile } from "@/lib/supabase/profile";
import { cn } from "@/lib/utils";

/**
 * The member's own invite link.
 *
 * Reads `ref_code` off the Supabase profile rather than the mock session, so
 * the code shown is the one the database will actually resolve on the other
 * end. It is created on demand by the 0002 trigger, which is why this is a
 * client component: the row does not exist until the browser has a session.
 *
 * Renders nothing at all while loading. A card that pops in later is far less
 * disruptive than a placeholder the member cannot act on, and the profile
 * screen is dense enough without another skeleton.
 */
export function ReferralLink({
  displayName,
  avatarUrl,
  level,
  className,
}: {
  displayName: string;
  avatarUrl: string | null;
  level: number;
  className?: string;
}) {
  const t = useTranslations("profile.referral");

  const [refCode, setRefCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  useEffect(() => {
    let active = true;

    ensureViewerProfile({ displayName, avatarUrl, level })
      .then((profile) => {
        if (!active || !profile.ref_code) return;

        setRefCode(profile.ref_code);
        // Built from the live origin: loono.com in production,
        // localhost:3000 in development, and the two must not drift.
        setLink(buildReferralUrl(window.location.origin, profile.ref_code));
      })
      .catch(() => {
        // Not attributable to a broken profile card — the rest of the screen
        // is mock-driven and works regardless.
      });

    return () => {
      active = false;
    };
  }, [displayName, avatarUrl, level]);

  const copy = useCallback(async (value: string, kind: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard needs a secure origin; the values stay on screen to copy
      // by hand, which is the fallback that matters on plain http.
    }
  }, []);

  if (!refCode || !link) {
    return null;
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2">
        <Gift className="size-4 shrink-0 text-primary" />
        <p className="flex-1 text-xs text-muted-foreground">{t("title")}</p>
      </div>

      <p className="mt-1.5 text-sm font-semibold">{t("headline")}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {t("hint")}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-2 py-1.5 font-mono text-xs font-semibold">
          {refCode}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1 rounded-full"
          onClick={() => void copy(refCode, "code")}
        >
          {copied === "code" ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied === "code" ? t("copied") : t("copyCode")}
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-2 py-1.5 font-mono text-[11px]">
          {link}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1 rounded-full"
          onClick={() => void copy(link, "link")}
        >
          {copied === "link" ? (
            <Check className="size-3.5" />
          ) : (
            <Link2 className="size-3.5" />
          )}
          {copied === "link" ? t("copied") : t("copyLink")}
        </Button>
      </div>
    </Card>
  );
}
