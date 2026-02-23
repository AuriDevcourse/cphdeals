"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Deal } from "@/lib/types";
import type { LatLng } from "@/lib/geocode";
import { geocodeDeals } from "@/lib/geocode";
import {
  MAP_CENTER,
  MAP_ZOOM,
  TILE_URL,
  TILE_ATTRIBUTION,
} from "@/lib/mapConfig";
import { DealMapMarker } from "./DealMapMarker";

// Suppress default marker icon lookup (we use custom SVG icons)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    const bounds = L.latLngBounds(
      positions.map((p) => L.latLng(p[0], p[1]))
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [map, positions]);
  return null;
}

export function DealMap({ deals }: { deals: Deal[] }) {
  const [coordsMap, setCoordsMap] = useState<Map<string, LatLng>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    geocodeDeals(deals).then((map) => {
      if (!cancelled) {
        setCoordsMap(map);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [deals]);

  const mappableDeals = useMemo(
    () => deals.filter((d) => d.location && coordsMap.has(d.location)),
    [deals, coordsMap]
  );

  // Jitter deals sharing the same neighborhood coords
  const getPosition = (deal: Deal): [number, number] => {
    const base = coordsMap.get(deal.location)!;
    const hash = deal.deal_id
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const radius = 0.002;
    const factor = ((hash % 5) + 1) / 5;
    return [
      base.lat + Math.cos(angle) * radius * factor,
      base.lng + Math.sin(angle) * radius * factor,
    ];
  };

  const positions = useMemo(
    () => mappableDeals.map((d) => getPosition(d)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mappableDeals, coordsMap]
  );

  return (
    <div className="relative h-[calc(100vh-300px)] min-h-[400px] w-full overflow-hidden rounded-xl border border-white/[0.08]">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
          <div className="text-sm text-zinc-400">Loading map...</div>
        </div>
      )}
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ZoomControl position="topright" />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div class="cluster-icon">${count}</div>`,
              className: "",
              iconSize: L.point(40, 40),
            });
          }}
        >
          {mappableDeals.map((deal, i) => (
            <DealMapMarker
              key={deal.deal_id}
              deal={deal}
              position={positions[i]}
            />
          ))}
        </MarkerClusterGroup>
        <FitBounds positions={positions} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-white/[0.08] bg-zinc-900/90 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Activity
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Food
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
            Entertainment
          </span>
        </div>
      </div>

      {/* Unmapped counter */}
      {!loading && deals.length > mappableDeals.length && (
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-white/[0.08] bg-zinc-900/90 px-3 py-2 text-xs text-zinc-500 backdrop-blur-md">
          {deals.length - mappableDeals.length} deal
          {deals.length - mappableDeals.length !== 1 ? "s" : ""} without
          location
        </div>
      )}
    </div>
  );
}
