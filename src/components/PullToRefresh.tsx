"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const queryClient = useQueryClient();

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy < 0) {
      pulling.current = false;
      setPullDistance(0);
      return;
    }
    // Dampen the pull distance
    const damped = Math.min(dy * 0.4, MAX_PULL);
    setPullDistance(damped);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current && pullDistance === 0) return;
    pulling.current = false;

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.5);
      await queryClient.invalidateQueries();
      // Small delay so the spinner is visible
      await new Promise((r) => setTimeout(r, 400));
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, queryClient]);

  useEffect(() => {
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <>
      {/* Pull indicator */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-center overflow-hidden"
        style={{ height: pullDistance > 0 || refreshing ? "60px" : 0 }}
      >
        <div
          className="mt-3 flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 shadow-lg transition-opacity"
          style={{
            opacity: progress > 0.2 || refreshing ? 1 : 0,
            transform: `translateY(${pullDistance > 0 ? 0 : -40}px)`,
          }}
        >
          <RefreshCw
            className={`h-4 w-4 text-zinc-300 ${refreshing ? "animate-spin" : ""}`}
            style={{
              transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
            }}
          />
          <span className="text-xs font-medium text-zinc-300">
            {refreshing ? "Refreshing..." : progress >= 1 ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      </div>
      {children}
    </>
  );
}
