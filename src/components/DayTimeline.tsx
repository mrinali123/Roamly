import type { ItineraryDay } from "@/types/trip";
import type { WeatherDay, WeatherHour } from "@/types/weather";
import PlaceCard from "./PlaceCard";
import WeatherCard from "./weather/WeatherCard";

function formatDayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

interface DayTimelineProps {
  day: ItineraryDay;
  weatherDay?: WeatherDay;
  weatherHourly?: WeatherHour[];
}

export default function DayTimeline({ day, weatherDay, weatherHourly }: DayTimelineProps) {
  const sorted = [...day.places].sort((a, b) => a.order - b.order);

  return (
    <div className="animate-step-enter">
      {/* Day header — premium glass card with gradient left border */}
      <div
        className="glass mb-5"
        style={{
          padding: "20px 24px",
          borderLeft: "4px solid #38BDF8",
          borderRadius: "0 20px 20px 0",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "#38BDF8", marginBottom: 6 }}>
              {formatDayDate(day.date)}
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: 0 }}>{day.theme}</h3>
          </div>
          <span
            style={{
              borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 600,
              background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", color: "#38BDF8",
            }}
          >
            {sorted.length} stop{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
        {day.daily_notes && (
          <p style={{ marginTop: 12, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{day.daily_notes}</p>
        )}
      </div>

      {/* Weather card */}
      {weatherDay && weatherHourly && (
        <WeatherCard day={weatherDay} hourly={weatherHourly} date={day.date} />
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {sorted.map((place, idx) => (
          <PlaceCard
            key={`${place.name}-${idx}`}
            place={place}
            isLast={idx === sorted.length - 1}
            weatherHourly={weatherHourly}
            dayDate={day.date}
          />
        ))}
      </div>
    </div>
  );
}
