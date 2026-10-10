"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Cycles through the supplied phrases with a blur-in transition.
 * Respects `prefers-reduced-motion` by rendering a static first phrase.
 */
export function RotatingTitle({
  phrases,
  intervalMs = 3400,
  className,
}: {
  phrases: readonly string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [phrases.length, intervalMs]);

  if (phrases.length === 0) return null;

  return (
    <span
      className={cn("relative block", className)}
      // Announced politely so screen readers get the full set, not just one.
      aria-live="polite"
    >
      <span className="sr-only">{phrases.join(". ")}</span>
      <span
        key={index}
        aria-hidden
        className={cn(
          // Metallic rose-gold sweep — the one place the B2C surface allows a
          // gradient, and it stays inside the rose/maroon ramp rather than
          // going neon. The midpoint is a full step deeper than a pastel so
          // the line still holds against a canvas that is no longer white.
          "animate-loono-rise block bg-gradient-to-r from-[#9c4a35] via-[#d78a6f] to-[#9c4a35] bg-clip-text text-transparent",
        )}
      >
        {phrases[index]}
      </span>
    </span>
  );
}
