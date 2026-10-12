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
          member_ids: string[];
          peer_id: string | null;
          peer_name: string | null;
          peer_avatar_url: string | null;
          peer_level: number | null;
          peer_is_online: boolean;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          member_ids?: string[];
          peer_id?: string | null;
          peer_name?: string | null;
          peer_avatar_url?: string | null;
          peer_level?: number | null;
          peer_is_online?: boolean;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          member_ids?: string[];
          peer_id?: string | null;
          peer_name?: string | null;
          peer_avatar_url?: string | null;
          peer_level?: number | null;
          peer_is_online?: boolean;
          last_message_at?: string | null;
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
        };
        Update: {
          translated_body?: string | null;
          translated_locale?: string | null;
          is_translating?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_chat_member: { Args: { target_chat: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Row aliases, so call sites read as `MessageRow` rather than the long path. */
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ChatRow = Database["public"]["Tables"]["chats"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
