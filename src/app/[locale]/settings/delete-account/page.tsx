import { DeleteAccountFlow } from "@/components/account/delete-account-flow";
import { AppShell } from "@/components/layout/app-shell";
import { getMockSession } from "@/lib/auth/session";

/**
 * Account deletion entry point (module Q).
 *
 * Lives outside the `(main)` route group so the bottom tab bar is hidden —
 * users should finish or explicitly leave this flow instead of wandering off
 * through the tabs.
 */
export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Resolve the locale so nested client components inherit the request scope.
  await params;

  const session = await getMockSession();

  return (
    <AppShell>
      <DeleteAccountFlow phone={session?.phone ?? null} />
    </AppShell>
  );
}
