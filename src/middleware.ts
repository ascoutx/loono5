import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  /**
   * Skip API, Next internals and any path that contains a file
   * extension (static assets).
   */
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
