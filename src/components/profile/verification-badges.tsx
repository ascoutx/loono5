import {
  Banknote,
  Briefcase,
  Building2,
  GraduationCap,
  HeartHandshake,
  IdCard,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  VERIFICATION_MUTED_CLASS,
  VERIFICATION_TAGS,
  getTagDefinition,
} from "@/lib/verification";
import { cn } from "@/lib/utils";
import type { VerificationCode, VerificationTag } from "@/types/verification";

/**
 * Module R — badge rendering.
 *
 * Rules (R2):
 *   verified  → the icon carries its own colour
 *   anything else (never submitted, pending, rejected, expired) → grey
 */

const TAG_ICONS: Record<VerificationCode, LucideIcon> = {
  realname: IdCard,
  education: GraduationCap,
  job: Briefcase,
  income: Banknote,
  asset: Wallet,
  property: Building2,
  marriage: HeartHandshake,
  criminal: ShieldCheck,
};

const SIZES = {
  xs: { box: "size-4", icon: "size-2.5" },
  sm: { box: "size-5", icon: "size-3" },
  md: { box: "size-6", icon: "size-3.5" },
} as const;

type BadgeSize = keyof typeof SIZES;

interface VerificationBadgesProps {
  /**
   * Badges the member holds. Codes absent from this list count as
   * `unverified` and render grey.
   */
  tags: VerificationTag[] | undefined;
  /**
   * Render the whole registry in order, with unverified entries grey.
   * Leave off for the compact row used in lists, which only shows colour.
   */
  showUnverified?: boolean;
  /** Cap the icons; the remainder collapses into a "+N" chip. 0 = no cap. */
  max?: number;
  size?: BadgeSize;
  className?: string;
}

function resolveIcon(code: VerificationCode): LucideIcon {
  return TAG_ICONS[code];
}

export function VerificationBadges({
  tags,
  showUnverified = false,
  max = 0,
  size = "sm",
  className,
}: VerificationBadgesProps) {
  const t = useTranslations("verification");
  const metrics = SIZES[size];

  const statusOf = (code: VerificationCode) =>
    tags?.find((tag) => tag.code === code)?.status;

  const codes: VerificationCode[] = showUnverified
    ? VERIFICATION_TAGS.map((definition) => definition.code)
    : VERIFICATION_TAGS.filter(
        (definition) => statusOf(definition.code) === "approved",
      ).map((definition) => definition.code);

  if (codes.length === 0) {
    return null;
  }

  const visible = max > 0 ? codes.slice(0, max) : codes;
  const hidden = codes.length - visible.length;

  return (
    <ul
      className={cn("flex shrink-0 flex-wrap items-center gap-1", className)}
      aria-label={t("title")}
    >
      {visible.map((code) => {
        const verified = statusOf(code) === "approved";
        const Icon = resolveIcon(code);
        const name = t(`tags.${code}`);

        return (
          <li key={code}>
            <span
              role="img"
              title={`${name} · ${verified ? t("status.approved") : t("status.unverified")}`}
              aria-label={`${name} · ${verified ? t("status.approved") : t("status.unverified")}`}
              className={cn(
                "flex items-center justify-center rounded-full ring-1 ring-inset",
                metrics.box,
                verified
                  ? getTagDefinition(code)?.verifiedClass
                  : VERIFICATION_MUTED_CLASS,
              )}
            >
              <Icon className={metrics.icon} strokeWidth={2.5} />
            </span>
          </li>
        );
      })}

      {hidden > 0 ? (
        <li>
          <span
            className={cn(
              "flex items-center justify-center rounded-full bg-muted px-1 text-[10px] leading-none font-medium text-muted-foreground",
              size === "xs" ? "h-4" : "h-5",
            )}
          >
            +{hidden}
          </span>
        </li>
      ) : null}
    </ul>
  );
}

interface VerificationTagWallProps {
  tags: VerificationTag[] | undefined;
  /** Show the "grey means not verified yet" hint. */
  withHint?: boolean;
  className?: string;
}

/**
 * Full badge list — every registry entry gets a row, coloured or grey.
 * Used on the profile pages where there is room for labels.
 */
export function VerificationTagWall({
  tags,
  withHint = true,
  className,
}: VerificationTagWallProps) {
  const t = useTranslations("verification");

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <ul className="grid grid-cols-2 gap-2">
        {VERIFICATION_TAGS.map((definition) => {
          const code = definition.code;
          const status =
            tags?.find((tag) => tag.code === code)?.status ?? "unverified";
          const verified = status === "approved";
          const Icon = resolveIcon(code);

          return (
            <li key={code} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                  verified
                    ? definition.verifiedClass
                    : VERIFICATION_MUTED_CLASS,
                )}
              >
                <Icon className="size-4" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-xs font-medium",
                    !verified && "text-muted-foreground",
                  )}
                >
                  {t(`tags.${code}`)}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {t(`status.${status}`)}
                  {verified && definition.validityMonths
                    ? ` · ${t("validity.months", { months: definition.validityMonths })}`
                    : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {withHint ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {t("hint")}
        </p>
      ) : null}
    </div>
  );
}
