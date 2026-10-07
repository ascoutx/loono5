import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { OnboardingStepper } from "@/components/onboarding/stepper";

/**
 * Registration wizard: basics → module P attributes → partner conditions →
 * KYC → plan. The two module-P steps reuse the exact same field groups as
 * 「完善个人信息」 (`/profile/edit`), so what a member fills in at sign-up is
 * already the full profile.
 */
const STEP_IDS = [
  "profile",
  "attributes",
  "partner",
  "kyc",
  "subscription",
] as const;

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Resolve the locale so nested pages inherit the request locale scope.
  await params;
  // Nested under `stepper` because `onboarding.profile` / `.attributes` /
  // `.partner` are page-content namespaces, not labels.
  const t = await getTranslations("onboarding.stepper");

  return (
    <AppShell>
      <OnboardingStepper
        steps={STEP_IDS.map((step) => ({ id: step, label: t(step) }))}
      >
        {children}
      </OnboardingStepper>
    </AppShell>
  );
}
