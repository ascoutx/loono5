import { MessageCircle, Search, User } from "lucide-react";

/**
 * B2C tabs only — exactly three: Search, Chats, Me.
 *
 * Two things are deliberately absent and must stay absent:
 *   · the partner (B2B) cabinet — reached exclusively via partner.loono.com
 *     (rewritten to /partner), never from consumer navigation;
 *   · any "agent / referral" entry — the consumer surface never mentions
 *     agents or agencies. The only outward door is the Partners application
 *     form, surfaced as a plain link, not as navigation.
 *
 * Shared by the mobile bottom bar and the desktop side rail so the two
 * navigations can never drift apart.
 */
export const NAV_TABS = [
  { href: "/catalog", icon: Search, key: "catalog" },
  { href: "/chats", icon: MessageCircle, key: "chats" },
  { href: "/profile", icon: User, key: "profile" },
] as const;

export type NavTabKey = (typeof NAV_TABS)[number]["key"];
