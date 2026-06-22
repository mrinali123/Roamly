import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  geocodeDestination,
  fetchWeatherForecast,
} from "@/lib/weather";
import type { WeatherForecast } from "@/types/weather";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("destination, weather_cache, weather_cache_updated_at, user_id, is_public")
    .eq("id", id)
    .single<{
      destination: string;
      weather_cache: WeatherForecast | null;
      weather_cache_updated_at: string | null;
      user_id: string;
      is_public: boolean;
    }>();

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Return cached data if still fresh
  if (
    trip.weather_cache &&
    trip.weather_cache_updated_at &&
    Date.now() - new Date(trip.weather_cache_updated_at).getTime() < CACHE_TTL_MS
  ) {
    return NextResponse.json(trip.weather_cache);
  }

  // Geocode destination
  const coords = await geocodeDestination(trip.destination);
  if (!coords) {
    return NextResponse.json({ error: "Could not geocode destination" }, { status: 422 });
  }

  // Fetch from Open-Meteo
  const forecast = await fetchWeatherForecast(coords.lat, coords.lng);
  if (!forecast) {
    return NextResponse.json({ error: "Weather fetch failed" }, { status: 502 });
  }

  // Cache in Supabase
  await supabase
    .from("trips")
    .update({
      weather_cache: forecast,
      weather_cache_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json(forecast);
}
