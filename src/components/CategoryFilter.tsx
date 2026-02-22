"use client";

import {
  LayoutGrid,
  Dumbbell,
  UtensilsCrossed,
  Clapperboard,
  Clock,
} from "lucide-react";

const categories = [
  { value: undefined, label: "All", icon: LayoutGrid },
  { value: "activity", label: "Activities", icon: Dumbbell },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "entertainment", label: "Entertainment", icon: Clapperboard },
] as const;

interface Props {
  selected: string | undefined;
  expiring: boolean;
  onSelect: (cat: string | undefined) => void;
  onExpiringToggle: () => void;
}

export function CategoryFilter({
  selected,
  expiring,
  onSelect,
  onExpiringToggle,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const active = !expiring && selected === cat.value;
        return (
          <button
            key={cat.label}
            onClick={() => {
              onSelect(cat.value);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              active
                ? "bg-white/90 text-zinc-900 shadow-lg shadow-white/5 dark:bg-white/90 dark:text-zinc-900"
                : "border border-white/[0.08] bg-white/[0.04] text-zinc-400 backdrop-blur-md hover:bg-white/[0.1] hover:text-zinc-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        );
      })}
      <button
        onClick={onExpiringToggle}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          expiring
            ? "bg-amber-500/80 text-white shadow-lg shadow-amber-500/10 backdrop-blur-md"
            : "border border-white/[0.08] bg-white/[0.04] text-zinc-400 backdrop-blur-md hover:bg-white/[0.1] hover:text-zinc-200"
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        Expiring
      </button>
    </div>
  );
}
