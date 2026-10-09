import { ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PartnerSignInForm } from "@/components/partner/sign-in-form";

/**
 * Sign-in for the B2B partner cabinet (partner.loono.com).
 *
 * Sits inside the /partner layout, so it already has the dark data surface.
 * Every other page in the cabinet calls `requirePartnerSession()` and bounces
 * here when the cookie is missing.
 */
export default async function PartnerLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("partner.login");

  return (
    <div className="partner-surface relative flex min-h-full flex-1 items-center justify-center px-5 py-14">
      <div className="partner-panel w-full max-w-[26rem] p-7">
        <div className="flex flex-col items-center gap-3 pb-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/12">
            <ShieldCheck className="size-5 text-white/80" />
          </span>

          <div>
            <h1 className="text-base font-semibold">{t("title")}</h1>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <PartnerSignInForm />

        <p className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
          {t("demoHint")}
        </p>
      </div>
    </div>
  );
}
