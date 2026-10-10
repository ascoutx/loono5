import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Benefit card used in the hero section — white card, champagne icon well. */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "glass-card group flex items-start gap-3 rounded-2xl p-4",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-loono-champagne",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          "bg-loono-sand text-loono-champagne-deep",
          "ring-1 ring-loono-champagne/40",
          "transition-transform duration-300 group-hover:scale-105",
        )}
      >
        <Icon className="size-5" strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}
