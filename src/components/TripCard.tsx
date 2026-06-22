"use client";

import Link from "next/link";
import type { Trip } from "@/types/trip";

const GRADIENTS = [
  "from-sky-500 to-blue-700", "from-purple-500 to-indigo-700",
  "from-emerald-500 to-teal-700", "from-orange-500 to-red-600",
  "from-pink-500 to-rose-700", "from-amber-500 to-orange-700",
];

function gradientFor(dest: string): string {
  let hash = 0;
  for (let i = 0; i < dest.length; i++) { hash = (hash << 5) - hash + dest.charCodeAt(i); hash |= 0; }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(arrival: string, departure: string): number {
  return Math.max(1, Math.round((new Date(departure).getTime() - new Date(arrival).getTime()) / 86_400_000) + 1);
}

interface TripCardProps {
  trip: Trip;
  isPast?: boolean;
  showTemplate?: boolean;
}

export default function TripCard({ trip, isPast = false, showTemplate = false }: TripCardProps) {
  const gradient = gradientFor(trip.destination);
  const days = daysBetween(trip.arrival_date, trip.departure_date);

  function handleUseAsTemplate() {
    try {
      const templateData = {
        destination: trip.destination,
        arrivalDate: "",
        arrivalTime: "",
        departureDate: "",
        departureTime: "",
        numTravelers: trip.num_travelers,
        tripPurpose: trip.trip_purpose,
        hotelName: trip.hotel_name,
        hotelAddress: trip.hotel_address ?? "",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        budgetLevel: trip.budget_level,
        interests: trip.interests,
        pace: trip.pace,
        mustVisit: trip.must_visit ?? "",
        dietaryPrefs: trip.dietary_prefs,
      };
      localStorage.setItem("roamly-trip-form", JSON.stringify(templateData));
      window.location.href = "/trips/new?from=template";
    } catch {}
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-700/60 bg-navy-800 transition-all ${isPast ? "opacity-70" : ""}`}>
      <Link href={`/trips/${trip.id}`} className="group block">
        {/* Gradient header */}
        <div className={`relative h-24 bg-gradient-to-br ${gradient} p-4`}>
          {isPast && <div className="absolute inset-0 bg-black/30" />}
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">{trip.trip_purpose}</p>
            <h3 className="mt-0.5 line-clamp-1 text-lg font-bold text-white">{trip.trip_title}</h3>
          </div>
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span>📍</span>
            <span>{trip.destination}</span>
          </div>
          {isPast && (
            <div className="absolute left-4 bottom-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/70">Past trip</div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{formatShortDate(trip.arrival_date)}</span>
            <span className="mx-2 h-px flex-1 bg-slate-700" />
            <span>{formatShortDate(trip.departure_date)}</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span>📅 {days} day{days !== 1 ? "s" : ""}</span>
            <span>👥 {trip.num_travelers}</span>
            <span className="capitalize">💰 {trip.budget_level}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {trip.interests.slice(0, 3).map((i) => (
              <span key={i} className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-300">{i}</span>
            ))}
          </div>
        </div>
      </Link>

      {/* Template button for past trips */}
      {showTemplate && (
        <div className="border-t border-slate-700/40 px-4 py-2.5">
          <button
            onClick={handleUseAsTemplate}
            className="text-xs text-sky hover:underline"
          >
            📋 Use as template
          </button>
        </div>
      )}
    </div>
  );
}
