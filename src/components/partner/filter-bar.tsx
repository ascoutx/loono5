"use client";

import { useTransition } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
}

export interface PartnerOption extends FilterOption {
  /** Tier display name, used to group the select. */
  group: string;
  region: string;
}

export interface FilterBarLabels {
  agent: string;
  allAgents: string;
  from: string;
  to: string;
  reset: string;
  pending: string;
  presets: FilterOption[];
}

const FIELD = cn(
  "h-8 rounded-md border border-white/12 bg-white/5 px-2 text-xs text-white",
  "outline-none transition-colors [color-scheme:dark]",
  "hover:border-white/25 focus-visible:border-white/40",
);

/**
 * Partner + period filter for the cabinet lookup.
 *
 * State lives entirely in the URL, not in React: the page it drives is a
 * server component, and a window you can link to, reload or go back through
 * is worth more to an operator than one that only exists on screen. Every
 * change therefore rewrites the search params and lets the server re-render.
 *
 * Native controls on purpose — `<select>` and `<input type="date">` come with
 * keyboard handling, locale-aware layout and mobile pickers already; the only
 * work left is theming them for the charcoal surface (`color-scheme: dark`).
 */
export function FilterBar({
  partners,
  selectedId,
  from,
  to,
  maxDate,
  preset,
  labels,
}: {
  partners: PartnerOption[];
  selectedId: string;
  from: string;
  to: string;
  maxDate: string;
  preset: string | null;
  labels: FilterBarLabels;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const navigate = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  // Explicit dates and presets are mutually exclusive: editing a date drops
  // the preset, picking a preset clears the dates, so the server never has to
  // guess which one the operator meant.
  const chooseDates = (patch: { from?: string; to?: string }) =>
    navigate({ ...patch, preset: null });

  const choosePreset = (id: string) =>
    navigate({ preset: id, from: null, to: null });

  const groups = [...new Set(partners.map((partner) => partner.group))];

  return (
    <section className="partner-panel">
      <div className="flex flex-wrap items-end gap-3 p-4">
        <label className="flex min-w-[13rem] flex-1 flex-col gap-1.5">
          <span className="text-[10px] tracking-wide text-white/45 uppercase">
            {labels.agent}
          </span>
          <select
            value={selectedId}
            onChange={(event) =>
              navigate({ agent: event.target.value || null })
            }
            className={cn(FIELD, "w-full")}
          >
            <option value="">{labels.allAgents}</option>
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {partners
                  .filter((partner) => partner.group === group)
                  .map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.label} · {partner.region}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-wide text-white/45 uppercase">
            {labels.from}
          </span>
          <input
            type="date"
            value={from}
            max={to || maxDate}
            onChange={(event) => chooseDates({ from: event.target.value })}
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-wide text-white/45 uppercase">
            {labels.to}
          </span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            max={maxDate}
            onChange={(event) => chooseDates({ to: event.target.value })}
            className={FIELD}
          />
        </label>

        <div className="flex flex-wrap items-center gap-1">
          {labels.presets.map((option) => {
            const active = preset === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choosePreset(option.id)}
                aria-pressed={active}
                className={cn(
                  "h-8 rounded-md border px-2.5 text-xs transition-colors",
                  active
                    ? "border-white/30 bg-white/12 text-white"
                    : "border-white/12 text-white/55 hover:border-white/25 hover:text-white/85",
                )}
              >
                {option.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              navigate({ agent: null, from: null, to: null, preset: null })
            }
            title={labels.reset}
            className="flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2 text-xs text-white/40 transition-colors hover:text-white/75"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden md:inline">{labels.reset}</span>
          </button>

          {pending ? (
            <span
              role="status"
              aria-label={labels.pending}
              className="flex h-8 w-6 items-center justify-center text-white/45"
            >
              <Loader2 className="size-3.5 animate-spin" />
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
