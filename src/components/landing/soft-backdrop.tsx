/**
 * Decorative warm light pools behind the B2C landing hero.
 *
 * Replaces the previous dark aurora backdrop. On the light-luxury canvas the
 * accent is deliberately low-contrast — two soft champagne/rose glows rather
 * than saturated colour — so the headline type stays the focal point.
 *
 * Purely presentational: aria-hidden, no interaction, transform-only
 * animation so it stays on the compositor.
 */
export function SoftBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="animate-loono-drift absolute -top-28 -left-20 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.92_0.05_45/0.8),transparent_70%)] blur-2xl" />
      <div
        className="animate-loono-drift absolute top-10 -right-24 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.93_0.055_82/0.75),transparent_70%)] blur-2xl"
        style={{ animationDelay: "-3.5s" }}
      />
      <div
        className="animate-loono-drift absolute -bottom-28 left-1/4 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.94_0.035_20/0.6),transparent_70%)] blur-2xl"
        style={{ animationDelay: "-7s" }}
      />
    </div>
  );
}
