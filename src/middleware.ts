import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * In production the two surfaces are split by domain: partner.loono.com
 * points at the same deployment as loono.com, and the host header is what
 * tells them apart.
 */
const PARTNER_HOST = /^partner\./i;

/**
 * Locally there is no DNS to lean on, so the split is by port instead:
 * :3000 serves the consumer site, :3001 the partner cabinet. Both are
 * overridable for anyone running the pair somewhere unusual.
 */
const SITE_PORT = process.env.SITE_PORT ?? "3000";
const PARTNER_PORT = process.env.PARTNER_PORT ?? "3001";

/**
 * The cross-port bounce below is a development convenience only. In
 * production the host carries no port (or sits behind a proxy), so this stays
 * off — otherwise a deployment that happens to listen on :3000 would send its
 * own /partner traffic somewhere else entirely.
 */
const DEV_BOUNCE = process.env.NODE_ENV !== "production";

/** Optional leading locale segment, e.g. `/en` in `/en/login`. */
const LOCALE_SEGMENT = /^\/(?:zh|en|ru)(?=\/|$)/;

/** Splits `/en/login` into its locale segment and the path behind it. */
function splitLocale(pathname: string): { locale: string; rest: string } {
  const match = pathname.match(LOCALE_SEGMENT);

  return match
    ? { locale: match[0], rest: pathname.slice(match[0].length) }
    : { locale: "", rest: pathname };
}

/** True for `/partner` and anything beneath it. */
function isCabinetPath(rest: string): boolean {
  return rest === "/partner" || rest.startsWith("/partner/");
}

/**
 * Route by host, then by locale.
 *
 * The partner surface serves the B2B cabinet: its path is rewritten — not
 * redirected, so the address bar keeps the partner host — by prefixing
 * `/partner`. Any locale segment is preserved and re-inserted in the right
 * position, otherwise `/en/login` would land on `/partner/en/login` and 404.
 *
 * The rewritten path is then handed to next-intl rather than returned
 * straight away: the app tree is `[locale]/partner/...`, so a bare
 * `/partner/login` would match no route at all.
 */
export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { locale, rest } = splitLocale(request.nextUrl.pathname);

  if (PARTNER_HOST.test(host) || host.endsWith(`:${PARTNER_PORT}`)) {
    // Idempotent: a path that already targets the cabinet is left alone, so
    // the rewrite can never double up into /partner/partner.
    if (!isCabinetPath(rest)) {
      const url = request.nextUrl.clone();
      url.pathname = `${locale}/partner${rest === "" ? "/" : rest}`;
      return intlMiddleware(new NextRequest(url, { headers: request.headers }));
    }
  }

  // On the consumer port the cabinet belongs to the other port, so send the
  // request across rather than rendering both surfaces at one address. The
  // `/partner` prefix is dropped on the way so the two sites end up with
  // symmetrical URLs: :3000/partner/login -> :3001/login.
  if (DEV_BOUNCE && isCabinetPath(rest) && host.endsWith(`:${SITE_PORT}`)) {
    const url = request.nextUrl.clone();
    url.port = PARTNER_PORT;
    url.pathname = `${locale}${rest.slice("/partner".length) || "/"}`;
    // 307 keeps the method intact if this ever catches a form submission.
    return NextResponse.redirect(url, 307);
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
