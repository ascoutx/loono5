import { Camera, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";

export default async function OnboardingProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("onboarding.profile");
  const interests = ["Art", "Coffee", "Hiking", "Film", "Jazz", "Travel"];

  return (
    <Screen
      width="narrow"
      footer={
        <Button
          size="lg"
          className="w-full rounded-full"
          render={<Link href="/onboarding/attributes" />}
        >
          {t("submit")}
        </Button>
      }
    >
      <div className="flex flex-col gap-1 pt-4 pb-4">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>{t("photosLabel")}</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="col-span-1 row-span-2 flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
            >
              <span className="flex flex-col items-center gap-1">
                <Plus className="size-5" />
                <span className="text-[10px]">{t("upload")}</span>
              </span>
            </button>
            {[0, 1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="col-span-1 flex aspect-[3/4] items-center justify-center rounded-2xl bg-muted/60"
              >
                <Camera className="size-4 text-muted-foreground/60" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("photosHint")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("nameLabel")}</Label>
          <Input id="name" name="name" autoComplete="nickname" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("genderLabel")}</Label>
          <RadioGroup defaultValue="male" name="gender" className="flex gap-2">
            <label
              htmlFor="gender-male"
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-border py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:text-primary"
            >
              <RadioGroupItem value="male" id="gender-male" />
              {t("genderMale")}
            </label>
            <label
              htmlFor="gender-female"
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-border py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:text-primary"
            >
              <RadioGroupItem value="female" id="gender-female" />
              {t("genderFemale")}
            </label>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="age">{t("ageLabel")}</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={18}
              max={99}
              inputMode="numeric"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">{t("cityLabel")}</Label>
            <Input id="city" name="city" autoComplete="address-level2" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("interestsLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest}
                type="button"
                className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary"
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">{t("bioLabel")}</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder={t("bioPlaceholder")}
          />
        </div>
      </form>
    </Screen>
  );
}
