import { useFormatter } from "next-intl";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AgentStat {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  currency?: string;
}

/** 2x2 KPI grid for the agent dashboard. */
export function AgentStatsGrid({ stats }: { stats: AgentStat[] }) {
  const format = useFormatter();

  return (
    <ul className="grid grid-cols-2 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const formatted = stat.currency
          ? format.number(stat.value, {
              style: "currency",
              currency: stat.currency,
            })
          : format.number(stat.value);

        return (
          <li key={stat.label}>
            <Card className="flex flex-col gap-1 p-3">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon className="size-3.5" />
                <span className="truncate">{stat.label}</span>
              </span>
              <span
                className={cn("text-lg font-bold tracking-tight tabular-nums")}
              >
                {formatted}
              </span>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
