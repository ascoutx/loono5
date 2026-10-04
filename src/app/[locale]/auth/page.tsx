import { MessageCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MockSignInForm } from "@/components/auth/mock-sign-in-form";
import { AppShell } from "@/components/layout/app-shell";
import { ScreenHeader } from "@/components/layout/screen-header";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";

/**
 * Phone + SMS entry point. Backed by the local mock session:
 * any number is accepted and the code must be 1234.
 */
export default async function AuthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth");
  const tc = await getTranslations("common");

  return (
    <AppShell>
      <ScreenHeader title={tc("appName")} center action={<LocaleSwitcher />} />

      <div className="flex flex-1 flex-col px-4">
        <div className="flex flex-col gap-1 pt-4 pb-6">
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <MockSignInForm />

        <div className="flex items-center gap-3 py-6">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">{t("divider")}</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" size="lg" className="w-full rounded-full">
            WeChat
          </Button>
          <Button variant="outline" size="lg" className="w-full rounded-full">
            Apple
          </Button>
        </div>

        <div className="mt-auto pt-8 text-center">
          <Button
            variant="link"
            className="text-muted-foreground"
            render={<Link href="/catalog" />}
          >
            <MessageCircle className="size-4" />
            {t("hasAccount")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
