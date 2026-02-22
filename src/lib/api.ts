import type { DealsResponse, StatsResponse } from "./types";

export async function fetchDeals(params: {
  category?: string;
  max_price?: number;
  limit?: number;
}): Promise<DealsResponse> {
  const url = new URL("/api/deals", window.location.origin);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.max_price) url.searchParams.set("max_price", String(params.max_price));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function searchDeals(
  q: string,
  max_price?: number
): Promise<DealsResponse> {
  const url = new URL("/api/search", window.location.origin);
  url.searchParams.set("q", q);
  if (max_price) url.searchParams.set("max_price", String(max_price));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchExpiring(hours = 48): Promise<DealsResponse> {
  const res = await fetch(`/api/expiring?hours=${hours}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
