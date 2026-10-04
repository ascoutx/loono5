/**
 * Pulsing "verified" pill used above the hero headline.
 */
export function VerifiedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass-pill relative inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2.5">
      <span className="relative flex size-4 items-center justify-center">
        <span className="animate-loono-pulse-ring absolute inset-0 rounded-full bg-emerald-400/70" />
        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px] shadow-emerald-400/70" />
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-white/90 uppercase">
        {children}
      </span>
    </span>
  );
}
