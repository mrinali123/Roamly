import { createClient } from "@/lib/supabase/server";
import type {
  Trip,
  TripWithDays,
  ItineraryDay,
  TripFormData,
  GeneratedItinerary,
  DbChatMessage,
} from "@/types/trip";

export async function createTripWithItinerary(
  formData: TripFormData,
  itinerary: GeneratedItinerary,
  userId: string
): Promise<string> {
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: userId,
      destination: formData.destination,
      trip_title: itinerary.trip_title,
      arrival_date: formData.arrivalDate,
      departure_date: formData.departureDate,
      hotel_name: formData.hotelName,
      hotel_address: formData.hotelAddress,
      num_travelers: formData.numTravelers,
      trip_purpose: formData.tripPurpose,
      budget_level: formData.budgetLevel,
      pace: formData.pace,
      interests: formData.interests,
      dietary_prefs: formData.dietaryPrefs,
      must_visit: formData.mustVisit,
      estimated_budget: itinerary.estimated_budget,
      general_tips: itinerary.general_tips,
    })
    .select("id")
    .single<{ id: string }>();

  if (tripError || !trip) {
    throw new Error(tripError?.message ?? "Failed to create trip");
  }

  const dayRows = itinerary.days.map((d) => ({
    trip_id: trip.id,
    day_number: d.day_number,
    date: d.date,
    theme: d.theme,
    daily_notes: d.daily_notes,
    places: d.places,
  }));

  const { error: daysError } = await supabase
    .from("itinerary_days")
    .insert(dayRows);

  if (daysError) throw new Error(daysError.message);

  return trip.id;
}

export async function getTripWithDays(
  tripId: string,
  userId: string
): Promise<TripWithDays | null> {
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single<Trip>();

  if (tripError || !trip) return null;

  const { data: days, error: daysError } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true })
    .returns<ItineraryDay[]>();

  if (daysError) return null;

  return { ...trip, itinerary_days: days ?? [] };
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<Trip[]>();

  if (error) return [];
  return data ?? [];
}

export async function getTripByShareToken(
  token: string
): Promise<TripWithDays | null> {
  const supabase = await createClient();

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("share_token", token)
    .eq("is_public", true)
    .single<Trip>();

  if (error || !trip) return null;

  const { data: days } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("trip_id", trip.id)
    .order("day_number", { ascending: true })
    .returns<ItineraryDay[]>();

  return { ...trip, itinerary_days: days ?? [] };
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function getChatHistory(
  tripId: string,
  userId: string
): Promise<DbChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trip_chats")
    .select("id, role, content, created_at")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(20)
    .returns<DbChatMessage[]>();
  return data ?? [];
}

export async function saveChatMessage(
  tripId: string,
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("trip_chats").insert({ trip_id: tripId, user_id: userId, role, content });
}

export async function clearChatHistory(
  tripId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("trip_chats").delete().eq("trip_id", tripId).eq("user_id", userId);
}

export async function getDailyMessageCount(
  tripId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("trip_chats")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", today.toISOString());
  return count ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function updateShareSettings(
  tripId: string,
  userId: string,
  isPublic: boolean,
  shareToken: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trips")
    .update({ is_public: isPublic, share_token: shareToken })
    .eq("id", tripId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
