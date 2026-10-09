/**
 * Pulsing "verified" pill used above the hero headline.
 * White pill, emerald live dot, ink lettering.
 */
export function VerifiedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass-pill relative inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2.5">
      <span className="relative flex size-4 items-center justify-center">
        <span className="animate-loono-pulse-ring absolute inset-0 rounded-full bg-emerald-500/60" />
        <span className="size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-foreground/80 uppercase">
        {children}
      </span>
    </span>
  );
}
