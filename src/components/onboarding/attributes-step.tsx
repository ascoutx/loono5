"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { CompletionCard, AboutTab } from "@/components/profile/profile-editor";
import { profileCompletion } from "@/lib/profile-options";
import type { PersonalProfile } from "@/types/profile";

/**
 * Registration step 2 — module P「个人属性」.
 *
 * Reuses `AboutTab` from the profile editor verbatim, so the sign-up form and
 * 「完善个人信息」 can never drift apart. Local state only: on submit the page
 * navigates to the next step; wire it to `PATCH /me/profile` when the API
 * exists.
 */
export function OnboardingAttributes({
  profile: initialProfile,
}: {
  profile: PersonalProfile;
}) {
  const t = useTranslations("profileForm");
  const [profile, setProfile] = useState(initialProfile);

  const update = <K extends keyof PersonalProfile>(
    key: K,
    value: PersonalProfile[K],
  ) => setProfile((current) => ({ ...current, [key]: value }));

  const completion = profileCompletion(profile);

  return (
    <>
      <CompletionCard
        percent={completion.percent}
        label={t("completeness")}
        value={t("completenessValue", { percent: completion.percent })}
        hint={t("completenessHint")}
      />
      <AboutTab profile={profile} update={update} />
    </>
  );
}
