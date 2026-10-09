import { cn } from "@/lib/utils";

export interface LandingStat {
  value: string;
  label: string;
}

/** Compact social-proof row: white pill panel, hairline dividers. */
export function StatsRow({
  stats,
  className,
}: {
  stats: LandingStat[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "glass-pill grid grid-cols-3 divide-x divide-border rounded-2xl py-2.5",
        className,
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="px-1.5 text-center">
          <dd className="text-sm font-bold text-foreground tabular-nums sm:text-base">
            {stat.value}
          </dd>
          <dt className="mt-0.5 text-[9px] leading-tight text-muted-foreground">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
