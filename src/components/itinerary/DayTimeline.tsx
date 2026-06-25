"use client";

import { FileText } from "lucide-react";
import type { ItineraryDay } from "@/types/trip";
import type { WeatherHour } from "@/types/weather";
import PlaceCard from "./PlaceCard";

function formatDayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

interface DayTimelineProps {
  day: ItineraryDay;
  weatherHourly?: WeatherHour[];
}

export default function DayTimeline({ day, weatherHourly }: DayTimelineProps) {
  const sorted = [...day.places].sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Day header */}
      <div style={{ position: "relative", marginBottom: 36, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Watermark number */}
        <div aria-hidden="true" style={{ position: "absolute", top: -14, left: -10, fontSize: 88, fontWeight: 800, color: "rgba(255,255,255,0.03)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.04em" }}>
          {String(day.day_number).padStart(2, "0")}
        </div>
        {/* Date */}
        <p style={{ position: "relative", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#38BDF8", marginBottom: 8 }}>
          {formatDayDate(day.date)}
        </p>
        {/* Theme */}
        <h2 style={{ position: "relative", fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0 }}>
          {day.theme}
        </h2>
        {/* Places count chip */}
        <div style={{ position: "relative", marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "5px 14px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#38BDF8" }}>{sorted.length} stop{sorted.length !== 1 ? "s" : ""} today</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 12, top: 0, bottom: 0, width: 1,
          background: "linear-gradient(to bottom, transparent, rgba(56,189,248,0.3) 10%, rgba(56,189,248,0.2) 90%, transparent)",
        }} aria-hidden="true">
          {/* Animated traveling dot */}
          <div style={{
            position: "absolute", left: -3, width: 7, height: 7, borderRadius: "50%",
            background: "#38BDF8", boxShadow: "0 0 10px rgba(56,189,248,0.8)",
            animation: "tv-dot 5s ease-in-out infinite",
          }} />
        </div>

        {/* Place cards */}
        {sorted.map((place, idx) => (
          <PlaceCard
            key={`${place.name}-${idx}`}
            place={place}
            index={idx}
            isLast={idx === sorted.length - 1}
            weatherHourly={weatherHourly}
            dayDate={day.date}
          />
        ))}
      </div>

      {/* Daily notes */}
      {day.daily_notes && (
        <div style={{ marginTop: 8, marginLeft: 56, borderRadius: 16, border: "1px solid rgba(56,189,248,0.12)", background: "rgba(56,189,248,0.04)", padding: "18px 22px", display: "flex", gap: 12 }}>
          <FileText size={15} color="#38BDF8" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Day Notes</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.58)", lineHeight: 1.7 }}>{day.daily_notes}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tv-dot {
          0%, 100% { top: 0%; opacity: 0; }
          5%        { opacity: 1; }
          95%       { opacity: 1; }
          50%       { top: 92%; }
        }
      `}</style>
    </div>
  );
}
