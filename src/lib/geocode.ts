import type { Deal } from "./types";

export interface LatLng {
  lat: number;
  lng: number;
}

// Static lookup — covers all known Copenhagen neighborhoods from scrapers
const COPENHAGEN_COORDS: Record<string, LatLng> = {
  "nørrebro": { lat: 55.6961, lng: 12.5530 },
  "østerbro": { lat: 55.7050, lng: 12.5722 },
  "vesterbro": { lat: 55.6692, lng: 12.5500 },
  "indre by": { lat: 55.6786, lng: 12.5738 },
  "frederiksberg": { lat: 55.6802, lng: 12.5302 },
  "frederiksberg c": { lat: 55.6802, lng: 12.5302 },
  "amager": { lat: 55.6500, lng: 12.6050 },
  "københavn": { lat: 55.6761, lng: 12.5683 },
  "københavn k": { lat: 55.6786, lng: 12.5738 },
  "københavn v": { lat: 55.6692, lng: 12.5500 },
  "københavn n": { lat: 55.6961, lng: 12.5530 },
  "københavn ø": { lat: 55.7050, lng: 12.5722 },
  "københavn s": { lat: 55.6550, lng: 12.5900 },
  "kødbyen": { lat: 55.6690, lng: 12.5560 },
  "nordsjælland": { lat: 55.9500, lng: 12.3000 },
  "helsingør": { lat: 56.0360, lng: 12.6136 },
  "roskilde": { lat: 55.6415, lng: 12.0803 },
  "valby": { lat: 55.6612, lng: 12.5133 },
  "christianshavn": { lat: 55.6722, lng: 12.5930 },
  "sydhavnen": { lat: 55.6480, lng: 12.5390 },
  "islands brygge": { lat: 55.6610, lng: 12.5850 },
  "charlottenlund": { lat: 55.7530, lng: 12.5720 },
  "kongens lyngby": { lat: 55.7704, lng: 12.5038 },
  "hellerup": { lat: 55.7310, lng: 12.5720 },
  "hvidovre": { lat: 55.6310, lng: 12.4740 },
  "brønshøj": { lat: 55.7110, lng: 12.5070 },
  "vanløse": { lat: 55.6870, lng: 12.4870 },
};

const CACHE_KEY = "cph-geocode-cache";

function getCache(): Record<string, LatLng | null> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, LatLng | null>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

async function geocodeViaNominatim(location: string): Promise<LatLng | null> {
  const query = `${location}, Copenhagen, Denmark`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  try {
    // Respect Nominatim rate limit
    await new Promise((r) => setTimeout(r, 1100));
    const res = await fetch(url, {
      headers: { "User-Agent": "cph-deal-finder-web/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function geocodeLocation(location: string): Promise<LatLng | null> {
  const key = location.trim().toLowerCase();
  if (!key) return null;

  // 1. Static lookup
  if (COPENHAGEN_COORDS[key]) return COPENHAGEN_COORDS[key];

  // 2. localStorage cache
  const cache = getCache();
  if (key in cache) return cache[key];

  // 3. Nominatim fallback
  const result = await geocodeViaNominatim(location);
  cache[key] = result;
  setCache(cache);
  return result;
}

export async function geocodeDeals(
  deals: Deal[]
): Promise<Map<string, LatLng>> {
  const unique = [...new Set(deals.map((d) => d.location).filter(Boolean))];
  const result = new Map<string, LatLng>();

  for (const loc of unique) {
    const coords = await geocodeLocation(loc);
    if (coords) result.set(loc, coords);
  }

  return result;
}
