"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Deal } from "@/lib/types";
import { MARKER_COLORS } from "@/lib/mapConfig";
import { categoryConfig, getExpiryInfo } from "@/components/DealCard";

function createPinIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
    <circle cx="14" cy="14" r="6" fill="rgba(0,0,0,0.25)"/>
    <circle cx="14" cy="14" r="4" fill="white"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
  });
}

export function DealMapMarker({
  deal,
  position,
}: {
  deal: Deal;
  position: [number, number];
}) {
  const color = MARKER_COLORS[deal.category] ?? MARKER_COLORS.activity;
  const config = categoryConfig[deal.category] ?? categoryConfig.activity;
  const expiry = getExpiryInfo(deal.expiry);

  const icon = useMemo(() => createPinIcon(color), [color]);

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div>
          {deal.image_url && (
            <img
              src={deal.image_url}
              alt=""
              className="popup-image"
              loading="lazy"
            />
          )}
          <div className="popup-body">
            <div className="popup-category">
              <span className="popup-dot" style={{ background: color }} />
              {config.label}
              {expiry && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: expiry.urgent ? "#f87171" : "#fbbf24",
                    fontSize: 10,
                  }}
                >
                  {expiry.text}
                </span>
              )}
            </div>
            <h4 className="popup-title">{deal.title}</h4>
            <div className="popup-price">
              {deal.deal_price != null ? (
                <>
                  {Math.round(deal.deal_price)}
                  <span className="popup-currency"> kr.</span>
                  {deal.original_price != null && (
                    <s>{Math.round(deal.original_price)} kr.</s>
                  )}
                  {deal.fee != null && deal.fee > 0 && (
                    <span style={{ fontSize: 10, color: "#a1a1aa", marginLeft: 4 }}>
                      + {deal.fee % 1 === 0 ? deal.fee : deal.fee.toFixed(2)} gebyr
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 13, color: "#a1a1aa" }}>
                  See price on site
                </span>
              )}
            </div>
            {deal.location && (
              <div className="popup-location">{deal.location}</div>
            )}
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="popup-link"
            >
              View deal &rarr;
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
