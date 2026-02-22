"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DealSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/70">
      {/* Accent bar */}
      <div className="h-1.5 bg-zinc-800" />
      {/* Image area */}
      <Skeleton className="h-64 w-full rounded-none" />
      {/* Content */}
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="mb-4 h-5 w-3/4" />
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="rounded-xl bg-zinc-800/60 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
      {/* Perforated edge */}
      <div className="h-[18px] bg-zinc-800/30" />
      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}
