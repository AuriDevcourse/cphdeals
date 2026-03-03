"use client";

import { Search, X, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setOpen(false);
    setValue("");
  };

  const handleSubmit = () => {
    onSearch(value.trim());
    setOpen(false);
  };

  return (
    <>
      {/* Mobile: search icon button */}
      <button
        onClick={handleOpen}
        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 sm:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile: overlay */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
          <div className="relative mx-4 mt-16">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              <Search className="ml-2 h-4 w-4 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search deals..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-9 flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              />
              {value && (
                <button
                  onClick={handleSubmit}
                  className="rounded-lg p-2 text-emerald-500 transition-colors hover:bg-emerald-500/10"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: always visible inline input */}
      <div className="relative hidden sm:block">
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
    </>
  );
}
