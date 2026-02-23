"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="text"
        placeholder="Search deals..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-100 pl-9 pr-8 text-sm text-zinc-800 outline-none backdrop-blur-xl transition-all placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-zinc-50 focus:ring-1 focus:ring-zinc-200 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-white/[0.15] dark:focus:bg-white/[0.07] dark:focus:ring-white/10"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
