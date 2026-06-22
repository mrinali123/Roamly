"use client";

import { Droplets, Wind, Sun, Eye, Clock, AlertTriangle, Sunrise, Sunset } from "lucide-react";
import type { DayWeather } from "@/types/trip";
import type { WeatherDay } from "@/types/weather";

interface WeatherCardProps {
  aiWeather?: DayWeather;
  apiWeather?: WeatherDay;
}

function UVBadge({ value }: { value: string }) {
  const lower = value.toLowerCase();
  const [bg, color] =
    lower.includes("extreme") || lower.includes("very high")
      ? ["rgba(239,68,68,0.12)", "#EF4444"]
      : lower.includes("high")
      ? ["rgba(245,158,11,0.12)", "#F59E0B"]
      : ["rgba(34,197,94,0.12)", "#22C55E"];
  return (
    <span style={{ borderRadius: 6, padding: "2px 8px", background: bg, border: `1px solid ${color}30`, fontSize: 11, fontWeight: 600, color }}>
      {value}
    </span>
  );
}

export default function WeatherCard({ aiWeather, apiWeather }: WeatherCardProps) {
  if (!aiWeather && !apiWeather) return null;

  // Prefer AI weather (richer) over API weather
  if (aiWeather) {
    return (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(139,92,246,0.07))", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sun size={18} color="#38BDF8" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Today&apos;s Weather</span>
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 12 }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {aiWeather.temperature_high}
            </span>
            <div style={{ paddingBottom: 4 }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>{aiWeather.condition}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>Low {aiWeather.temperature_low}</p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: "20px 24px" }}>
          {[
            { icon: Droplets, label: "Humidity",   value: aiWeather.humidity },
            { icon: Wind,     label: "Wind",       value: aiWeather.wind },
            { icon: Sun,      label: "UV Index",   value: aiWeather.uv_index, isUV: true },
            { icon: Eye,      label: "Visibility", value: "Good" },
          ].map(({ icon: Icon, label, value, isUV }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "10px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Icon size={13} color="rgba(255,255,255,0.35)" />
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
              {isUV ? <UVBadge value={value} /> : (
                <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Sunrise / sunset */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Sunrise size={14} color="#F59E0B" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{aiWeather.sunrise}</span>
          </div>
          {/* Mini arc */}
          <div style={{ flex: 1, height: 2, marginInline: 12, borderRadius: 99, background: "linear-gradient(to right, rgba(245,158,11,0.5), rgba(245,158,11,0.1), rgba(245,158,11,0.5))" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{aiWeather.sunset}</span>
            <Sunset size={14} color="#F59E0B" />
          </div>
        </div>

        {/* Best outdoor hours */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={13} color="#38BDF8" />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Best outdoor:</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#38BDF8" }}>{aiWeather.best_outdoor_hours}</span>
        </div>

        {/* Travel advisory */}
        {aiWeather.travel_advisory && (
          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10, background: "rgba(245,158,11,0.04)" }}>
            <AlertTriangle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{aiWeather.travel_advisory}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: API weather (simpler display)
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(139,92,246,0.07))", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sun size={18} color="#38BDF8" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Today&apos;s Weather</span>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1 }}>
            {apiWeather!.maxTemp}°
          </span>
          <div style={{ paddingBottom: 4 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{apiWeather!.condition}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>Low {apiWeather!.minTemp}°</p>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "20px 24px", gap: 16 }}>
        {apiWeather!.windSpeed != null && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <Wind size={13} color="rgba(255,255,255,0.35)" />
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.3)" }}>Wind</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{apiWeather!.windSpeed} km/h</span>
          </div>
        )}
        {apiWeather!.uvIndex != null && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <Sun size={13} color="rgba(255,255,255,0.35)" />
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.3)" }}>UV Index</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{Math.round(apiWeather!.uvIndex)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
