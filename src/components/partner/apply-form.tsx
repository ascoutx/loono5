"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Mirrors the four partnership tracks in the product spec
 * (会员与合伙申请方案): online promoter → city/provincial → country →
 * shareholder, with commission stepping 50% / 60% / 70% / 75%.
 * The commission numbers live in the i18n hints so they stay in one place.
 */
const COOPERATION_TYPES = ["online", "city", "country", "shareholder"] as const;
type CooperationType = (typeof COOPERATION_TYPES)[number];

/**
 * Partners application form — the only partner-facing surface on the B2C site.
 *
 * Front-end template only: `handleSubmit` is a local stub with a fake delay.
 * Wire it up with
 *   POST /partners/applications
 * and add server-side rate limiting + captcha before launch — this endpoint is
 * public by definition.
 */
export function PartnerApplyForm() {
  const t = useTranslations("partners.apply");

  const [type, setType] = useState<CooperationType>("online");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    // TODO(backend): POST /partners/applications
    await new Promise((resolve) => setTimeout(resolve, 700));

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="size-6 text-emerald-600" />
        </span>
        <h2 className="text-base font-semibold">{t("successTitle")}</h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          {t("successBody")}
        </p>
        <Button
          variant="outline"
          className="mt-2 rounded-full"
          onClick={() => setDone(false)}
        >
          {t("submitAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-name">{t("fields.name")}</Label>
          <Input
            id="partner-name"
            name="name"
            required
            autoComplete="name"
            placeholder={t("fields.namePlaceholder")}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-company">{t("fields.company")}</Label>
          <Input
            id="partner-company"
            name="company"
            autoComplete="organization"
            placeholder={t("fields.companyPlaceholder")}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-email">{t("fields.email")}</Label>
          <Input
            id="partner-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("fields.emailPlaceholder")}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="partner-phone">{t("fields.phone")}</Label>
          <Input
            id="partner-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t("fields.phonePlaceholder")}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="partner-country">{t("fields.country")}</Label>
          <Input
            id="partner-country"
            name="country"
            autoComplete="country-name"
            placeholder={t("fields.countryPlaceholder")}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-medium">
          {t("fields.cooperationType")}
        </legend>

        <RadioGroup
          value={type}
          onValueChange={(value) => setType(value as CooperationType)}
          className="grid gap-2 md:grid-cols-2"
        >
          {COOPERATION_TYPES.map((key) => (
            <Label
              key={key}
              htmlFor={`partner-type-${key}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                type === key
                  ? "border-loono-champagne bg-loono-sand/60"
                  : "border-border hover:border-loono-champagne/60",
              )}
            >
              <RadioGroupItem
                id={`partner-type-${key}`}
                value={key}
                className="mt-0.5"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {t(`types.${key}.label`)}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {t(`types.${key}.hint`)}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="partner-message">{t("fields.message")}</Label>
        <Textarea
          id="partner-message"
          name="message"
          rows={4}
          placeholder={t("fields.messagePlaceholder")}
          className="rounded-xl"
        />
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {t("consent")}
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="loono-cta w-full rounded-2xl text-primary-foreground"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}
