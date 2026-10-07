"use client";

import { useState } from "react";

import { PartnerTab } from "@/components/profile/profile-editor";
import { exclusiveTotal } from "@/lib/profile-options";
import type {
  ExclusiveConditionCode,
  PartnerPreferences,
} from "@/types/profile";
import type { UserLevel } from "@/types/user";

/**
 * Registration step 3 — module P「择偶条件」.
 *
 * Reuses `PartnerTab` from the profile editor, so the free conditions (P2),
 * the level-gated premium conditions (P3) and the individually charged
 * conditions (P4) behave exactly as they do in 「完善个人信息」. Local state
 * only: wire it to `PATCH /me/preferences` + the P4 order API later.
 */
export function OnboardingPartner({
  preferences: initialPreferences,
  level,
  profileCountry,
}: {
  preferences: PartnerPreferences;
  level: UserLevel;
  /** Residence from the attributes step — drives the P7 region gate. */
  profileCountry: string;
}) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [paid, setPaid] = useState<ExclusiveConditionCode[]>([]);

  const updatePrefs = <K extends keyof PartnerPreferences>(
    key: K,
    value: PartnerPreferences[K],
  ) => setPrefs((current) => ({ ...current, [key]: value }));

  const toggleExclusive = (code: ExclusiveConditionCode) =>
    setPrefs((current) => ({
      ...current,
      exclusive: current.exclusive.includes(code)
        ? current.exclusive.filter((item) => item !== code)
        : [...current.exclusive, code],
    }));

  const purchaseExclusive = (code: ExclusiveConditionCode) =>
    setPaid((current) =>
      current.includes(code) ? current : [...current, code],
    );

  return (
    <PartnerTab
      prefs={prefs}
      updatePrefs={updatePrefs}
      level={level}
      profileCountry={profileCountry}
      paid={paid}
      exclusiveCost={exclusiveTotal(prefs.exclusive, level)}
      toggleExclusive={toggleExclusive}
      purchaseExclusive={purchaseExclusive}
      /* Registration has no profile page yet — send the upsell to the plan step. */
      upgradeHref="/onboarding/subscription"
      showHeading={false}
    />
  );
}
