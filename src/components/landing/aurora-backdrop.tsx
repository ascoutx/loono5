/**
 * Decorative aurora blobs behind the hero. Purely presentational:
 * aria-hidden, no interaction, GPU-cheap transforms only.
 */
export function AuroraBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="animate-loono-drift absolute -top-24 -left-16 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.62_0.21_290/0.5),transparent_70%)] blur-2xl" />
      <div
        className="animate-loono-drift absolute top-16 -right-20 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.72_0.19_350/0.42),transparent_70%)] blur-2xl"
        style={{ animationDelay: "-3.5s" }}
      />
      <div
        className="animate-loono-drift absolute -bottom-24 left-1/4 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.15_265/0.45),transparent_70%)] blur-2xl"
        style={{ animationDelay: "-7s" }}
      />

      {/* Fine grain keeps the large gradients from banding on cheap panels. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
