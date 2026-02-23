// Copenhagen city center
export const MAP_CENTER: [number, number] = [55.6761, 12.5683];
export const MAP_ZOOM = 12;

// CartoDB Dark Matter — free, no API key
export const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Category marker colors — match categoryConfig in DealCard.tsx
export const MARKER_COLORS: Record<string, string> = {
  activity: "#10b981",
  food: "#f59e0b",
  entertainment: "#a855f7",
};
