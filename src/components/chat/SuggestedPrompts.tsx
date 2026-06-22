"use client";

import type { TripWithDays } from "@/types/trip";

interface SuggestedPromptsProps {
  trip: TripWithDays;
  onSelect: (prompt: string) => void;
  afterResponse?: boolean;
}

export default function SuggestedPrompts({
  trip,
  onSelect,
  afterResponse,
}: SuggestedPromptsProps) {
  const month = new Date(trip.arrival_date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long" }
  );

  const followUpPrompts = [
    "Can you give me more detail?",
    "Any alternatives?",
    "What should I know before going?",
  ];

  const basePrompts = [
    `Summarise my ${trip.itinerary_days.length}-day itinerary`,
    `What's the best way to get around ${trip.destination}?`,
    `Give me packing tips for this trip`,
    `What's the weather like in ${trip.destination} in ${month}?`,
  ];

  const contextual: string[] = [];

  if (trip.budget_level === "budget")
    contextual.push("How can I save money on this trip?");
  if (trip.budget_level === "luxury")
    contextual.push("What fine dining is near my itinerary?");
  if (trip.trip_purpose === "honeymoon")
    contextual.push("Which spots are most romantic?");
  if (trip.trip_purpose === "family")
    contextual.push("Any kid-friendly tips for these places?");
  if (trip.interests.some((i) => i.toLowerCase().includes("food")))
    contextual.push(`What local dishes must I try in ${trip.destination}?`);
  if (trip.interests.some((i) => /nature|outdoor|hik/i.test(i)))
    contextual.push(`Best outdoor spots near ${trip.destination}?`);
  if (trip.itinerary_days.length > 5)
    contextual.push("Which day looks the most tiring?");

  const prompts = afterResponse
    ? followUpPrompts
    : [...basePrompts, ...contextual].slice(0, 5);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {prompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className="shrink-0 rounded-full border border-slate-700/60 bg-[#0D1929] px-3 py-1.5 text-xs text-slate-300 transition hover:border-sky/50 hover:text-white whitespace-nowrap"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
