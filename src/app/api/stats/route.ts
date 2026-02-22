import { NextResponse } from "next/server";

const API_URL = process.env.HETZNER_API_URL || "http://46.225.135.183:8080";

export async function GET() {
  const res = await fetch(`${API_URL}/api/stats`, { next: { revalidate: 60 } });
  const data = await res.json();
  return NextResponse.json(data);
}
