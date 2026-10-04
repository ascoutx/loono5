import type { PublicUser } from "./user";

export interface ChatThread {
  id: string;
  /** Always the other participant; the viewer is resolved from context. */
  peer: Pick<PublicUser, "id" | "name" | "avatarUrl" | "level" | "isOnline">;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  /** Text in the language it was written in. */
  originalText: string;
  originalLocale: string;
  /** Machine translation shown under the original (PRD rule 4). */
  translatedText?: string;
  translatedLocale?: string;
  /** While the translation is still pending. */
  isTranslating?: boolean;
  status: MessageStatus;
  createdAt: string;
}
