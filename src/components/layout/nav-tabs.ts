import { Compass, MessageCircle, User } from "lucide-react";

/**
 * B2C tabs only. The partner (B2B) cabinet is deliberately absent — it is
 * reached exclusively via /partner.
 *
 * Shared by the mobile bottom bar and the desktop side rail so the two
 * navigations can never drift apart.
 */
export const NAV_TABS = [
  { href: "/catalog", icon: Compass, key: "catalog" },
  { href: "/chats", icon: MessageCircle, key: "chats" },
  { href: "/profile", icon: User, key: "profile" },
] as const;

export type NavTabKey = (typeof NAV_TABS)[number]["key"];
