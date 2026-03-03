"use client";

import { ArrowDownUp } from "lucide-react";

export type SortOption = "newest" | "cheapest" | "discount";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "cheapest", label: "Cheapest" },
  { value: "discount", label: "Biggest %" },
];

interface Props {
  selected: SortOption;
  onSelect: (sort: SortOption) => void;
}

export function SortFilter({ selected, onSelect }: Props) {
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
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-transparent bg-violet-500/80 text-white"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
