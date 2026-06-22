import type { TripFormData } from "@/types/trip";

function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getNumDays(arrival: string, departure: string): number {
  if (!arrival || !departure) return 1;
  const a = new Date(arrival);
  const b = new Date(departure);
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

export function buildItineraryPrompt(data: TripFormData): string {
  const numDays = getNumDays(data.arrivalDate, data.departureDate);
  const arrivalLabel = formatDate(data.arrivalDate);
  const departureLabel = formatDate(data.departureDate);

  const purposeLabel: Record<string, string> = {
    tourism: "leisure tourism",
    business: "business travel",
    honeymoon: "honeymoon",
    family: "family vacation",
    adventure: "adventure travel",
    backpacking: "backpacking",
  };

  const placesPerDay: Record<string, string> = {
    relaxed: "3–4 sightseeing places (longer time at each, unhurried)",
    balanced: "4–5 sightseeing places",
    packed: "5–6 sightseeing places (fast-paced, maximise sights)",
  };

  const budgetDesc: Record<string, string> = {
    budget: "budget-friendly (hostels, street food, free attractions) — ₹1,500–₹3,500 per person per day",
    "mid-range": "mid-range (comfortable hotels, sit-down restaurants, paid attractions) — ₹3,500–₹8,000 per person per day",
    luxury: "luxury (5-star hotels, fine dining, premium experiences) — ₹8,000–₹25,000+ per person per day",
  };

  return `You are Roamly, an expert travel planner with encyclopedic local knowledge. Generate a complete, realistic ${numDays}-day itinerary for the trip below.

═══ TRIP DETAILS ═══
Destination: ${data.destination}
Dates: ${arrivalLabel}${data.arrivalTime ? ` (arriving ${data.arrivalTime})` : ""} → ${departureLabel}${data.departureTime ? ` (departing ${data.departureTime})` : ""}
Travelers: ${data.numTravelers} ${data.numTravelers === 1 ? "person" : "people"}
Purpose: ${purposeLabel[data.tripPurpose] || data.tripPurpose}
Accommodation: ${data.hotelName}${data.hotelAddress ? `, ${data.hotelAddress}` : ""}${data.checkInTime ? ` (check-in ${data.checkInTime})` : ""}${data.checkOutTime ? `, check-out ${data.checkOutTime}` : ""}
Budget: ${budgetDesc[data.budgetLevel] || data.budgetLevel}
Pace: ${data.pace} — ${placesPerDay[data.pace]}
Interests: ${data.interests.length > 0 ? data.interests.join(", ") : "general sightseeing"}
${data.dietaryPrefs.length > 0 ? `Dietary preferences: ${data.dietaryPrefs.join(", ")}` : ""}
${data.mustVisit ? `Must-visit: ${data.mustVisit}` : ""}

═══ PLACE CATEGORIZATION RULES — STRICTLY FOLLOW ═══

SIGHTSEEING PLACES (go in the "places" array):
- Monuments, forts, temples, churches, mosques, cathedrals
- Museums, galleries, cultural centers, heritage buildings
- Parks, gardens, viewpoints, beaches, lakes, waterfronts
- Markets (as an experience/attraction, not for food)
- Architecture, historical sites, neighbourhoods worth walking
- Theatres, shows, cultural performances, live music venues
NEVER put restaurants, cafes, or food places in the "places" array.

FOOD RECOMMENDATIONS (go ONLY in the "meals" array — ALWAYS SEPARATE):
- Add EXACTLY 2 entries per day: one lunch, one dinner
- Use REAL, well-known restaurants that actually exist at the destination
- For Indian cities: use popular local restaurants by name
- For international cities: use actually famous or highly-regarded restaurants
- These must NEVER appear in the "places" array

═══ OPTIMAL TIMING RULES — STRICTLY FOLLOW ═══

Schedule every place at its scientifically or practically best time:

EARLY MORNING (6:00 AM – 8:30 AM):
- Sunrise viewpoints, hilltops, rooftop terraces
- Iconic monuments before crowds arrive (Taj Mahal, Eiffel Tower, Colosseum, Angkor Wat)
- Beaches in hot climates (golden hour light, cooler temperature)
- Temples and mosques during morning prayers (atmospheric)
- Lakes, rivers, waterfronts

MID MORNING (9:00 AM – 11:30 AM):
- Museums (freshly opened, uncrowded)
- Historical forts and heritage sites (before midday heat)
- Art galleries, cultural centres
- Old city and heritage walking areas
- Botanical gardens, zoos

AFTERNOON (12:00 PM – 3:30 PM) — STRICTLY INDOOR ONLY IN HOT CLIMATES:
- Indoor museums, aquariums, planetariums
- Shopping malls, air-conditioned markets
- Cooking classes, workshops, studio tours
- This is LUNCH time slot

LATE AFTERNOON (4:00 PM – 6:30 PM):
- Parks and gardens (golden afternoon light)
- Outdoor markets and bazaars
- Riverside and waterfront promenades
- Street art areas, colourful neighbourhoods
- Hill stations and elevated viewpoints

SUNSET (5:30 PM – 7:30 PM):
- Rooftop bars and viewpoints
- Coastal areas, beaches
- Bridges and elevated spots with western horizon
- Open-air monuments with western exposure

EVENING (7:00 PM – 10:00 PM):
- Night markets, illuminated historic districts
- Illuminated monuments (Eiffel Tower light show, India Gate at night)
- Cultural performances, live shows, concerts
- This is DINNER time slot

NEVER schedule:
- Outdoor sightseeing 12 pm–4 pm in tropical or hot destinations
- Beach visits in the afternoon in summer
- Rooftop venues at sunrise
- Major outdoor attractions back-to-back without travel + rest time

═══ GENERAL RULES ═══
1. Use REAL place names with accurate GPS coordinates for ${data.destination}.
2. EVERY sightseeing place must be UNIQUE across the entire itinerary — never repeat the same venue on any two days.
3. EVERY restaurant must be UNIQUE across the entire itinerary — never suggest the same restaurant twice. Use a different restaurant for every meal slot.
4. Day 1: account for arrival time — if arriving late (after 3 PM), plan a light day.
5. Last day: account for departure time — if departing early (before noon), plan morning-only activities.
6. Place times must be sequential and realistic — include travel time between venues.
7. Tailor meal choices to dietary preferences if provided.
8. If "must-visit" places are listed, include ALL of them somewhere in the itinerary.
9. The "theme" for each day must be specific and evocative (e.g. "Ancient Stones & Cobbled Streets").
10. "duration_minutes" must be realistic — major museums need 120–180 min, not 30.
11. "why_this_time" must explain specifically WHY that time is best for that exact place.

═══ CRITICAL CURRENCY REQUIREMENT ═══
ALL prices MUST be in Indian Rupees (INR). Use ₹ symbol only.
- India destinations: use actual local INR prices
- International: convert at: 1 USD ≈ ₹83 | 1 EUR ≈ ₹90 | 1 GBP ≈ ₹105 | 1 AED ≈ ₹23 | 1 JPY ≈ ₹0.55 | 1 AUD ≈ ₹54 | 1 SGD ≈ ₹62 | 1 THB ≈ ₹2.3
- "estimated_budget" format: "₹45,000–₹75,000 total for 2 travelers"

═══ REQUIRED JSON OUTPUT ═══
Return ONLY valid JSON — no markdown fences, no explanations.

{
  "trip_title": "Evocative title for the whole trip",
  "estimated_budget": "₹X–₹Y total for ${data.numTravelers} traveler${data.numTravelers !== 1 ? "s" : ""}",
  "general_tips": [
    "Specific practical tip 1",
    "Specific practical tip 2",
    "Specific practical tip 3",
    "Specific practical tip 4",
    "Specific practical tip 5"
  ],
  "days": [
    {
      "day_number": 1,
      "date": "${data.arrivalDate}",
      "theme": "Specific, evocative day theme",
      "daily_notes": "1-2 sentences of practical notes for the day",
      "weather": {
        "condition": "Sunny and clear",
        "temperature_high": "32°C",
        "temperature_low": "22°C",
        "uv_index": "Very High",
        "humidity": "55%",
        "wind": "Light breeze, 12 km/h",
        "sunrise": "6:12 AM",
        "sunset": "7:34 PM",
        "travel_advisory": "Specific advice: sunscreen, clothing, hydration for this destination and month",
        "best_outdoor_hours": "6 AM – 11 AM and 4 PM – 7 PM"
      },
      "places": [
        {
          "order": 1,
          "name": "Exact venue name",
          "type": "landmark|museum|nature|shopping|bar|viewpoint|market|activity|transport|accommodation",
          "best_time": "8:00 AM",
          "time_of_day": "morning",
          "duration_minutes": 120,
          "description": "2-3 sentences: why visit, what to expect, what makes it unmissable",
          "tips": "One specific actionable tip for this place",
          "why_this_time": "Concise reason: e.g. 'Crowds arrive after 10 AM · Soft morning light ideal for photos · Cooler before midday heat'",
          "photo_tip": "Best angle/spot/time for the best photo here",
          "lat": 0.00000,
          "lng": 0.00000,
          "estimated_cost": "₹X per person | ₹X–₹X per person | Free"
        }
      ],
      "meals": [
        {
          "meal_type": "lunch",
          "suggested_time": "1:00 PM",
          "restaurant_name": "Exact real restaurant name",
          "cuisine": "Cuisine type",
          "price_range": "₹X–₹Y per person",
          "specialty": "Specific dish or dishes to order",
          "area": "Neighbourhood / area name",
          "best_for": "Why this restaurant — specific differentiator"
        },
        {
          "meal_type": "dinner",
          "suggested_time": "8:00 PM",
          "restaurant_name": "Exact real restaurant name",
          "cuisine": "Cuisine type",
          "price_range": "₹X–₹Y per person",
          "specialty": "Specific dish or dishes to order",
          "area": "Neighbourhood / area name",
          "best_for": "Why this restaurant — specific differentiator"
        }
      ],
      "quick_tips": [
        "Specific, actionable tip directly relevant to today's itinerary",
        "Logistics tip (transport, tickets, timing) for today",
        "Local etiquette or dress code tip relevant to today's venues",
        "Money-saving or experience-enhancing tip for today"
      ]
    }
  ]
}`;
}
