import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { MessageThread } from "@/components/chat/message-thread";
import { ScreenHeader } from "@/components/layout/screen-header";
import { getCurrentUser } from "@/lib/auth/current-user";
import { findThread } from "@/lib/mock-data";

/**
 * The message list is fetched by the client (`MessageThread`) rather than
 * rendered here, so this route must not be prerendered — the shell is enough
 * to build, the history arrives after sign-in resolves.
 */
export const dynamic = "force-dynamic";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("chats");

  const thread = findThread(id);
  if (!thread) {
    notFound();
  }

  const viewer = await getCurrentUser();

  return (
    <>
      <ScreenHeader
        backHref="/chats"
        // The rail is always visible from xl up, so the back arrow would
        // only ever lead to the "pick a conversation" placeholder.
        backClassName="xl:hidden"
        title={thread.peer.name}
        action={
          thread.peer.isOnline ? (
            <span className="pe-2 text-[11px] text-emerald-600">
              {t("online")}
            </span>
          ) : null
        }
      />

      <MessageThread
        slug={thread.id}
        peer={{
          id: thread.peer.id,
          name: thread.peer.name,
          avatarUrl: thread.peer.avatarUrl,
          level: thread.peer.level,
          isOnline: thread.peer.isOnline,
        }}
        viewer={{
          displayName: viewer.name,
          avatarUrl: viewer.avatarUrl,
          level: viewer.subscription.level ?? viewer.level,
        }}
      />
    </>
  );
}
