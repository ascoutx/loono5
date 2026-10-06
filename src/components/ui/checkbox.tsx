"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import { cn } from "cn";

/**
 * Square checkbox used by consent / confirmation forms.
 *
 * Renders a `<span>` plus a hidden native `<input>`, so it keeps keyboard and
 * form semantics without needing a separate label element.
 */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative size-[18px] shrink-0 rounded-[5px] border border-input bg-transparent transition-colors outline-none",
        "after:absolute after:-inset-x-2.5 after:-inset-y-3",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        "dark:bg-input/30 dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
