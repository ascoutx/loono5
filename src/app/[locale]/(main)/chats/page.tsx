import { Crown } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { chatThreads } from "@/lib/mock-data";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("chats");

  return (
    <>
      <ScreenHeader title={t("title")} center action={<LocaleSwitcher />} />

      {chatThreads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
          <p className="text-sm font-medium">{t("empty")}</p>
          <p className="text-xs text-muted-foreground">{t("emptyHint")}</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border pb-4">
          {chatThreads.map((thread) => (
            <li key={thread.id}>
              <Link
                href={`/chats/${thread.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted"
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
                      {new Date(
                        thread.lastMessage.createdAt,
                      ).toLocaleDateString(locale)}
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
          ))}
        </ul>
      )}
    </>
  );
}
