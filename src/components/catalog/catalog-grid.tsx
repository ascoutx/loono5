"use client";

import { useTranslations } from "next-intl";

import { UserCard } from "@/components/catalog/user-card";
import { useBlockedProfiles } from "@/components/profile/use-blocked-profiles";
import { Link } from "@/i18n/navigation";
import type { PublicUser } from "@/types/user";

/**
 * The catalogue grid.
 *
 * A client component because blocks are browser-only state: they live behind
 * Supabase Auth, which the server has no session for. Everything the server
 * decides — who is in the catalogue, and which tiers the viewer may see — still
 * arrives as props; the client only subtracts members this person blocked.
 *
 * This cannot be a wrapper that receives a render function: a Server Component
 * cannot pass one across the RSC boundary, so the grid has to own its markup.
 */
export function CatalogGrid({
  users,
  visibleLevels,
}: {
  users: PublicUser[];
  /** Levels the viewer may see; anything else renders blurred. */
  visibleLevels: number[];
}) {
  const t = useTranslations("catalog");
  const blocked = useBlockedProfiles();

  const visible = new Set(visibleLevels);
  const shown =
    blocked === null ? users : users.filter((user) => !blocked.has(user.id));

  if (shown.length === 0) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground md:px-6 xl:px-8">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2 px-4 pb-6 md:grid-cols-3 md:gap-3 md:px-6 xl:grid-cols-4 xl:gap-4 xl:px-8">
      {shown.map((user) => (
        <li key={user.id}>
          <Link href={`/user/${user.id}`} className="block">
            <UserCard user={user} unlocked={visible.has(user.level)} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
