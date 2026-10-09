import { cn } from "@/lib/utils";

/**
 * Cabinet panel chrome: hairline header over a flat body.
 *
 * Shared by the dashboard and the partner lookup so the two read as one
 * product. `bodyClassName` exists for panels that hold a table and want the
 * page padding removed while keeping the header rule.
 */
export function Panel({
  title,
  hint,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("partner-panel flex flex-col", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="text-[11px] font-medium tracking-[0.12em] text-white/70 uppercase">
          {title}
        </h2>
        {hint ? (
          <span className="text-[11px] text-white/40">{hint}</span>
        ) : null}
      </header>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
