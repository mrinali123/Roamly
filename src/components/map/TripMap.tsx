"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { TripWithDays, PlaceType } from "@/types/trip";

const DAY_COLORS = ["#38BDF8", "#A855F7", "#22C55E", "#F97316", "#EC4899", "#F59E0B"];

function typeColor(type: PlaceType): string {
  switch (type) {
    case "restaurant":
    case "cafe":
      return "#F97316";
    case "shopping":
    case "market":
      return "#A855F7";
    case "nature":
    case "viewpoint":
      return "#22C55E";
    case "bar":
      return "#EC4899";
    case "landmark":
      return "#1E293B";
    default:
      return "#38BDF8";
  }
}

function fmtDur(m: number) {
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
}

interface TripMapProps {
  trip: TripWithDays;
  activeDayIndex: number;
}

export default function TripMap({ trip, activeDayIndex }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layersRef = useRef<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Init Leaflet once the component is client-side mounted
  useEffect(() => {
    if (!mounted || !containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default marker icon path issue with webpack
      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, { zoomControl: true, fadeAnimation: false, markerZoomAnimation: false }).setView([20, 0], 2);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      renderPins(L, map, showAll);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Update pins whenever day / showAll changes
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      renderPins(L, mapRef.current, showAll);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayIndex, showAll, trip]);

  // Fly to pin on custom event
  useEffect(() => {
    function handleFlyTo(e: Event) {
      const { lat, lng } = (e as CustomEvent<{ lat: number; lng: number }>).detail;
      mapRef.current?.setView([lat, lng], 15);
    }
    window.addEventListener("roamly:flyto", handleFlyTo);
    return () => window.removeEventListener("roamly:flyto", handleFlyTo);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function renderPins(L: any, map: any, showAllDays: boolean) {
    // Clear old layers
    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    const days = showAllDays
      ? trip.itinerary_days
      : [trip.itinerary_days[activeDayIndex]].filter(Boolean);

    const allLatLngs: [number, number][] = [];

    days.forEach((day, dayIdx) => {
      const sorted = [...day.places].sort((a, b) => a.order - b.order);
      const lineColor = DAY_COLORS[dayIdx % DAY_COLORS.length];
      const validPlaces = sorted.filter((p) => p.lat && p.lng);

      const routeCoords: [number, number][] = [];

      validPlaces.forEach((place) => {
        const color = typeColor(place.type);
        const coords: [number, number] = [place.lat, place.lng];
        routeCoords.push(coords);
        allLatLngs.push(coords);

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:${color};border:2.5px solid white;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:700;font-size:11px;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
            font-family:sans-serif;line-height:1;
          ">${place.order}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

        const marker = L.marker(coords, { icon }).bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;padding:4px 0;">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px;">${place.name}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:4px;">
              ⏰ ${place.best_time} &nbsp;·&nbsp; ⏱ ${fmtDur(place.duration_minutes)}
            </div>
            <div style="font-size:11px;color:#374151;line-height:1.4;">
              ${(place.description ?? "").slice(0, 100)}${(place.description ?? "").length > 100 ? "…" : ""}
            </div>
          </div>
        `);

        marker.addTo(map);
        layersRef.current.push(marker);
      });

      // Route polyline
      if (routeCoords.length >= 2) {
        const line = L.polyline(routeCoords, {
          color: lineColor,
          weight: 2.5,
          opacity: 0.75,
          dashArray: "6, 6",
        }).addTo(map);
        layersRef.current.push(line);
      }
    });

    // Fit map to all pins — use instant methods to avoid animation artifacts
    if (allLatLngs.length === 1) {
      map.setView(allLatLngs[0], 14);
    } else if (allLatLngs.length > 1) {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [50, 50], maxZoom: 14, animate: false });
    }
  }

  const height = "420px";

  if (!mounted) return <div style={{ width: "100%", height: "420px", borderRadius: 16, background: "rgba(255,255,255,0.03)" }} />;

  return (
    <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 bg-navy-800 px-4 py-2.5 border-b border-slate-700/60">
          <button
            onClick={() => setShowAll((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
              showAll
                ? "border-sky bg-sky/10 text-sky"
                : "border-slate-700 text-slate-400 hover:border-slate-500"
            }`}
          >
            {showAll ? "All days" : "Current day"}
          </button>
        </div>

        {/* Map container */}
        <div ref={containerRef} style={{ width: "100%", height }} />

        {/* Legend */}
        <div className="bg-navy-800 px-4 py-2 flex flex-wrap gap-3 text-xs text-slate-400 border-t border-slate-700/60">
          {[
            { color: "#1E293B", label: "Landmark" },
            { color: "#F97316", label: "Food" },
            { color: "#A855F7", label: "Shopping" },
            { color: "#22C55E", label: "Nature" },
            { color: "#EC4899", label: "Nightlife" },
            { color: "#38BDF8", label: "Other" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border border-white/30"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>
  );
}
