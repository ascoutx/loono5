"use client";

import { SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  /**
   * Called with the trimmed text. Fire-and-forget by design: the thread
   * renders the message optimistically and reconciles it once Supabase has
   * persisted the row, so the composer does not wait on the network.
   */
  onSend?: (text: string) => void;
  /** False while the thread is still resolving its session and chat row. */
  disabled?: boolean;
}

const MAX_LENGTH = 4000;

export function ChatComposer({ onSend, disabled = false }: ChatComposerProps) {
  const t = useTranslations("chats");
  const [text, setText] = useState("");

  const trimmed = text.trim();
  const canSend = trimmed.length > 0 && !disabled;

  function submit() {
    if (!canSend) {
      return;
    }

    onSend?.(trimmed);
    setText("");
  }

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends; Shift+Enter inserts a newline. Desktop keyboards
          // expect this, and on mobile the key never fires.
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={t("inputPlaceholder")}
        aria-label={t("inputPlaceholder")}
        rows={1}
        maxLength={MAX_LENGTH}
        disabled={disabled}
        className="max-h-32 min-h-10 flex-1 resize-none py-2.5"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!canSend}
        aria-label={t("send")}
        className="size-10 shrink-0 rounded-full"
      >
        <SendHorizonal className="size-4" />
      </Button>
    </form>
  );
}
