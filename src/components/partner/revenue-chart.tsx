"use client";

import { useFormatter } from "next-intl";

import { cn } from "@/lib/utils";

export interface RevenuePoint {
  /** Short axis label, e.g. "Jan" or "W1". */
  label: string;
  amount: number;
}

/**
 * Dependency-free revenue chart: gradient columns with a value on hover/tap.
 * Bars are scaled against the period maximum.
 */
export function RevenueChart({
  data,
  currency,
  className,
}: {
  data: RevenuePoint[];
  currency: string;
  className?: string;
}) {
  const format = useFormatter();
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-32 items-end gap-1.5">
        {data.map((point) => {
          const ratio = point.amount / max;
          const peak = point.amount === max;

          return (
            <div
              key={point.label}
              className="group relative flex h-full flex-1 flex-col justify-end"
            >
              <span
                className={cn(
                  "w-full rounded-t-md bg-gradient-to-t from-loono-violet/45 to-loono-rose/85",
                  "opacity-80 transition-opacity duration-200 group-hover:opacity-100",
                  peak && "from-loono-violet/70 to-loono-rose",
                )}
                style={{ height: `${Math.max(ratio * 100, 3)}%` }}
              />
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-popover px-1.5 py-0.5 text-[10px] whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {format.number(point.amount, { style: "currency", currency })}
              </span>
              <span className="sr-only">
                {point.label}:{" "}
                {format.number(point.amount, { style: "currency", currency })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5">
        {data.map((point) => (
          <span
            key={point.label}
            aria-hidden
            className="flex-1 text-center text-[9px] text-muted-foreground"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
