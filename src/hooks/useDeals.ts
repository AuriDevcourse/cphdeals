"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDeals, searchDeals, fetchExpiring, fetchStats } from "@/lib/api";

export function useDeals(category?: string, maxPrice?: number) {
  return useQuery({
    queryKey: ["deals", category, maxPrice],
    queryFn: () => fetchDeals({ category, max_price: maxPrice, limit: 500 }),
  });
}

export function useSearchDeals(query: string, maxPrice?: number) {
  return useQuery({
    queryKey: ["search", query, maxPrice],
    queryFn: () => searchDeals(query, maxPrice),
    enabled: query.length > 0,
  });
}

export function useExpiring() {
  return useQuery({
    queryKey: ["expiring"],
    queryFn: () => fetchExpiring(48),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });
}
