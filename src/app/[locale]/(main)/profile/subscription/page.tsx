import { getTranslations, setRequestLocale } from "next-intl/server";

import { Screen } from "@/components/layout/screen";
import { ScreenHeader } from "@/components/layout/screen-header";
import { PlanPicker } from "@/components/profile/plan-picker";
import { getCurrentUser } from "@/lib/auth/current-user";
import { plans } from "@/lib/mock-data";
import { hasActiveSubscription } from "@/lib/tiers";

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("subscription");

  const currentUser = await getCurrentUser();

  return (
    <>
      <ScreenHeader backHref="/profile" title={t("title")} />

      <Screen>
        <p className="pb-4 text-sm text-muted-foreground">{t("subtitle")}</p>

        <PlanPicker
          plans={plans}
          locale={locale}
          currentLevel={
            hasActiveSubscription(currentUser)
              ? currentUser.subscription.level
              : null
          }
        />
      </Screen>
    </>
  );
}
