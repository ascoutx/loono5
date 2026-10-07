"use client";

import {
  BadgeCheck,
  CircleDollarSign,
  Globe2,
  Heart,
  Languages,
  Lock,
  Ruler,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";

import { Screen } from "@/components/layout/screen";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import {
  AGE_MAX,
  AGE_MIN,
  ASSET_OPTIONS,
  CHILDREN_OPTIONS,
  COUNTRY_OPTIONS,
  EDUCATION_OPTIONS,
  EXCLUSIVE_CONDITION_DEFS,
  FREQUENCY_OPTIONS,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  LANGUAGE_OPTIONS,
  MARITAL_OPTIONS,
  PREMIUM_PREFERENCE_MIN_LEVEL,
  RELIGION_OPTIONS,
  TATTOO_OPTIONS,
  exclusivePrice,
  exclusiveTotal,
  isExclusiveConditionAvailable,
  isPremiumUnlocked,
  profileCompletion,
  type Option,
} from "@/lib/profile-options";
import { cn } from "@/lib/utils";
import type {
  ExclusiveConditionCode,
  PartnerPreferences,
  PersonalProfile,
} from "@/types/profile";
import type { UserLevel } from "@/types/user";

/**
 * Module P — 「完善个人信息」 + 「择偶条件」 editor.
 *
 * Front-end template only: everything is local state and `handleSave` is a
 * no-op stub. Wire it up with:
 *   PATCH /me/profile      ← `profile`
 *   PATCH /me/preferences  ← `preferences`
 *   POST  /me/conditions/:code/purchase ← P4 unlock
 */

interface ProfileEditorProps {
  profile: PersonalProfile;
  preferences: PartnerPreferences;
  level: UserLevel;
  /** Which tab opens first — `/profile/edit?tab=partner` deep-links to P3/P4. */
  initialTab?: "about" | "partner";
}

/** Which P4 conditions the member has already paid for (mock). */
const INITIALLY_PAID: ExclusiveConditionCode[] = [];

export function ProfileEditor({
  profile: initialProfile,
  preferences: initialPreferences,
  level,
  initialTab = "about",
}: ProfileEditorProps) {
  const t = useTranslations("profileForm");

  const [tab, setTab] = useState<"about" | "partner">(initialTab);
  const [profile, setProfile] = useState(initialProfile);
  const [prefs, setPrefs] = useState(initialPreferences);
  const [paid, setPaid] = useState<ExclusiveConditionCode[]>(INITIALLY_PAID);
  const [saved, setSaved] = useState(false);

  const completion = profileCompletion(profile);
  const exclusiveCost = exclusiveTotal(prefs.exclusive, level);

  const update = <K extends keyof PersonalProfile>(
    key: K,
    value: PersonalProfile[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const updatePrefs = <K extends keyof PartnerPreferences>(
    key: K,
    value: PartnerPreferences[K],
  ) => {
    setPrefs((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  /** P4 — switch a charged condition on/off; payment is a separate step. */
  const toggleExclusive = (code: ExclusiveConditionCode) => {
    setPrefs((current) => ({
      ...current,
      exclusive: current.exclusive.includes(code)
        ? current.exclusive.filter((item) => item !== code)
        : [...current.exclusive, code],
    }));
    setSaved(false);
  };

  /** Mock stand-in for the payment sheet; a real build calls the order API. */
  const purchaseExclusive = (code: ExclusiveConditionCode) => {
    setPaid((current) =>
      current.includes(code) ? current : [...current, code],
    );
  };

  const handleSave = () => {
    // TODO: PATCH /me/profile + PATCH /me/preferences once the API exists.
    setSaved(true);
  };

  return (
    <>
      <ScreenHeader title={t("title")} backHref="/profile" />

      <Screen
        footer={
          <div className="flex flex-col gap-2">
            {saved ? (
              <p className="text-center text-[11px] text-emerald-600">
                {t("saved")}
              </p>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">
                {t("saveHint")}
              </p>
            )}
            <Button
              size="lg"
              className="w-full rounded-full"
              onClick={handleSave}
            >
              <Save className="size-4" />
              {t("save")}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-1 pt-2 pb-3">
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>

        <CompletionCard
          percent={completion.percent}
          label={t("completeness")}
          value={t("completenessValue", { percent: completion.percent })}
          hint={t("completenessHint")}
        />

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(
            [
              ["about", t("tabs.about")],
              ["partner", t("tabs.partner")],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full py-1.5 text-xs font-medium transition-colors",
                tab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "about" ? (
          <AboutTab profile={profile} update={update} />
        ) : (
          <PartnerTab
            prefs={prefs}
            updatePrefs={updatePrefs}
            level={level}
            profileCountry={profile.countryCode}
            paid={paid}
            exclusiveCost={exclusiveCost}
            toggleExclusive={toggleExclusive}
            purchaseExclusive={purchaseExclusive}
          />
        )}
      </Screen>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared building blocks                                                     */
/* -------------------------------------------------------------------------- */

function CompletionCard({
  percent,
  label,
  value,
  hint,
}: {
  percent: number;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
    </section>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Chip picker used for every enum field. Multi-select when `multiple`, and a
 * segmented single-select otherwise — both write through the same callback.
 */
function ChipPicker<T extends string>({
  options,
  selected,
  onChange,
  multiple = false,
  labelOf,
  className,
}: {
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  multiple?: boolean;
  labelOf: (key: string) => string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() =>
              multiple
                ? onChange(
                    active
                      ? selected.filter((item) => item !== option.value)
                      : [...selected, option.value],
                  )
                : onChange(active ? [] : [option.value])
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              active
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary",
            )}
          >
            {labelOf(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  hint,
  children,
  className,
}: {
  icon: typeof UserRound;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mt-3 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4",
        className,
      )}
    >
      <header className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <h2 className="flex-1 text-sm font-semibold">{title}</h2>
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/** Wraps P3 content that the member's level does not unlock yet. */
function PremiumGate({
  locked,
  lockedHint,
  cta,
  children,
}: {
  locked: boolean;
  lockedHint: string;
  cta: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden={locked}
        className={cn(locked && "pointer-events-none opacity-40")}
      >
        {children}
      </div>

      {locked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card/70 px-4 text-center backdrop-blur-[2px]">
          <span className="flex size-8 items-center justify-center rounded-full bg-amber-500/10">
            <Lock className="size-4 text-amber-600 dark:text-amber-400" />
          </span>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {lockedHint}
          </p>
          <Button
            size="sm"
            className="rounded-full"
            render={<Link href="/profile/subscription" />}
          >
            {cta}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab 1 — 个人资料                                                            */
/* -------------------------------------------------------------------------- */

function AboutTab({
  profile,
  update,
}: {
  profile: PersonalProfile;
  update: <K extends keyof PersonalProfile>(
    key: K,
    value: PersonalProfile[K],
  ) => void;
}) {
  const t = useTranslations("profileForm");

  const single = <T extends string>(
    options: Option<T>[],
    value: T | null,
    onChange: (next: T | null) => void,
  ) => (
    <ChipPicker
      options={options}
      multiple={false}
      selected={value ? [value] : []}
      onChange={(next) => onChange(next[0] ?? null)}
      labelOf={t}
    />
  );

  return (
    <>
      <SectionCard icon={UserRound} title={t("sections.basic")}>
        <Field
          label={t("height.label")}
          htmlFor="heightCm"
          hint={t("height.unit")}
        >
          <Input
            id="heightCm"
            name="heightCm"
            type="number"
            inputMode="numeric"
            min={HEIGHT_CM_MIN}
            max={HEIGHT_CM_MAX}
            placeholder={t("height.placeholder")}
            value={profile.heightCm ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              update("heightCm", raw === "" ? null : Number(raw));
            }}
          />
        </Field>

        <Field label={t("education.label")}>
          {single(EDUCATION_OPTIONS, profile.education, (next) =>
            update("education", next),
          )}
        </Field>

        <Field label={t("occupation.label")} htmlFor="occupation">
          <Input
            id="occupation"
            name="occupation"
            placeholder={t("occupation.placeholder")}
            value={profile.occupation}
            onChange={(event) => update("occupation", event.target.value)}
          />
        </Field>

        <Field label={t("marital.label")}>
          {single(MARITAL_OPTIONS, profile.maritalStatus, (next) =>
            update("maritalStatus", next),
          )}
        </Field>

        <Field label={t("children.label")}>
          {single(CHILDREN_OPTIONS, profile.children, (next) =>
            update("children", next),
          )}
        </Field>
      </SectionCard>

      <SectionCard
        icon={Languages}
        title={t("language.label")}
        hint={t("language.hint")}
      >
        <ChipPicker
          multiple
          options={LANGUAGE_OPTIONS}
          selected={profile.languages}
          onChange={(next) => update("languages", next)}
          labelOf={t}
          className="-mt-1"
        />
      </SectionCard>

      <SectionCard icon={Heart} title={t("sections.lifestyle")}>
        <Field label={t("religion.label")}>
          {single(RELIGION_OPTIONS, profile.religion, (next) =>
            update("religion", next),
          )}
        </Field>

        <Field label={t("tattoo.label")}>
          {single(TATTOO_OPTIONS, profile.tattoo, (next) =>
            update("tattoo", next),
          )}
        </Field>

        <Field label={t("smoking.label")}>
          {single(FREQUENCY_OPTIONS, profile.smoking, (next) =>
            update("smoking", next),
          )}
        </Field>

        <Field label={t("drinking.label")}>
          {single(FREQUENCY_OPTIONS, profile.drinking, (next) =>
            update("drinking", next),
          )}
        </Field>
      </SectionCard>

      <SectionCard icon={CircleDollarSign} title={t("sections.assets")}>
        <Field label={t("asset.label")} hint={t("asset.verifiedHint")}>
          {single(ASSET_OPTIONS, profile.assetRange, (next) =>
            update("assetRange", next),
          )}
        </Field>

        <Field label={t("country.label")}>
          <ChipPicker
            multiple
            options={COUNTRY_OPTIONS}
            selected={profile.countryCode ? [profile.countryCode] : []}
            onChange={(next) => update("countryCode", next[0] ?? "")}
            labelOf={t}
          />
        </Field>

        <Field label={t("city.label")} htmlFor="city">
          <Input
            id="city"
            name="city"
            placeholder={t("city.placeholder")}
            value={profile.city}
            onChange={(event) => update("city", event.target.value)}
          />
        </Field>
      </SectionCard>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab 2 — 择偶条件                                                            */
/* -------------------------------------------------------------------------- */

interface PartnerTabProps {
  prefs: PartnerPreferences;
  updatePrefs: <K extends keyof PartnerPreferences>(
    key: K,
    value: PartnerPreferences[K],
  ) => void;
  level: UserLevel;
  profileCountry: string;
  paid: ExclusiveConditionCode[];
  exclusiveCost: number;
  toggleExclusive: (code: ExclusiveConditionCode) => void;
  purchaseExclusive: (code: ExclusiveConditionCode) => void;
}

function PartnerTab({
  prefs,
  updatePrefs,
  level,
  profileCountry,
  paid,
  exclusiveCost,
  toggleExclusive,
  purchaseExclusive,
}: PartnerTabProps) {
  const tp = useTranslations("partnerPref");
  const tf = useTranslations("profileForm");

  const availableExclusive = useMemo(
    () =>
      EXCLUSIVE_CONDITION_DEFS.filter((definition) =>
        isExclusiveConditionAvailable(definition.code, profileCountry),
      ),
    [profileCountry],
  );

  const premiumLocked = !isPremiumUnlocked("education", level);

  const single = <T extends string>(
    options: Option<T>[],
    value: T | null,
    onChange: (next: T | null) => void,
  ) => (
    <ChipPicker
      options={options}
      multiple={false}
      selected={value ? [value] : []}
      onChange={(next) => onChange(next[0] ?? null)}
      labelOf={tf}
    />
  );

  const rangeRow = (
    minValue: number | null,
    maxValue: number | null,
    onMin: (value: number | null) => void,
    onMax: (value: number | null) => void,
    bounds: { min: number; max: number },
    unit?: string,
  ) => (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="numeric"
        aria-label={tp("range.from")}
        min={bounds.min}
        max={bounds.max}
        placeholder={tp("range.from")}
        value={minValue ?? ""}
        onChange={(event) =>
          onMin(event.target.value === "" ? null : Number(event.target.value))
        }
      />
      <span className="shrink-0 text-xs text-muted-foreground">—</span>
      <Input
        type="number"
        inputMode="numeric"
        aria-label={tp("range.to")}
        min={bounds.min}
        max={bounds.max}
        placeholder={tp("range.to")}
        value={maxValue ?? ""}
        onChange={(event) =>
          onMax(event.target.value === "" ? null : Number(event.target.value))
        }
      />
      {unit ? (
        <span className="shrink-0 text-xs text-muted-foreground">{unit}</span>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-1 pt-3 pb-1">
        <h2 className="text-sm font-semibold">{tp("title")}</h2>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {tp("subtitle")}
        </p>
      </div>

      {/* P1/P2 — free conditions */}
      <SectionCard
        icon={Ruler}
        title={tp("freeSection.title")}
        hint={tp("freeSection.hint")}
      >
        <Field label={tp("age.label")}>
          {rangeRow(
            prefs.ageMin,
            prefs.ageMax,
            (value) => updatePrefs("ageMin", value),
            (value) => updatePrefs("ageMax", value),
            { min: AGE_MIN, max: AGE_MAX },
            tp("range.unitAge"),
          )}
        </Field>

        <Field label={tp("height.label")}>
          {rangeRow(
            prefs.heightMin,
            prefs.heightMax,
            (value) => updatePrefs("heightMin", value),
            (value) => updatePrefs("heightMax", value),
            { min: HEIGHT_CM_MIN, max: HEIGHT_CM_MAX },
            tp("range.unitHeight"),
          )}
        </Field>

        <Field label={tp("countries.label")}>
          <ChipPicker
            multiple
            options={COUNTRY_OPTIONS}
            selected={prefs.countries}
            onChange={(next) => updatePrefs("countries", next)}
            labelOf={tf}
          />
        </Field>

        <Field label={tp("smoking.label")}>
          {single(FREQUENCY_OPTIONS, prefs.smoking, (next) =>
            updatePrefs("smoking", next),
          )}
        </Field>

        <Field label={tp("drinking.label")}>
          {single(FREQUENCY_OPTIONS, prefs.drinking, (next) =>
            updatePrefs("drinking", next),
          )}
        </Field>
      </SectionCard>

      {/* P3 — premium conditions, level-gated */}
      <SectionCard
        icon={Sparkles}
        title={tp("premiumSection.title")}
        hint={tp("premiumSection.hint")}
      >
        <PremiumGate
          locked={premiumLocked}
          lockedHint={tp("premiumSection.locked", {
            level: PREMIUM_PREFERENCE_MIN_LEVEL.education,
          })}
          cta={tp("premiumSection.cta")}
        >
          <div className="flex flex-col gap-4">
            <Field label={tp("education.label")}>
              <ChipPicker
                multiple
                options={EDUCATION_OPTIONS}
                selected={prefs.education}
                onChange={(next) => updatePrefs("education", next)}
                labelOf={tf}
              />
            </Field>

            <Field label={tp("languages.label")}>
              <ChipPicker
                multiple
                options={LANGUAGE_OPTIONS}
                selected={prefs.languages}
                onChange={(next) => updatePrefs("languages", next)}
                labelOf={tf}
              />
            </Field>

            <Field label={tp("religions.label")}>
              <ChipPicker
                multiple
                options={RELIGION_OPTIONS}
                selected={prefs.religions}
                onChange={(next) => updatePrefs("religions", next)}
                labelOf={tf}
              />
            </Field>

            <Field label={tp("children.label")}>
              <ChipPicker
                multiple
                options={CHILDREN_OPTIONS}
                selected={prefs.children}
                onChange={(next) => updatePrefs("children", next)}
                labelOf={tf}
              />
            </Field>

            <Field label={tp("assetMin.label")}>
              {single(ASSET_OPTIONS, prefs.assetMin, (next) =>
                updatePrefs("assetMin", next),
              )}
            </Field>

            <Field label={tp("cities.label")} htmlFor="prefCity">
              <Input
                id="prefCity"
                name="prefCity"
                placeholder={tp("cities.placeholder")}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }
                  event.preventDefault();
                  const value = event.currentTarget.value.trim();
                  if (!value || prefs.cities.includes(value)) {
                    return;
                  }
                  updatePrefs("cities", [...prefs.cities, value]);
                  event.currentTarget.value = "";
                }}
              />
              {prefs.cities.length > 0 ? (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {prefs.cities.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        onClick={() =>
                          updatePrefs(
                            "cities",
                            prefs.cities.filter((item) => item !== city),
                          )
                        }
                        className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {city} ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Field>

            <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
              <span className="text-xs font-medium">
                {tp("noTattoo.label")}
              </span>
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={prefs.noTattoo}
                onChange={(event) =>
                  updatePrefs("noTattoo", event.target.checked)
                }
              />
            </label>
          </div>
        </PremiumGate>
      </SectionCard>

      {/* P4 — individually charged conditions */}
      <SectionCard
        icon={BadgeCheck}
        title={tp("exclusiveSection.title")}
        hint={tp("exclusiveSection.hint")}
      >
        <ul className="flex flex-col gap-2">
          {availableExclusive.map((definition) => {
            const code = definition.code;
            const price = exclusivePrice(code, level);
            const isPaid = price === 0 || paid.includes(code);
            const enabled = prefs.exclusive.includes(code);
            const effective = enabled && isPaid;

            return (
              <li
                key={code}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                  enabled
                    ? effective
                      ? "border-violet-500/40 bg-violet-500/5"
                      : "border-amber-500/40 bg-amber-500/5"
                    : "border-border",
                )}
              >
                <input
                  type="checkbox"
                  aria-label={tp(`exclusive.${code}.label`)}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                  checked={enabled}
                  onChange={() => toggleExclusive(code)}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">
                    {tp(`exclusive.${code}.label`)}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {tp(`exclusive.${code}.desc`)}
                  </p>

                  {definition.sensitive ? (
                    <p className="mt-1 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                      {tp("exclusive.sensitiveNotice")}
                    </p>
                  ) : null}

                  {enabled ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-1.5 border-transparent",
                        effective
                          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {effective
                        ? tp("exclusive.active")
                        : tp("exclusive.inactive")}
                    </Badge>
                  ) : null}
                </div>

                {price > 0 && !isPaid ? (
                  <Button
                    size="xs"
                    variant="outline"
                    className="shrink-0 rounded-full"
                    onClick={() => purchaseExclusive(code)}
                  >
                    {tp("exclusive.unlock", { price })}
                  </Button>
                ) : (
                  <span className="shrink-0 pt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {tp("exclusive.unlocked")}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-[11px] text-muted-foreground">
            {tp("exclusive.payHint")}
          </span>
          <span className="text-xs font-semibold tabular-nums">
            {tp("exclusive.total", { amount: `$${exclusiveCost}` })}
          </span>
        </div>
      </SectionCard>

      <p className="mt-3 flex items-start gap-2 px-1 pb-2 text-[11px] leading-relaxed text-muted-foreground">
        <Globe2 className="mt-0.5 size-3 shrink-0" />
        {tp("complianceNote")}
      </p>
    </>
  );
}
