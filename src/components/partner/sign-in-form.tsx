"use client";

import { Loader2, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  partnerSignInAction,
  type PartnerSignInState,
} from "@/lib/partner/actions";

/**
 * Account + password form for the B2B cabinet.
 *
 * No self-service signup, no social login, no "forgot password" flow: access
 * is issued by the platform team only. That is why this form is deliberately
 * the plainest screen in the product.
 */
export function PartnerSignInForm() {
  const t = useTranslations("partner.login");

  const [state, formAction, pending] = useActionState<
    PartnerSignInState,
    FormData
  >(partnerSignInAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="partner-account">{t("fields.account")}</Label>
        <Input
          id="partner-account"
          name="account"
          required
          autoFocus
          autoComplete="username"
          placeholder={t("fields.accountPlaceholder")}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="partner-password">{t("fields.password")}</Label>
        <Input
          id="partner-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder={t("fields.passwordPlaceholder")}
          className="h-11 rounded-xl"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-xs text-destructive">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full rounded-xl"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
