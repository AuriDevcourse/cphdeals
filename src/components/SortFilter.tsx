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
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                active
                  ? "bg-violet-500/80 text-white shadow-lg shadow-violet-500/10 backdrop-blur-md"
                  : "border border-white/[0.08] bg-white/[0.04] text-zinc-400 backdrop-blur-md hover:bg-white/[0.1] hover:text-zinc-200"
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
