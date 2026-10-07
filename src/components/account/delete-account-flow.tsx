"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Account deletion wizard (module Q).
 *
 * Front-end template only: every step is local state and the "submit" is a
 * no-op that flips to the cooling-off screen. Wire `handleSubmit` to
 * `POST /me/deletion-requests` once the API exists — the payload it should
 * carry is exactly what is collected in `verify` and `reason`.
 */

const STEPS = ["notice", "verify", "reason", "confirm"] as const;
type Step = (typeof STEPS)[number];

const NOTICE_KEYS = [
  "data",
  "entitlements",
  "chats",
  "relation",
  "irreversible",
  "retention",
] as const;

const REASON_KEYS = [
  "foundPartner",
  "noLongerNeed",
  "badExperience",
  "privacy",
  "cost",
  "duplicate",
  "switchPlatform",
  "matchQuality",
  "service",
  "other",
] as const;
type ReasonKey = (typeof REASON_KEYS)[number];

const PRECHECK_KEYS = ["balance", "order", "activity", "audit"] as const;

/** Cooling-off window; keep in sync with the backend config. */
const COOLING_OFF_DAYS = 7;
const RESEND_SECONDS = 60;

function maskPhone(phone: string | null): string {
  if (!phone) return "—";
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function DeleteAccountFlow({ phone }: { phone: string | null }) {
  const t = useTranslations("deleteAccount");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("notice");

  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [reason, setReason] = useState<ReasonKey | null>(null);
  const [reasonNote, setReasonNote] = useState("");

  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [withdrawn, setWithdrawn] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(
      () => setCountdown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const stepIndex = STEPS.indexOf(step);
  const canVerify = code.length === 6 && password.length > 0;
  const canPickReason =
    reason !== null && (reason !== "other" || reasonNote.trim().length > 0);

  const deadlineText = submittedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(submittedAt + COOLING_OFF_DAYS * 24 * 60 * 60 * 1000),
      )
    : "";

  function goBack() {
    if (stepIndex === 0) return;
    setStep(STEPS[stepIndex - 1]);
  }

  /** Replace with the real API call; today it only advances the UI. */
  function handleSubmit() {
    setWithdrawn(false);
    setSubmittedAt(Date.now());
  }

  function handleWithdraw() {
    setWithdrawn(true);
  }

  if (submittedAt) {
    return (
      <>
        <FlowHeader
          title={t("title")}
          backLabel={tc("back")}
          onBack={undefined}
        />

        <Screen
          width="narrow"
          footer={
            <div className="flex flex-col gap-2">
              {withdrawn ? null : (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={handleWithdraw}
                >
                  <RotateCcw className="size-4" />
                  {t("done.withdraw")}
                </Button>
              )}
              <Button
                size="lg"
                className="w-full rounded-full"
                render={<Link href="/settings" />}
              >
                {t("done.backToSettings")}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span
              className={cn(
                "flex size-16 items-center justify-center rounded-3xl",
                withdrawn ? "bg-muted" : "bg-emerald-500/10",
              )}
            >
              {withdrawn ? (
                <RotateCcw className="size-8 text-muted-foreground" />
              ) : (
                <CheckCircle2 className="size-8 text-emerald-600" />
              )}
            </span>
            <h2 className="px-2 text-xl font-bold">
              {withdrawn ? t("done.withdrawnTitle") : t("done.title")}
            </h2>
            <p className="max-w-[18rem] text-sm text-muted-foreground">
              {withdrawn
                ? t("done.withdrawnSubtitle")
                : t("done.subtitle", { date: deadlineText })}
            </p>
          </div>

          {withdrawn ? null : (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs">
                <span className="text-muted-foreground">
                  {t("done.coolingLabel")}
                </span>
                <span className="font-medium">{deadlineText}</span>
              </div>
              <p className="pt-3 text-[11px] leading-relaxed text-muted-foreground">
                {t("done.note")}
              </p>
            </>
          )}
        </Screen>
      </>
    );
  }

  return (
    <>
      <FlowHeader
        title={t("title")}
        backLabel={tc("back")}
        onBack={stepIndex === 0 ? undefined : goBack}
        backHref={stepIndex === 0 ? "/settings" : undefined}
      />

      <Screen width="narrow" footer={renderFooter()}>
        <StepIndicator
          current={stepIndex}
          label={t(`steps.${step}`)}
          counter={t("stepOf", { current: stepIndex + 1, total: STEPS.length })}
        />

        {step === "notice" ? (
          <>
            <div className="pb-4">
              <h2 className="text-xl font-bold">{t("notice.title")}</h2>
              <p className="pt-1 text-sm text-muted-foreground">
                {t("notice.subtitle")}
              </p>
            </div>

            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 pb-2.5 text-destructive">
                <AlertTriangle className="size-4" />
                <span className="text-sm font-semibold">
                  {t("notice.warningTitle")}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {NOTICE_KEYS.map((key) => (
                  <li key={key} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-destructive" />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {t(`notice.items.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <Checkbox
                id="delete-account-agree"
                checked={agreed}
                onCheckedChange={setAgreed}
                className="mt-0.5"
              />
              <label
                htmlFor="delete-account-agree"
                className="cursor-pointer text-sm leading-relaxed"
              >
                {t("notice.agree")}
              </label>
            </div>
          </>
        ) : null}

        {step === "verify" ? (
          <>
            <div className="pb-4">
              <h2 className="text-xl font-bold">{t("verify.title")}</h2>
              <p className="pt-1 text-sm text-muted-foreground">
                {t("verify.subtitle")}
              </p>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <span className="text-xs text-muted-foreground">
                {t("verify.phoneLabel")}
              </span>
              <span className="font-mono text-sm">{maskPhone(phone)}</span>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="delete-account-code">
                  {t("verify.codeLabel")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="delete-account-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    placeholder={t("verify.codePlaceholder")}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, ""))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={countdown > 0}
                    onClick={() => setCountdown(RESEND_SECONDS)}
                  >
                    {countdown > 0
                      ? t("verify.resendIn", { seconds: countdown })
                      : t("verify.sendCode")}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="delete-account-password">
                  {t("verify.passwordLabel")}
                </Label>
                <Input
                  id="delete-account-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  placeholder={t("verify.passwordPlaceholder")}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("verify.faceHint")}
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground">
                {t("verify.mockHint")}
              </p>
            </div>
          </>
        ) : null}

        {step === "reason" ? (
          <>
            <div className="pb-4">
              <h2 className="text-xl font-bold">{t("reason.title")}</h2>
              <p className="pt-1 text-sm text-muted-foreground">
                {t("reason.subtitle")}
              </p>
            </div>

            <RadioGroup
              value={reason ?? ""}
              onValueChange={(value) => setReason(value as ReasonKey)}
            >
              {REASON_KEYS.map((key) => (
                <div
                  key={key}
                  onClick={() => setReason(key)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-4 transition-colors",
                    reason === key ? "border-primary" : "border-border",
                  )}
                >
                  <RadioGroupItem value={key} />
                  <span className="text-sm">{t(`reason.options.${key}`)}</span>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="delete-account-note">
                {reason === "other"
                  ? t("reason.otherLabel")
                  : t("reason.noteLabel")}
              </Label>
              <Textarea
                id="delete-account-note"
                rows={3}
                value={reasonNote}
                placeholder={
                  reason === "other"
                    ? t("reason.otherPlaceholder")
                    : t("reason.optionalPlaceholder")
                }
                onChange={(event) => setReasonNote(event.target.value)}
              />
            </div>

            <p className="pt-3 text-[11px] leading-relaxed text-muted-foreground">
              {t("reason.privacyNote")}
            </p>
          </>
        ) : null}

        {step === "confirm" ? (
          <>
            <div className="pb-4">
              <h2 className="text-xl font-bold">{t("confirm.title")}</h2>
              <p className="pt-1 text-sm text-muted-foreground">
                {t("confirm.subtitle")}
              </p>
            </div>

            <section className="mb-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 p-4 pb-3 text-emerald-600">
                <ShieldCheck className="size-4" />
                <span className="text-sm font-semibold">
                  {t("confirm.precheckTitle")}
                </span>
              </div>
              <ul className="flex flex-col gap-2 px-4 pb-4">
                {PRECHECK_KEYS.map((key) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                    <span className="flex-1">
                      {t(`confirm.precheck.${key}`)}
                    </span>
                    <span className="text-emerald-600">
                      {t("confirm.precheckPass")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 pb-1.5 text-amber-600">
                <Clock className="size-4" />
                <span className="text-sm font-semibold">
                  {t("confirm.coolingTitle")}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("confirm.coolingText", { days: COOLING_OFF_DAYS })}
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card">
              <div className="p-4 text-sm font-semibold">
                {t("confirm.summaryTitle")}
              </div>
              <Separator />
              <SummaryRow
                label={t("confirm.summaryAccount")}
                value={maskPhone(phone)}
              />
              <Separator />
              <SummaryRow
                label={t("confirm.summaryReason")}
                value={reason ? t(`reason.options.${reason}`) : "—"}
              />
              <Separator />
              <SummaryRow
                label={t("confirm.summaryData")}
                value={t("confirm.summaryDataValue")}
              />
            </section>
          </>
        ) : null}
      </Screen>
    </>
  );

  function renderFooter() {
    if (step === "notice") {
      return (
        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!agreed}
          onClick={() => setStep("verify")}
        >
          {tc("next")}
        </Button>
      );
    }

    if (step === "verify") {
      return (
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={goBack}
          >
            {t("previous")}
          </Button>
          <Button
            size="lg"
            className="flex-[1.4] rounded-full"
            disabled={!canVerify}
            onClick={() => setStep("reason")}
          >
            {tc("next")}
          </Button>
        </div>
      );
    }

    if (step === "reason") {
      return (
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={goBack}
          >
            {t("previous")}
          </Button>
          <Button
            size="lg"
            className="flex-[1.4] rounded-full"
            disabled={!canPickReason}
            onClick={() => setStep("confirm")}
          >
            {tc("next")}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 rounded-full"
          render={<Link href="/settings" />}
        >
          {t("confirm.cancel")}
        </Button>
        <Button
          size="lg"
          variant="destructive"
          className="flex-[1.4] rounded-full"
          onClick={handleSubmit}
        >
          {t("confirm.submit")}
        </Button>
      </div>
    );
  }
}

interface FlowHeaderProps {
  title: string;
  backLabel: string;
  onBack?: () => void;
  backHref?: string;
}

/**
 * Sticky header with an in-flow back action.
 * `ScreenHeader` can only link to a route, but the wizard needs to go back one
 * step, so the arrow is wired to `onBack` or `backHref`.
 */
function FlowHeader({ title, backLabel, onBack, backHref }: FlowHeaderProps) {
  const backClassName =
    "flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted active:bg-muted";

  return (
    <header className="sticky top-0 z-30 mx-auto flex min-h-14 w-full max-w-[42rem] shrink-0 items-center gap-2 bg-background/95 px-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur md:px-4">
      {onBack ? (
        <button
          type="button"
          aria-label={backLabel}
          className={backClassName}
          onClick={onBack}
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : backHref ? (
        <Link href={backHref} aria-label={backLabel} className={backClassName}>
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span className="w-9 shrink-0" />
      )}

      <h1 className="min-w-0 flex-1 truncate text-center text-base font-semibold">
        {title}
      </h1>

      <span className="w-9 shrink-0" />
    </header>
  );
}

function StepIndicator({
  current,
  label,
  counter,
}: {
  current: number;
  label: string;
  counter: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 pb-4">
      <ol className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <li key={step} className="flex-1">
            <span
              className={cn(
                "block h-1 w-full rounded-full transition-colors",
                index <= current ? "bg-primary" : "bg-muted",
              )}
            />
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-muted-foreground">{counter}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs">{value}</span>
    </div>
  );
}
