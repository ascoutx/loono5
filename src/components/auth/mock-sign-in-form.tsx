"use client";

import { AlertCircle, FlaskConical, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

import { mockSignInAction, type SignInState } from "@/lib/auth/actions";
import { MOCK_SAMPLE_PHONE, MOCK_SMS_CODE } from "@/lib/auth/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Mock phone auth: any phone number + the fixed test code signs you in.
 * Kept as a client component so the error state can render inline.
 */
export function MockSignInForm() {
  const t = useTranslations("auth");
  const tm = useTranslations("auth.mock");
  const te = useTranslations("auth.errors");

  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    mockSignInAction,
    {},
  );

  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error === "invalidCode") {
      codeRef.current?.focus();
    }
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* On-screen hint: the whole point of the mock flow. */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            {tm("hintTitle")}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/80">
            {tm("hintBody")}
          </p>
        </div>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="flex items-center gap-1.5 rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          {te(state.error)}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">{t("phonePlaceholder")}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={MOCK_SAMPLE_PHONE}
          placeholder={MOCK_SAMPLE_PHONE}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="code">{t("smsPlaceholder")}</Label>
        <div className="flex gap-2">
          <Input
            ref={codeRef}
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder={MOCK_SMS_CODE}
            className="flex-1 font-mono tracking-[0.3em]"
            required
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => {
              const input = codeRef.current;
              if (!input) return;
              input.value = MOCK_SMS_CODE;
              input.form?.requestSubmit();
            }}
          >
            <Wand2 className="size-4" />
            {tm("autofill")}
          </Button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("agree")}
      </p>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full"
        disabled={pending}
      >
        {pending ? tm("signingIn") : t("submit")}
      </Button>
    </form>
  );
}
