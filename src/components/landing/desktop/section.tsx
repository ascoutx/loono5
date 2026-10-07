import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared horizontal rhythm for the desktop landing.
 *
 * Deliberately independent of `CONTENT_WIDTH` in app-frame: the marketing page
 * is a full-bleed document, not a column inside the app shell, so it owns its
 * own 1180px measure.
 */
export const CONTAINER = "mx-auto w-full max-w-[1180px] px-6 xl:px-8";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(CONTAINER, className)}>{children}</div>;
}

/**
 * One vertical band of the page. `scroll-mt` keeps the sticky header from
 * covering a heading when a nav anchor jumps to it.
 */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 py-16 xl:py-24", className)}
    >
      {children}
    </section>
  );
}

/** Small caps pill above a section headline. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase backdrop-blur">
      {children}
    </span>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered && "items-center text-center",
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>

      <h2
        className={cn(
          "max-w-3xl bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-3xl font-bold tracking-tight text-balance text-transparent xl:text-[2.6rem] xl:leading-[1.15]",
        )}
      >
        {title}
      </h2>

      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-white/60 xl:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
