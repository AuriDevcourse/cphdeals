"use client";

const timeOptions = [
  { value: undefined, label: "Any time" },
  { value: 24, label: "Last 24h" },
  { value: 168, label: "Last week" },
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
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              active
                ? "bg-blue-500/80 text-white shadow-lg shadow-blue-500/10 backdrop-blur-md"
                : "border border-white/[0.08] bg-white/[0.04] text-zinc-400 backdrop-blur-md hover:bg-white/[0.1] hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
