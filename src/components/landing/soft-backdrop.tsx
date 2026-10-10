/**
 * Decorative blush light pools behind the B2C landing hero.
 *
 * Peach on the left, pink on the right, a fainter rose wash at the bottom —
 * the trio is what makes the ivory canvas read warm and slightly flushed.
 * Chroma is matched to the `.loono-surface` pools; the two are on screen
 * together and must not read as different temperatures.
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
      <div className="animate-loono-drift absolute -top-28 -left-20 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.9_0.078_26/0.82),transparent_70%)] blur-2xl" />
      <div
        className="animate-loono-drift absolute top-10 -right-24 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.912_0.078_348/0.78),transparent_70%)] blur-2xl"
        style={{ animationDelay: "-3.5s" }}
      />
      <div
        className="animate-loono-drift absolute -bottom-28 left-1/4 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.925_0.068_10/0.62),transparent_70%)] blur-2xl"
        style={{ animationDelay: "-7s" }}
      />
    </div>
  );
}
