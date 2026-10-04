import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Frosted benefit card used in the hero section. */
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
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          "bg-gradient-to-br from-white/25 to-white/5 text-white",
          "ring-1 ring-white/20",
          "shadow-[0_6px_16px_-8px] shadow-black/60",
          "transition-transform duration-300 group-hover:scale-105",
        )}
      >
        <Icon className="size-5" strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/60">
          {description}
        </p>
      </div>
    </li>
  );
}
