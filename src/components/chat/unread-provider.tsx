"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Unread counts, shared between the conversation list and the navigation.
 *
 * The counts themselves belong to the database — `chats.unread_count` is
 * maintained by a trigger, and the list refetches on any change to that row.
 * This context only carries them to the nav badge, which lives outside the
 * screen that produced them. It exists because threading them down from a
 * server layout is what had them hardcoded to a literal `2`.
 *
 * Keyed by nav href rather than flattened: a second surface gaining unread
 * anything later is a new entry here, not a change to the nav components.
 *
 * Nothing here is authoritative. Marking a chat read clears its entry
 * immediately so the badge reacts to the tap, and the next realtime event
 * confirms or corrects it.
 */

interface UnreadState {
  /** nav href → (chat id → unread count) */
  byHref: Record<string, Record<string, number>>;
  /** Publish a set of counts for one surface; called by the list after loading. */
  setUnread: (href: string, counts: Record<string, number>) => void;
  /** Zero one chat's count; called when a thread is opened. */
  markRead: (href: string, chatId: string) => void;
}

const UnreadContext = createContext<UnreadState | null>(null);

/** Only surface that reports unread today. */
export const CHATS_HREF = "/chats";

const NOOP = () => {};

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [byHref, setByHref] = useState<Record<string, Record<string, number>>>(
    {},
  );

  const setUnread = useCallback(
    (href: string, counts: Record<string, number>) => {
      setByHref((previous) => {
        const current = previous[href] ?? {};
        // Bail out when nothing changed so a realtime echo cannot re-render the
        // whole frame for no reason.
        const keys = Object.keys(counts);
        const same =
          keys.length === Object.keys(current).length &&
          keys.every((key) => current[key] === counts[key]);

        return same ? previous : { ...previous, [href]: counts };
      });
    },
    [],
  );

  const markRead = useCallback((href: string, chatId: string) => {
    setByHref((previous) => {
      const current = previous[href];

      if (!current?.[chatId]) {
        return previous;
      }

      const next = { ...current };
      delete next[chatId];

      return { ...previous, [href]: next };
    });
  }, []);

  const value = useMemo(
    () => ({ byHref, setUnread, markRead }),
    [byHref, setUnread, markRead],
  );

  return (
    <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
  );
}

/**
 * Totals per nav href, resolved in one hook call.
 *
 * Returning the whole map rather than a per-href getter is deliberate: the
 * navigation maps over `NAV_TABS`, and a hook invoked inside that loop would
 * break the rules of hooks.
 */
export function useUnreadTotals(): Record<string, number> {
  const context = useContext(UnreadContext);

  return useMemo(() => {
    if (!context) return {};

    return Object.fromEntries(
      Object.entries(context.byHref).map(([href, counts]) => [
        href,
        Object.values(counts).reduce((sum, count) => sum + count, 0),
      ]),
    );
  }, [context]);
}

/** Writers for the components that own the data. No-ops outside the provider. */
export function useUnreadActions(): Pick<
  UnreadState,
  "setUnread" | "markRead"
> {
  const context = useContext(UnreadContext);

  return {
    setUnread: context?.setUnread ?? NOOP,
    markRead: context?.markRead ?? NOOP,
  };
}
