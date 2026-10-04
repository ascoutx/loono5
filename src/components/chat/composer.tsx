"use client";

import { SendHorizonal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({ onSend }: { onSend?: (text: string) => void }) {
  const t = useTranslations("chats");
  const [text, setText] = useState("");

  const trimmed = text.trim();

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!trimmed) {
          return;
        }
        onSend?.(trimmed);
        setText("");
      }}
    >
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t("inputPlaceholder")}
        aria-label={t("inputPlaceholder")}
        rows={1}
        className="max-h-32 min-h-10 flex-1 resize-none py-2.5"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!trimmed}
        aria-label={t("send")}
        className="size-10 shrink-0 rounded-full"
      >
        <SendHorizonal className="size-4" />
      </Button>
    </form>
  );
}
