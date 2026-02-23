"use client";

import { useStats } from "@/hooks/useDeals";

export function StatsBar() {
  const { data } = useStats();

  if (!data) return null;

  const lastScan = data.last_scan
    ? new Date(data.last_scan).toLocaleTimeString("da-DK", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500 backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-400">
      <span>
        <strong className="text-zinc-600 dark:text-zinc-300">{data.total}</strong> deals
      </span>
      {data.by_category.activity && (
        <span>{data.by_category.activity} activities</span>
      )}
      {data.by_category.food && <span>{data.by_category.food} food</span>}
      {data.by_category.entertainment && (
        <span>{data.by_category.entertainment} entertainment</span>
      )}
      <span className="sm:ml-auto">Last scan: {lastScan}</span>
    </div>
  );
}
