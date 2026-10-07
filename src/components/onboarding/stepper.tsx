"use client";

import { Check } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: string;
  label: string;
}

interface OnboardingStepperProps {
  steps: OnboardingStep[];
  children: ReactNode;
}

/**
 * Three-step onboarding progress bar.
 * The active step is derived from the URL so it stays correct without
 * prop drilling through the nested layout.
 */
export function OnboardingStepper({ steps, children }: OnboardingStepperProps) {
  const pathname = usePathname();
  const currentIndex = Math.max(
    steps.findIndex((step) => pathname.endsWith(`/${step.id}`)),
    0,
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ol className="mx-auto flex w-full max-w-[42rem] items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2 md:px-6">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1 w-full rounded-full transition-colors",
                  active || done ? "bg-primary" : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3" /> : null}
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
