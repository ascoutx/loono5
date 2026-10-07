import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ChatComposer } from "@/components/chat/composer";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ScreenHeader } from "@/components/layout/screen-header";
import { findThread, messagesByThread } from "@/lib/mock-data";

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

  const messages = messagesByThread[id] ?? [];

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

      <div className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 xl:px-8">
          <li className="my-1 text-center text-[10px] text-muted-foreground">
            {t("today")}
          </li>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === "u_current"}
            />
          ))}
        </ul>

        <div
          className="sticky bottom-0 border-t border-border bg-background/95 px-3 pt-2 backdrop-blur md:px-5 xl:px-7"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <ChatComposer />
        </div>
      </div>
    </>
  );
}
