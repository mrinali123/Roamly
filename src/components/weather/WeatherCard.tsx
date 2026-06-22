"use client";

import type { WeatherDay, WeatherHour } from "@/types/weather";
import { uvLabel } from "@/lib/weather";

interface WeatherCardProps {
  day: WeatherDay;
  hourly: WeatherHour[];
  date: string;
}

function avgForDay(hourly: WeatherHour[], date: string) {
  const dayHours = hourly.filter((h) => h.time.startsWith(date));
  if (!dayHours.length) return null;
  return {
    humidity: Math.round(dayHours.reduce((s, h) => s + h.humidity, 0) / dayHours.length),
    windSpeed: Math.round(dayHours.reduce((s, h) => s + h.windSpeed, 0) / dayHours.length),
    maxUv: Math.max(...dayHours.map((h) => h.uvIndex)),
  };
}

export default function WeatherCard({ day, hourly, date }: WeatherCardProps) {
  const avg = avgForDay(hourly, date);
  const uv = uvLabel(avg?.maxUv ?? 0);

  return (
    <div className="mb-4 flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3">
      <div className="text-4xl">{day.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{day.condition}</p>
        <p className="text-xs text-slate-400">
          {day.maxTemp}° / {day.minTemp}°C
        </p>
      </div>
      {avg && (
        <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
          <div className="text-center">
            <p className="text-white font-medium">{avg.humidity}%</p>
            <p>Humidity</p>
          </div>
          <div className="text-center">
            <p className="text-white font-medium">{avg.windSpeed} km/h</p>
            <p>Wind</p>
          </div>
          <div className="text-center">
            <p className={`font-medium ${uv.color}`}>{uv.label}</p>
            <p>UV Index</p>
          </div>
        </div>
      )}
    </div>
  );
}
