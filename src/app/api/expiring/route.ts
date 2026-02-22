import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.HETZNER_API_URL || "http://46.225.135.183:8080";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = new URL("/api/expiring", API_URL);
  searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  const data = await res.json();
  return NextResponse.json(data);
}
