"use client";

export interface PriceRange {
  max?: number;
  min?: number;
}

const priceOptions: { label: string; range: PriceRange }[] = [
  { label: "<100", range: { max: 100 } },
  { label: "<250", range: { max: 250 } },
  { label: "<500", range: { max: 500 } },
  { label: ">500", range: { min: 500 } },
];

function rangesEqual(a: PriceRange, b: PriceRange) {
  return a.max === b.max && a.min === b.min;
}

interface Props {
  selected: PriceRange;
  onSelect: (range: PriceRange) => void;
}

export function PriceFilter({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {priceOptions.map((opt) => {
        const active = rangesEqual(selected, opt.range);
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(active ? {} : opt.range)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              active
                ? "bg-emerald-500/80 text-white shadow-lg shadow-emerald-500/10 backdrop-blur-md"
                : "border border-zinc-200 bg-zinc-100 text-zinc-600 backdrop-blur-md hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
