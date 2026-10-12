"use client";

import { AlertCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatComposer } from "@/components/chat/composer";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ensureChatThread,
  fetchThreadMessages,
  markThreadRead,
  sendMessage,
  subscribeToMessages,
  type PeerDisplay,
} from "@/lib/supabase/chat";
import { ensureViewerProfile } from "@/lib/supabase/profile";
import {
  CHATS_HREF,
  useUnreadActions,
} from "@/components/chat/unread-provider";
import type { Message } from "@/types/chat";

type LoadState = "loading" | "ready" | "error";

export interface MessageThreadProps {
  /** Thread id from the URL — the same slug the chat row is keyed by. */
  slug: string;
  peer: PeerDisplay;
  /** The signed-in member, used to seed their `profiles` row on first open. */
  viewer: {
    displayName: string;
    avatarUrl: string | null;
    level: number;
  };
}

/**
 * One conversation, backed by Supabase.
 *
 * This is the first screen in the app that owns its data instead of reading a
 * module-level mock: it resolves a session, loads the history, subscribes to
 * new rows and writes new ones. Sending is optimistic — the bubble appears
 * immediately and is swapped for the persisted row on success — so the thread
 * never lags behind the composer.
 */
export function MessageThread({ slug, peer, viewer }: MessageThreadProps) {
  const t = useTranslations("chats");
  const locale = useLocale();
  const { markRead } = useUnreadActions();

  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [chatId, setChatId] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Ids of optimistic rows whose insert failed, so they can be retried in place.
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const load = useCallback(async () => {
    setState("loading");
    setError(null);

    try {
      const profile = await ensureViewerProfile(viewer);
      const chat = await ensureChatThread({
        slug,
        viewerProfileId: profile.id,
        peer,
      });

      setViewerId(profile.id);
      setChatId(chat.id);
      const history = await fetchThreadMessages(chat.id);

      // Opening a thread is what makes it read. The local count drops straight
      // away so the nav badge reacts to the tap, and the database recomputes
      // `chats.unread_count` from `messages.is_read` to agree with it.
      markRead(CHATS_HREF, chat.id);
      void markThreadRead(chat.id);

      setMessages(history);
      setState("ready");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setState("error");
    }
    // `viewer` is a fresh object literal on every render from the server
    // component; depending on it would re-run the bootstrap each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  // A message arriving while the thread is open is read by definition — the
  // member is looking at it — so it must not leave a badge behind. Only
  // incoming ones count; the optimistic echo of our own message is filtered
  // out above by id.
  useEffect(() => {
    if (!chatId || state !== "ready" || !viewerId) return;

    const hasIncoming = messages.some(
      (message) => message.senderId !== viewerId && !message.isRead,
    );

    if (hasIncoming) {
      void markThreadRead(chatId);
    }
  }, [messages, chatId, state, viewerId]);

  // Live updates. Realtime is an enhancement, not a requirement: if the table
  // is not in the publication the subscription simply never fires and the
  // thread still works for the person typing in it.
  useEffect(() => {
    if (!chatId) return;

    return subscribeToMessages(chatId, (incoming) => {
      setMessages((previous) =>
        // Our own insert arrives back through the channel; keep one copy.
        previous.some((message) => message.id === incoming.id)
          ? previous
          : [...previous, incoming],
      );
    });
  }, [chatId]);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, state]);

  const send = useCallback(
    async (text: string) => {
      if (!chatId || !viewerId) return;

      const optimisticId = `pending:${crypto.randomUUID()}`;
      const optimistic: Message = {
        id: optimisticId,
        threadId: chatId,
        senderId: viewerId,
        originalText: text,
        originalLocale: localeRef.current,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, optimistic]);

      try {
        const saved = await sendMessage({
          chatId,
          senderId: viewerId,
          body: text,
          locale: localeRef.current,
        });

        setMessages((previous) =>
          previous.map((message) =>
            message.id === optimisticId ? saved : message,
          ),
        );
        setFailed((previous) => {
          const next = new Set(previous);
          next.delete(optimisticId);
          return next;
        });
        // Clears any earlier failure banner now that a send has gone through.
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause));
        setFailed((previous) => new Set(previous).add(optimisticId));
      }
    },
    [chatId, viewerId],
  );

  const retry = useCallback(
    (message: Message) => {
      // Drop the failed row before resending, otherwise the retry adds a
      // second copy and both stay on screen.
      setMessages((previous) =>
        previous.filter((entry) => entry.id !== message.id),
      );
      setFailed((previous) => {
        const next = new Set(previous);
        next.delete(message.id);
        return next;
      });
      void send(message.originalText);
    },
    [send],
  );

  if (state === "loading") {
    return (
      <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 xl:px-8">
        {[0, 1, 2].map((index) => (
          <Skeleton
            key={index}
            className={`h-12 w-2/5 ${index % 2 === 0 ? "self-start" : "self-end"}`}
          />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="size-6 text-destructive" />
        <p className="max-w-[22rem] text-xs leading-relaxed text-muted-foreground">
          {error}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => void load()}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 xl:px-8">
          {messages.length === 0 ? (
            <li className="my-auto flex flex-col items-center gap-1.5 py-16 text-center">
              <p className="text-sm font-medium">{t("threadEmpty")}</p>
              <p className="max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
                {t("threadEmptyHint")}
              </p>
            </li>
          ) : null}

          {messages.length > 0 ? (
            <li className="my-1 text-center text-[10px] text-muted-foreground">
              {t("today")}
            </li>
          ) : null}

          {messages.map((message) => {
            const isOwn = message.senderId === viewerId;

            return (
              <li key={message.id} className="contents">
                <MessageBubble message={message} isOwn={isOwn} />
                {failed.has(message.id) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 self-start rounded-full text-[11px] text-destructive"
                    onClick={() => retry(message)}
                  >
                    <AlertCircle className="size-3" />
                    {t("sendFailed")}
                  </Button>
                ) : null}
              </li>
            );
          })}

          {error && messages.length > 0 ? (
            <li
              role="alert"
              className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-destructive"
            >
              <AlertCircle className="size-3" />
              {t("sendFailed")}
            </li>
          ) : null}

          <div ref={bottomRef} />
        </ul>

        <div className="sticky bottom-0 border-t border-border bg-background/95 px-3 pt-2 backdrop-blur md:px-5 xl:px-7">
          <ChatComposer
            onSend={(text) => void send(text)}
            disabled={!chatId || !viewerId}
          />
        </div>
      </div>
    </>
  );
}
