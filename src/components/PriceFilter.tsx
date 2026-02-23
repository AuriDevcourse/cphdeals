"use client";

const priceOptions: { value: number | undefined; label: string }[] = [
  { value: undefined, label: "Any" },
  { value: 100, label: "Under 100" },
  { value: 250, label: "Under 250" },
  { value: 500, label: "Under 500" },
  { value: 1000, label: "Under 1000" },
];

interface Props {
  selected: number | undefined;
  onSelect: (price: number | undefined) => void;
}

export function PriceFilter({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {priceOptions.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.value)}
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
