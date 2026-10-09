import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Hosts that serve the B2B partner cabinet instead of the consumer site.
 *
 * Locally the cabinet is reached at /partner on the normal host, so this rule
 * is inert in development — it only kicks in once DNS for partner.loono.com
 * points at the same deployment.
 */
const PARTNER_HOST = /^partner\./i;

/** Optional leading locale segment, e.g. `/en` in `/en/login`. */
const LOCALE_SEGMENT = /^\/(?:zh|en|ru)(?=\/|$)/;

/**
 * Route by host, then by locale.
 *
 * partner.loono.com/* serves the B2B cabinet: the path is rewritten (not
 * redirected, so the address bar keeps the partner host) by prefixing
 * `/partner`. Any locale segment is preserved and re-inserted in the right
 * position, otherwise `/en/login` would land on `/partner/en/login` and 404.
 *
 * Everything else falls through to the next-intl middleware unchanged.
 */
export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (PARTNER_HOST.test(host)) {
    const { pathname } = request.nextUrl;
    const match = pathname.match(LOCALE_SEGMENT);
    const locale = match?.[0] ?? "";
    const rest = match ? pathname.slice(locale.length) : pathname;

    // Idempotent: a path that already targets the cabinet is left alone, so
    // the rewrite can never double up into /partner/partner.
    if (!rest.startsWith("/partner")) {
      const url = request.nextUrl.clone();
      url.pathname = `${locale}/partner${rest === "" ? "/" : rest}`;
      return NextResponse.rewrite(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  /**
   * Skip API, Next internals and any path that contains a file
   * extension (static assets).
   */
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
