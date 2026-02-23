"use client";

import {
  Dumbbell,
  UtensilsCrossed,
  Clapperboard,
  Clock,
} from "lucide-react";

const categories = [
  { value: "activity", label: "Activities", icon: Dumbbell },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "entertainment", label: "Entertainment", icon: Clapperboard },
] as const;

interface Props {
  selected: Set<string>;
  expiring: boolean;
  onToggle: (cat: string) => void;
  onExpiringToggle: () => void;
}

export function CategoryFilter({
  selected,
  expiring,
  onToggle,
  onExpiringToggle,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const active = selected.has(cat.value);
        return (
          <button
            key={cat.value}
            onClick={() => onToggle(cat.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all sm:px-3 ${
              active
                ? "bg-white/90 text-zinc-900 shadow-lg shadow-white/5 dark:bg-white/90 dark:text-zinc-900"
                : "border border-zinc-200 bg-zinc-100 text-zinc-600 backdrop-blur-md hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className={`${active ? "inline" : "hidden"} sm:inline`}>
              {cat.label}
            </span>
          </button>
        );
      })}
      <button
        onClick={onExpiringToggle}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all sm:px-3 ${
          expiring
            ? "bg-amber-500/80 text-white shadow-lg shadow-amber-500/10 backdrop-blur-md"
            : "border border-zinc-200 bg-zinc-100 text-zinc-600 backdrop-blur-md hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        <span className={`${expiring ? "inline" : "hidden"} sm:inline`}>
          Expiring
        </span>
      </button>
    </div>
  );
}
