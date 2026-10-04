"use client";

import { Check, Copy, Loader2, Ticket } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { promoCodeExpiry } from "@/lib/agent";

/** Referral link + 30-day Level 1 promo code generator (PRD rule 3). */
export function PromoTools({
  refLink,
  refCode,
}: {
  refLink: string;
  refCode: string;
}) {
  const t = useTranslations("agent.promo");
  const format = useFormatter();

  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);

  async function copy(value: string, kind: "link" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard is unavailable (insecure origin); the value stays visible.
    }
  }

  function generate() {
    setIsGenerating(true);
    // Replace with the real promo-code endpoint.
    setTimeout(() => {
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      setGenerated({
        code: `${refCode}-TRIAL-${suffix}`,
        expiresAt: promoCodeExpiry(),
      });
      setIsGenerating(false);
    }, 600);
  }

  return (
    <div className="flex flex-col gap-2">
      <Card className="flex flex-col gap-2 p-4">
        <div>
          <p className="text-sm font-semibold">{t("refLinkTitle")}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("refLinkHint")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-2 py-1.5 font-mono text-xs">
            {refLink}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1 rounded-full"
            onClick={() => copy(refLink, "link")}
          >
            {copied === "link" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied === "link" ? t("copied") : t("copyLink")}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-2 p-4">
        <div>
          <p className="text-sm font-semibold">{t("promoCodeTitle")}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("promoCodeHint")}
          </p>
        </div>

        {generated ? (
          <div className="flex flex-col gap-2 rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate font-mono text-sm font-semibold">
                {generated.code}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("copyLink")}
                onClick={() => copy(generated.code, "code")}
              >
                {copied === "code" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {t("expiresIn", {
                  date: format.dateTime(new Date(generated.expiresAt), {
                    dateStyle: "medium",
                  }),
                })}
              </span>
              <Badge className="gap-0.5 text-[10px]">
                <Ticket className="size-2.5" />
                L1
              </Badge>
            </div>
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="w-full gap-1.5 rounded-full"
          onClick={generate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Ticket className="size-4" />
              {t("generate")}
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
