import { getTranslations, setRequestLocale } from "next-intl/server";

import { ThreadList } from "@/components/chat/thread-list";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ScreenHeader } from "@/components/layout/screen-header";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("chats");

  return (
    <>
      {/*
        Mobile: header + list, exactly as before.
        Desktop: the list lives in the rail rendered by `chats/layout.tsx`,
        so this route only has to invite the reader to pick a conversation.
      */}
      <ScreenHeader
        title={t("title")}
        center
        action={<LocaleSwitcher />}
        className="xl:hidden"
      />

      <div className="xl:hidden">
        <ThreadList className="pb-4" />
      </div>

      <div className="hidden flex-1 flex-col items-center justify-center gap-1.5 px-6 text-center xl:flex">
        <p className="text-sm font-medium">{t("title")}</p>
        <p className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
          {t("selectHint")}
        </p>
      </div>
    </>
  );
}
