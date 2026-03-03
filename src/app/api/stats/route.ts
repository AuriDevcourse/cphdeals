import { NextResponse } from "next/server";
import { filterJunkDeals } from "@/lib/dealFilter";

export const dynamic = "force-dynamic";

const API_URL = process.env.HETZNER_API_URL || "http://46.225.135.183:8080";

export async function GET() {
  const [statsRes, dealsRes] = await Promise.all([
    fetch(`${API_URL}/api/stats`, { cache: "no-store" }),
    fetch(`${API_URL}/api/deals?limit=500`, { cache: "no-store" }),
  ]);

  const stats = await statsRes.json();
  const dealsData = await dealsRes.json();
  const filtered = filterJunkDeals(dealsData.deals ?? []);

  // Recount categories from filtered deals so stats match what users see
  const by_category: Record<string, number> = {};
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  let new_today = 0;

  for (const deal of filtered) {
    by_category[deal.category] = (by_category[deal.category] ?? 0) + 1;
    if (deal.created_at) {
      const created = new Date(deal.created_at).getTime();
      if (now - created < DAY_MS) new_today++;
    }
  }

  return NextResponse.json({
    ...stats,
    total: filtered.length,
    by_category,
    new_today,
  });
}
