"use client";

import { useEffect, useState, type ReactNode } from "react";

import { listBlockedProfileIds } from "@/lib/supabase/moderation";

/**
 * Removes members this person has blocked from a server-rendered list.
 *
 * The catalogue is still mock data rendered by a server component, so the
 * filter has to happen in the browser — but it is deliberately shaped as a
 * wrapper rather than a hook: the server keeps owning *what* the catalogue is,
 * and the client only subtracts from it.
 *
 * Until the catalogue moves into Supabase this is the only place blocks are
 * applied to browsing. The database enforces the same rule on profile reads
 * (see migration 0005), so the day the data moves, the behaviour is already
 * right in both layers.
 */
export function BlockedFilter<T extends { id: string }>({
  candidates,
  children,
}: {
  /** Members whose `id` is the one used by `user_blocks.blocked_id`. */
  candidates: T[];
  children: (visible: T[]) => ReactNode;
}) {
  const [blocked, setBlocked] = useState<Set<string> | null>(null);

  useEffect(() => {
    let active = true;

    listBlockedProfileIds()
      .then((ids) => {
        if (active) setBlocked(new Set(ids));
      })
      .catch(() => {
        // Showing an unfiltered feed beats showing an empty one.
        if (active) setBlocked(new Set());
      });

    return () => {
      active = false;
    };
  }, []);

  // Before the block list arrives, render everything. A brief flash of a
  // blocked face is less bad than the whole catalogue appearing after a delay.
  if (blocked === null) {
    return children(candidates);
  }

  return children(candidates.filter((candidate) => !blocked.has(candidate.id)));
}
