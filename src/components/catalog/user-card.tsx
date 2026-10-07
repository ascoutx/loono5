import { Crown, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { VerificationBadges } from "@/components/profile/verification-badges";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/types/user";

interface UserCardProps {
  user: PublicUser;
  /** False when the target is above the viewer's tier → blurred preview. */
  unlocked: boolean;
}

/**
 * Catalog grid tile. Locked tiles keep the same footprint while blurring,
 * so upgrading never reflows the grid.
 *
 * Renders no interactive element of its own: the caller wraps it in a
 * `Link`, which keeps the anchor/button nesting valid.
 */
export function UserCard({ user, unlocked }: UserCardProps) {
  const t = useTranslations("user");
  const tt = useTranslations("tier");

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative block aspect-[3/4] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt=""
          loading="lazy"
          className={cn(
            "size-full object-cover transition-transform duration-300",
            unlocked && "group-hover:scale-105",
          )}
        />

        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {user.isOnline ? (
            <>
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {t("online")}
            </>
          ) : (
            user.city
          )}
        </span>

        {user.level > 1 ? (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <Crown className="size-2.5" />L{user.level}
          </span>
        ) : null}

        {unlocked ? (
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left">
            <span className="block truncate text-sm font-semibold text-white">
              {user.name}
            </span>
            <span className="flex items-center gap-0.5 truncate text-[11px] text-white/80">
              <MapPin className="size-2.5" />
              {t("ageCity", { age: user.age, city: user.city })}
            </span>
          </span>
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/35 px-3 text-center">
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
              <Crown className="size-2.5" />L{user.level}
            </span>
            <span className="text-[11px] leading-tight font-medium text-white">
              {tt("requiredLevel", { level: user.level })}
            </span>
          </span>
        )}
      </div>

      {/* Fixed-height strip so locked and unlocked tiles stay aligned.
          Badges are a public trust signal, so they show either way. */}
      <div className="flex min-h-7 items-center px-2 py-1">
        <VerificationBadges
          tags={user.verifications}
          size="xs"
          max={4}
          className="gap-0.5"
        />
      </div>
    </Card>
  );
}

/** Small inline tier badge used in lists and headers. */
export function LevelBadge({ level }: { level: number }) {
  return (
    <Badge variant="outline" className="gap-0.5 text-[10px]">
      <Crown className="size-2.5" />L{level}
    </Badge>
  );
}
