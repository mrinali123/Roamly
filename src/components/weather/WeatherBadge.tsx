"use client";

import type { WeatherHour } from "@/types/weather";
import type { PlaceType } from "@/types/trip";

const OUTDOOR_TYPES: PlaceType[] = [
  "landmark", "nature", "viewpoint", "market", "activity",
];

interface WeatherBadgeProps {
  hourlyWeather?: WeatherHour | null;
  placeType: PlaceType;
}

export default function WeatherBadge({ hourlyWeather, placeType }: WeatherBadgeProps) {
  if (!hourlyWeather) return null;

  const isOutdoor = OUTDOOR_TYPES.includes(placeType);
  const { isRain, temp, uvIndex, icon } = hourlyWeather;

  // Rain warning (any place)
  if (isRain) {
    return (
      <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-yellow-700/40 bg-yellow-900/20 px-2.5 py-1.5">
        <span className="text-sm">🌧️</span>
        <span className="text-xs text-yellow-200/80">Rain expected — bring an umbrella</span>
      </div>
    );
  }

  // Only outdoor warnings for outdoor places
  if (isOutdoor) {
    if (uvIndex > 7) {
      return (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-orange-700/40 bg-orange-900/20 px-2.5 py-1.5">
          <span className="text-sm">☀️</span>
          <span className="text-xs text-orange-200/80">High UV — wear sunscreen</span>
        </div>
      );
    }
    if (temp > 35) {
      return (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-700/40 bg-red-900/20 px-2.5 py-1.5">
          <span className="text-sm">🥵</span>
          <span className="text-xs text-red-200/80">Very hot — consider visiting early morning</span>
        </div>
      );
    }
    if (!isRain && temp >= 20 && temp <= 28 && uvIndex < 6) {
      return (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-2.5 py-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-emerald-200/80">Great weather for this visit</span>
        </div>
      );
    }
  }

  return null;
}
