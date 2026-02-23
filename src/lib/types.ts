export interface Deal {
  deal_id: string;
  source: string;
  category: "activity" | "food" | "entertainment";
  title: string;
  url: string;
  description: string;
  deal_price: number | null;
  original_price: number | null;
  discount_pct: number | null;
  location: string;
  provider: string | null;
  image_url: string | null;
  expiry: string | null;
  sold_out: number | null;
  created_at: string | null;
  updated_at: string;
}

export interface DealsResponse {
  deals: Deal[];
  count: number;
}

export interface StatsResponse {
  total: number;
  by_category: Record<string, number>;
  last_scan: string | null;
}
