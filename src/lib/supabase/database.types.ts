/**
 * Hand-written shape of the tables in `supabase/migrations/0001_chat_core.sql`.
 *
 * Kept next to the migration rather than generated into `src/types/` so the
 * two can be diffed by eye. When a real schema lands, replace this with
 * `supabase gen types typescript` output — the client already accepts it as
 * the `Database` generic, so nothing else changes.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          handle: string;
          display_name: string;
          avatar_url: string | null;
          level: number;
          is_online: boolean;
          phone: string | null;
          ref_code: string | null;
          referred_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          handle: string;
          display_name?: string;
          avatar_url?: string | null;
          level?: number;
          is_online?: boolean;
          phone?: string | null;
          ref_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          level?: number;
          is_online?: boolean;
          phone?: string | null;
          ref_code?: string | null;
          referred_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      chats: {
        Row: {
          id: string;
          slug: string;
          /**
           * The member the thread belongs to. A slug is viewer-relative, so
           * uniqueness is `(slug, owner_id)` — see migration 0003.
           */
          owner_id: string | null;
          member_ids: string[];
          peer_id: string | null;
          peer_name: string | null;
          peer_avatar_url: string | null;
          peer_level: number | null;
          peer_is_online: boolean;
          /** Preview line for the conversation list. Trigger-maintained. */
          last_message_text: string | null;
          last_message_at: string | null;
          /** Red-badge number. Trigger-maintained from `messages.is_read`. */
          unread_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          owner_id?: string | null;
          member_ids?: string[];
          peer_id?: string | null;
          peer_name?: string | null;
          peer_avatar_url?: string | null;
          peer_level?: number | null;
          peer_is_online?: boolean;
          last_message_text?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          created_at?: string;
        };
        Update: {
          owner_id?: string | null;
          member_ids?: string[];
          peer_id?: string | null;
          peer_name?: string | null;
          peer_avatar_url?: string | null;
          peer_level?: number | null;
          peer_is_online?: boolean;
          last_message_text?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
        };
        Relationships: [];
      };

      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          body: string;
          original_locale: string;
          translated_body: string | null;
          translated_locale: string | null;
          is_translating: boolean;
          created_at: string;
          /**
           * Whether the recipient has seen it. In a two-person thread the
           * recipient is unambiguous, so this lives on the message rather than
           * in a per-member table — see migration 0004.
           */
          is_read: boolean;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          body: string;
          original_locale?: string;
          translated_body?: string | null;
          translated_locale?: string | null;
          is_translating?: boolean;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          translated_body?: string | null;
          translated_locale?: string | null;
          is_translating?: boolean;
          is_read?: boolean;
        };
        Relationships: [];
      };

      chat_visibility: {
        Row: {
          chat_id: string;
          user_id: string;
          hidden_at: string;
        };
        Insert: {
          chat_id: string;
          user_id: string;
          hidden_at?: string;
        };
        Update: {
          hidden_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_visibility_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_visibility_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      user_blocks: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      user_reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: ReportReason;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          reason: ReportReason;
          details?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "user_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_reports_reported_id_fkey";
            columns: ["reported_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_chat_member: { Args: { target_chat: string }; Returns: boolean };
      current_profile_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Row aliases, so call sites read as `MessageRow` rather than the long path. */
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ChatRow = Database["public"]["Tables"]["chats"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Closed set enforced by a CHECK constraint on `user_reports.reason`, so this
 * union and the database cannot disagree.
 */
export const REPORT_REASONS = [
  "spam",
  "harassment",
  "inappropriate_content",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/**
 * A chat row with the caller's own visibility rows attached.
 *
 * `listChats` embeds `chat_visibility` to find out which threads this member
 * has hidden. It is a left join, so the array is empty for a visible thread —
 * the filter is "no rows came back", not "rows came back". Doing it as one
 * embedded query rather than a second round trip also keeps the list to a
 * single read on every realtime event.
 */
export type ChatWithVisibility = ChatRow & {
  chat_visibility: { chat_id: string }[];
};
