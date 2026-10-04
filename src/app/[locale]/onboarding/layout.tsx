import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { OnboardingStepper } from "@/components/onboarding/stepper";

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Resolve the locale so nested pages inherit the request locale scope.
  await params;
  const t = await getTranslations("onboarding");

  return (
    <AppShell>
      <OnboardingStepper
        steps={["profile", "kyc", "subscription"].map((step) => ({
          id: step,
          label: t(step as "profile" | "kyc" | "subscription"),
        }))}
      >
        {children}
      </OnboardingStepper>
    </AppShell>
  );
}
