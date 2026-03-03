"use client";

const timeOptions = [
  { value: undefined, label: "Any time" },
  { value: 24, label: "Last 24h" },
] as const;

interface Props {
  selected: number | undefined;
  onSelect: (hours: number | undefined) => void;
}

export function TimeFilter({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {timeOptions.map((opt) => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-transparent bg-blue-500/80 text-white"
                : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.1] dark:hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
