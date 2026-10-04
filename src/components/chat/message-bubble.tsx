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
 * Dual-text bubble (PRD rule 4).
 *
 * Reading order is inverted from the sender's perspective: the LARGE text is
 * the translation into the reader's own language, and the ORIGINAL wording sits
 * underneath in small grey type so the source language is still inspectable.
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const t = useTranslations("chats");

  // Primary is the reader's own language; fall back to the original until the
  // translation resolves.
  const primaryText = message.translatedText ?? message.originalText;

  // Only worth a second line when it adds information, i.e. the original
  // differs from what is shown up top (never for the reader's own messages).
  const showOriginal = primaryText !== message.originalText;

  return (
    <li
      className={cn(
        "flex w-full flex-col gap-0.5",
        isOwn ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3 py-2",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p className="text-[15px] leading-relaxed break-words">{primaryText}</p>
      </div>

      {/* Original wording, secondary and de-emphasised. */}
      {showOriginal ? (
        <p
          className={cn(
            "flex max-w-[82%] items-start gap-1 px-1 text-[11px] leading-snug text-muted-foreground",
            isOwn ? "justify-end text-right" : "text-left",
          )}
        >
          <Languages className="mt-0.5 size-2.5 shrink-0 opacity-70" />
          <span className="min-w-0 break-words">{message.originalText}</span>
        </p>
      ) : message.isTranslating ? (
        <p
          className={cn(
            "px-1 text-[11px] text-muted-foreground italic",
            isOwn ? "text-right" : "text-left",
          )}
        >
          {t("translating")}
        </p>
      ) : null}
    </li>
  );
}

/** Toggles the original-text row for the whole thread. */
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
