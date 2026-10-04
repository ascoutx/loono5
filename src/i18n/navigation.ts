import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware replacements for the Next.js primitives.
 * Always use these instead of `next/link` and `next/navigation`
 * so that the active locale prefix is applied automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
