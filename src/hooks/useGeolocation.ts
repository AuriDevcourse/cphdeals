"use client";

import { useCallback, useState } from "react";

interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  coords: GeoPosition | null;
  loading: boolean;
  error: string | null;
  request: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coords, setCoords] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300_000,
        timeout: 10_000,
      }
    );
  }, []);

  return { coords, loading, error, request };
}
