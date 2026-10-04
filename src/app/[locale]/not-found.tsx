import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-5xl font-bold tracking-tight text-muted-foreground/40">
          404
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold">{t("notFound")}</p>
          <p className="text-sm text-muted-foreground">{t("notFoundHint")}</p>
        </div>
        <Button className="mt-2 rounded-full" render={<Link href="/" />}>
          {t("backHome")}
        </Button>
      </div>
    </AppShell>
  );
}
