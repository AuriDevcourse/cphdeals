"use client";

import dynamic from "next/dynamic";
import type { Deal } from "@/lib/types";

const DealMap = dynamic(
  () => import("./DealMap").then((mod) => ({ default: mod.DealMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-300px)] min-h-[400px] w-full items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-900/50">
        <div className="text-sm text-zinc-500">Loading map...</div>
      </div>
    ),
  }
);

export function DealMapWrapper({ deals }: { deals: Deal[] }) {
  return <DealMap deals={deals} />;
}
