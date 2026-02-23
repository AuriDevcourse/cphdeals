"use client";

import { ArrowDownUp, LocateFixed, Loader2 } from "lucide-react";

export type SortOption = "newest" | "cheapest" | "discount" | "nearest";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "cheapest", label: "Cheapest" },
  { value: "discount", label: "Biggest %" },
];

interface Props {
  selected: SortOption;
  onSelect: (sort: SortOption) => void;
  nearestLoading?: boolean;
  nearestAvailable?: boolean;
}

export function SortFilter({ selected, onSelect, nearestLoading, nearestAvailable = true }: Props) {
  return (
    <div className="flex items-center gap-2">
      <ArrowDownUp className="h-3.5 w-3.5 text-zinc-500" />
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                active
                  ? "bg-violet-500/80 text-white shadow-lg shadow-violet-500/10 backdrop-blur-md"
                  : "border border-zinc-200 bg-zinc-100 text-zinc-600 backdrop-blur-md hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
        {nearestAvailable && (
          <button
            onClick={() => onSelect("nearest")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              selected === "nearest"
                ? "bg-sky-500/80 text-white shadow-lg shadow-sky-500/10 backdrop-blur-md"
                : "border border-zinc-200 bg-zinc-100 text-zinc-600 backdrop-blur-md hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
            }`}
          >
            {nearestLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <LocateFixed className="h-3 w-3" />
            )}
            Nearest
          </button>
        )}
      </div>
    </div>
  );
}
