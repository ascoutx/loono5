"use client";

import { Crown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { VerificationBadges } from "@/components/profile/verification-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, usePathname } from "@/i18n/navigation";
import { chatThreads, findUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ThreadListProps {
  className?: string;
}

/**
 * The conversation list, shared by two placements:
 *
 *   < xl  inline in the `/chats` page, i.e. the usual mobile list
 *   xl+   inside the left rail rendered by `(main)/chats/layout.tsx`
 *
 * It is a client component purely so it can mark the open thread with
 * `usePathname`; on mobile that highlight simply never fires, because the
 * list is not on screen while a thread is open.
 */
export function ThreadList({ className }: ThreadListProps) {
  const t = useTranslations("chats");
  const locale = useLocale();
  const pathname = usePathname();

  if (chatThreads.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
        <p className="text-sm font-medium">{t("empty")}</p>
        <p className="text-xs text-muted-foreground">{t("emptyHint")}</p>
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col divide-y divide-border", className)}>
      {chatThreads.map((thread) => {
        // Threads carry a trimmed peer; the full record holds the badges.
        const peer = findUser(thread.peer.id);
        const href = `/chats/${thread.id}`;
        const active = pathname === href;

        return (
          <li key={thread.id}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                active ? "bg-muted" : "hover:bg-muted/50 active:bg-muted",
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="size-12">
                  <AvatarImage src={thread.peer.avatarUrl} alt="" />
                  <AvatarFallback>
                    {thread.peer.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {thread.peer.isOnline ? (
                  <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">
                    {thread.peer.name}
                  </span>
                  <Crown className="size-2.5 shrink-0 text-muted-foreground" />
                  <VerificationBadges
                    tags={peer?.verifications}
                    size="xs"
                    max={3}
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {thread.lastMessage
                    ? thread.lastMessage.originalText
                    : t("draft")}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                {thread.lastMessage ? (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(thread.lastMessage.createdAt).toLocaleDateString(
                      locale,
                    )}
                  </span>
                ) : null}
                {thread.unreadCount > 0 ? (
                  <span className="text-destructive-foreground flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium">
                    {thread.unreadCount}
                  </span>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
