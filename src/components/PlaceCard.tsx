"use client";

import type { Place, PlaceType } from "@/types/trip";
import type { WeatherHour } from "@/types/weather";
import WeatherBadge from "./weather/WeatherBadge";
import { getWeatherForTime } from "@/lib/weather";

const TYPE_ICON: Record<PlaceType, string> = {
  landmark: "🏛️", museum: "🎨", restaurant: "🍽️", cafe: "☕",
  bar: "🍸", shopping: "🛍️", nature: "🌿", viewpoint: "🌅",
  market: "🛒", activity: "⚡", transport: "🚆", accommodation: "🏨",
};

const TYPE_LABEL: Record<PlaceType, string> = {
  landmark: "Landmark", museum: "Museum", restaurant: "Restaurant", cafe: "Café",
  bar: "Bar", shopping: "Shopping", nature: "Nature", viewpoint: "Viewpoint",
  market: "Market", activity: "Activity", transport: "Transport", accommodation: "Stay",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface PlaceCardProps {
  place: Place;
  isLast?: boolean;
  weatherHourly?: WeatherHour[];
  dayDate?: string;
}

export default function PlaceCard({ place, isLast, weatherHourly, dayDate }: PlaceCardProps) {
  const icon = TYPE_ICON[place.type] ?? "📍";
  const label = TYPE_LABEL[place.type] ?? place.type;

  const placeWeather =
    weatherHourly && dayDate
      ? getWeatherForTime(weatherHourly, dayDate, place.best_time)
      : null;

  function handleFlyTo() {
    if (!place.lat || !place.lng) return;
    window.dispatchEvent(new CustomEvent("roamly:flyto", { detail: { lat: place.lat, lng: place.lng, name: place.name } }));
    document.getElementById("trip-map-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAskAI() {
    window.dispatchEvent(new CustomEvent("roamly:ask-ai", {
      detail: { message: `Tell me more about ${place.name} and share any tips for visiting.` },
    }));
  }

  return (
    <div className="relative flex gap-4">
      {/* Timeline stem */}
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-sky/40 bg-navy-800 text-lg shadow-md shadow-sky/10">
          {icon}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-gradient-to-b from-sky/30 to-transparent" />}
      </div>

      {/* Card */}
      <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
        <div className="rounded-xl border border-slate-700/60 bg-navy-800 p-4 transition-colors hover:border-slate-600">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky">{place.best_time}</span>
                <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400">{label}</span>
              </div>
              <h4 className="mt-1.5 text-base font-semibold text-white">{place.name}</h4>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs text-slate-300">⏱ {formatDuration(place.duration_minutes)}</span>
              {place.estimated_cost && (
                <span className="rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs text-emerald-400">{place.estimated_cost}</span>
              )}
              {place.lat && place.lng && (
                <button onClick={handleFlyTo} className="rounded-full bg-sky/10 px-2.5 py-0.5 text-xs text-sky hover:bg-sky/20 transition" title="Show on map">
                  📍 Map
                </button>
              )}
              <button onClick={handleAskAI} className="rounded-full bg-slate-700/60 px-2.5 py-0.5 text-xs text-slate-300 transition hover:bg-sky/20 hover:text-sky" title="Ask AI about this place">
                💬 Ask AI
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-400">{place.description}</p>

          {place.tips && (
            <div className="mt-3 flex gap-2 rounded-lg border border-amber-800/40 bg-amber-900/20 p-2.5">
              <span className="shrink-0 text-sm">💡</span>
              <p className="text-xs leading-relaxed text-amber-200/80">{place.tips}</p>
            </div>
          )}

          {/* Weather badge */}
          <WeatherBadge hourlyWeather={placeWeather} placeType={place.type} />
        </div>
      </div>
    </div>
  );
}
