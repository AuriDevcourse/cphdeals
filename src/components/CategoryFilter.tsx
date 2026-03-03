"use client";

import {
  Dumbbell,
  UtensilsCrossed,
  Clapperboard,
  Beer,
  Clock,
  Check,
} from "lucide-react";

const categories = [
  { value: "activity", label: "Activities", icon: Dumbbell },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "drinks", label: "Drinks", icon: Beer },
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
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-zinc-500">Type</span>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = selected.has(cat.value);
          return (
            <button
              key={cat.value}
              onClick={() => onToggle(cat.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-transparent bg-white/90 text-zinc-900 dark:bg-white/90 dark:text-zinc-900"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {active ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              {cat.label}
            </button>
          );
        })}
        <button
          onClick={onExpiringToggle}
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
            expiring
              ? "border-transparent bg-amber-500/80 text-white"
              : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
          }`}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {expiring ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </span>
          Expiring
        </button>
      </div>
    </div>
  );
}
