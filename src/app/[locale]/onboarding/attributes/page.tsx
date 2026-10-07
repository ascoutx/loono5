import { getTranslations, setRequestLocale } from "next-intl/server";

import { Screen } from "@/components/layout/screen";
import { OnboardingAttributes } from "@/components/onboarding/attributes-step";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { emptyProfile } from "@/lib/mock-data";

/**
 * Registration step 2 — module P「个人属性」.
 *
 * Same fields as 「完善个人信息」→「个人资料」; a brand-new member starts from
 * the empty shape, so nothing is pre-filled.
 */
export default async function OnboardingAttributesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("onboarding.attributes");

  return (
    <Screen
      width="narrow"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full rounded-full"
            render={<Link href="/onboarding/partner" />}
          >
            {t("continue")}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            {t("hint")}
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-1 pt-4 pb-1">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <OnboardingAttributes profile={emptyProfile} />
    </Screen>
  );
}
