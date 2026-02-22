"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN = 20;
const MAX = 1000;

interface Props {
  selected: number | undefined;
  onSelect: (price: number | undefined) => void;
}

export function PriceFilter({ selected, onSelect }: Props) {
  const [value, setValue] = useState(selected ?? MAX);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external changes
  useEffect(() => {
    setValue(selected ?? MAX);
  }, [selected]);

  const handleChange = useCallback(
    (v: number) => {
      setValue(v);
      clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        onSelect(v >= MAX ? undefined : v);
      }, 200);
    },
    [onSelect]
  );

  const pct = ((value - MIN) / (MAX - MIN)) * 100;
  const isAll = value >= MAX;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={10}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="price-slider h-1.5 w-28 cursor-pointer appearance-none rounded-full sm:w-36"
        style={{
          background: isAll
            ? "rgba(255,255,255,0.08)"
            : `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
        }}
      />
      <span className="min-w-[70px] text-xs font-medium tabular-nums text-zinc-300">
        {isAll ? "Any price" : `Under ${value} kr.`}
      </span>
    </div>
  );
}
