"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

/**
 * Dual-text bubble (PRD rule 4): original text on top, translation below.
 * The translation row only renders once it resolves.
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const t = useTranslations("chats");

  const showTranslation = message.translatedText ?? message.isTranslating;

  return (
    <li
      className={cn(
        "flex w-full flex-col gap-1",
        isOwn ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p className="break-words">{message.originalText}</p>
      </div>

      {showTranslation ? (
        <p
          className={cn(
            "max-w-[78%] px-1 text-xs leading-relaxed text-muted-foreground",
            isOwn ? "text-right" : "text-left",
          )}
        >
          {message.isTranslating ? (
            <span className="italic">{t("translating")}</span>
          ) : (
            <>
              <Languages className="me-1 inline size-3 align-[-0.15em]" />
              {message.translatedText}
            </>
          )}
        </p>
      ) : null}
    </li>
  );
}

/** Toggles the translation row for the whole thread. */
export function TranslateToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("chats");

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-pressed={enabled}
      className="gap-1 rounded-full text-xs text-muted-foreground"
    >
      <Languages className="size-4" />
      {t("translateToggle")}
    </Button>
  );
}
