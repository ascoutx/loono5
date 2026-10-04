import { USER_LEVELS, type PublicUser, type UserLevel } from "@/types/user";

/**
 * Tier Visibility Matrix (PRD rule 2).
 *
 * A member can view profiles at or below their own level:
 *   L1 → L1
 *   L2 → L1, L2
 *   L3 → L1, L2, L3
 *
 * Profiles above the viewer's level stay reachable, but their content is
 * blurred behind an "Upgrade Level" overlay.
 */
export function canView(
  viewerLevel: UserLevel,
  targetLevel: UserLevel,
): boolean {
  return targetLevel <= viewerLevel;
}

export function isLocked(
  viewerLevel: UserLevel,
  targetLevel: UserLevel,
): boolean {
  return targetLevel > viewerLevel;
}

/** Levels the viewer is allowed to browse, ascending. */
export function visibleLevels(viewerLevel: UserLevel): UserLevel[] {
  return USER_LEVELS.filter((level) => canView(viewerLevel, level));
}

/** The level a viewer must hold in order to unlock `targetLevel`. */
export function requiredLevelFor(targetLevel: UserLevel): UserLevel {
  return targetLevel;
}

export const TRIAL_DURATION_DAYS = 30;

export function trialExpiryFrom(start: Date = new Date()): string {
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + TRIAL_DURATION_DAYS);
  return expiry.toISOString();
}

/**
 * Equal Pay Rule (PRD rule 1): every user needs an active tier to browse
 * or chat, regardless of gender.
 */
export function hasActiveSubscription(
  user: PublicUser,
  now: Date = new Date(),
): boolean {
  const { subscription } = user;

  if (subscription.status === "none" || subscription.status === "expired") {
    return false;
  }

  if (subscription.level === null || subscription.expiresAt === null) {
    return false;
  }

  return new Date(subscription.expiresAt).getTime() > now.getTime();
}

/**
 * Effective level: a member with an expired subscription drops back to
 * no-access rather than keeping stale visibility.
 */
export function effectiveLevel(
  user: PublicUser,
  now: Date = new Date(),
): UserLevel | null {
  return hasActiveSubscription(user, now) ? user.subscription.level : null;
}

/** Combines equal pay + the visibility matrix into one access decision. */
export function canViewProfile(
  viewer: PublicUser,
  target: PublicUser,
  now: Date = new Date(),
): boolean {
  const viewerLevel = effectiveLevel(viewer, now);
  const targetLevel = effectiveLevel(target, now);

  if (viewerLevel === null || targetLevel === null) {
    return false;
  }

  return canView(viewerLevel, targetLevel);
}

/** Days remaining on a subscription; 0 once it has lapsed. */
export function daysUntilExpiry(
  expiresAt: string,
  now: Date = new Date(),
): number {
  const diff = new Date(expiresAt).getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / 86_400_000);
}
