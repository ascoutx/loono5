import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { ThreadList } from "@/components/chat/thread-list";
import { DESKTOP_GUTTER } from "@/components/layout/app-frame";

/**
 * Chats become the classic two-pane desktop layout from `xl` up: the
 * conversation list is pinned in the left rail while the thread itself
 * renders on the right.
 *
 * Below `xl` the rail is `display:none` and each route keeps the full width,
 * so the mobile flow (list → thread → back) is untouched.
 *
 * The rail's own height is capped at the viewport minus the desktop gutter
 * (`DESKTOP_GUTTER`, matching the `xl:` padding in BOTTOM_NAV_CLEARANCE) so
 * it scrolls internally instead of stretching the page.
 */
export default async function ChatsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Resolve the locale so nested pages inherit the request locale scope and
  // the rail's heading can be prerendered.
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("chats");

  return (
    <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
      <aside className="hidden xl:flex xl:w-[21rem] xl:shrink-0 xl:border-r xl:border-border">
        <div
          className="sticky top-0 flex w-full flex-col"
          style={{ maxHeight: `calc(100dvh - ${DESKTOP_GUTTER})` }}
        >
          <h2 className="shrink-0 px-4 pt-6 pb-3 text-base font-semibold">
            {t("title")}
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
            <ThreadList />
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
