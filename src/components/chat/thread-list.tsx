"use client";

import { Crown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { VerificationBadges } from "@/components/profile/verification-badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ensureChatThread,
  listChats,
  subscribeToChats,
} from "@/lib/supabase/chat";
import type { ChatRow } from "@/lib/supabase/database.types";
import { ensureViewerProfile } from "@/lib/supabase/profile";
import { chatThreads, currentUser, findUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  CHATS_HREF,
  useUnreadActions,
} from "@/components/chat/unread-provider";

/**
 * The conversation list, read from Supabase.
 *
 * Rendered in two placements:
 *
 *   < xl  inline in the `/chats` page, i.e. the usual mobile list
 *   xl+   inside the left rail rendered by `(main)/chats/layout.tsx`
 *
 * Every value on screen — preview text, timestamp, unread badge — is a column
 * that database triggers maintain on each message write. The list therefore
 * never patches its own copy: it refetches whenever a `chats` row changes, so
 * what it shows is always what the database says. That is what makes the badge
 * clear when a thread is opened and the preview follow a sent message, rather
 * than those being two things that have to be remembered separately.
 */
export function ThreadList({ className }: { className?: string }) {
  const t = useTranslations("chats");
  const locale = useLocale();
  const pathname = usePathname();
  const { setUnread } = useUnreadActions();

  const [chats, setChats] = useState<ChatRow[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(
    async (profileId: string) => {
      const rows = await listChats(profileId);

      setChats(rows);
      setUnread(
        CHATS_HREF,
        Object.fromEntries(
          rows.map((row) => [row.id, row.unread_count] as const),
        ),
      );
    },
    [setUnread],
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        // Resolving the viewer first also creates the profile row, which is
        // what `chats.owner_id` points at.
        const profile = await ensureViewerProfile({
          displayName: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
          level: currentUser.subscription.level ?? currentUser.level,
        });

        if (!active) return;
        setViewerId(profile.id);
        await refresh(profile.id);
      } catch {
        // A list that cannot reach the database shows its empty state rather
        // than an error: there is nothing useful for a member to do about it
        // here, and the thread screen surfaces real failures properly.
      } finally {
        if (active) setLoaded(true);
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [refresh]);

  // Live updates: a sent message and a cleared badge both arrive as a change
  // to the `chats` row, so one subscription drives the whole list.
  useEffect(() => {
    if (!viewerId) return;

    return subscribeToChats(() => void refresh(viewerId));
  }, [viewerId, refresh]);

  // Threads are created when a member opens them, so on a first visit nothing
  // exists yet. Seed the rows from the catalogue of conversations once per
  // viewer: each call is an upsert, so re-running is free and any history
  // already there is left untouched. Guarded by a ref rather than by
  // `chats.length` so a partial failure still retries the missing rows.
  const seeded = useRef(false);

  useEffect(() => {
    if (!viewerId || seeded.current) return;

    seeded.current = true;

    void (async () => {
      try {
        for (const thread of chatThreads) {
          await ensureChatThread({
            slug: thread.id,
            viewerProfileId: viewerId,
            peer: {
              id: thread.peer.id,
              name: thread.peer.name,
              avatarUrl: thread.peer.avatarUrl,
              level: thread.peer.level,
              isOnline: thread.peer.isOnline,
            },
          });
        }

        await refresh(viewerId);
      } catch {
        // Leave the empty state in place; a member cannot act on this here.
      }
    })();
  }, [viewerId, refresh]);

  if (loaded && chats.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
        <p className="text-sm font-medium">{t("empty")}</p>
        <p className="text-xs text-muted-foreground">{t("emptyHint")}</p>
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col divide-y divide-border", className)}>
      {chats.map((chat) => {
        const href = `/chats/${chat.slug}`;
        const active = pathname === href;

        // Verification badges are demo directory data with no home in the
        // database yet, so they are still looked up from the catalogue by the
        // thread slug. Everything the bug reports involved is the Supabase
        // row above.
        const mockPeer = chatThreads.find(
          (thread) => thread.id === chat.slug,
        )?.peer;
        const peer = mockPeer ? findUser(mockPeer.id) : undefined;

        return (
          <li key={chat.id}>
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
                  <AvatarImage src={chat.peer_avatar_url ?? ""} alt="" />
                  <AvatarFallback>
                    {(chat.peer_name ?? "?").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {chat.peer_is_online ? (
                  <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">
                    {chat.peer_name}
                  </span>
                  {chat.peer_level ? (
                    <Crown className="size-2.5 shrink-0 text-muted-foreground" />
                  ) : null}
                  <VerificationBadges
                    tags={peer?.verifications}
                    size="xs"
                    max={3}
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {chat.last_message_text ?? t("draft")}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                {chat.last_message_at ? (
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(chat.last_message_at).toLocaleDateString(locale)}
                  </span>
                ) : null}
                {chat.unread_count > 0 ? (
                  <span className="text-destructive-foreground flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-medium">
                    {chat.unread_count > 99 ? "99+" : chat.unread_count}
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
