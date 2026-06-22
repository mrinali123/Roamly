export type TripPurpose =
  | "tourism"
  | "business"
  | "honeymoon"
  | "family"
  | "adventure"
  | "backpacking";

export type BudgetLevel = "budget" | "mid-range" | "luxury";

export type Pace = "relaxed" | "balanced" | "packed";

export type PlaceType =
  | "landmark"
  | "museum"
  | "restaurant"
  | "cafe"
  | "bar"
  | "shopping"
  | "nature"
  | "viewpoint"
  | "market"
  | "activity"
  | "transport"
  | "accommodation";

export interface TripFormData {
  destination: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  numTravelers: number;
  tripPurpose: TripPurpose;
  hotelName: string;
  hotelAddress: string;
  checkInTime: string;
  checkOutTime: string;
  budgetLevel: BudgetLevel;
  interests: string[];
  pace: Pace;
  mustVisit: string;
  dietaryPrefs: string[];
}

export interface Place {
  order: number;
  name: string;
  type: PlaceType;
  best_time: string;
  time_of_day?: string;
  duration_minutes: number;
  description: string;
  tips: string;
  why_this_time?: string;
  photo_tip?: string;
  lat: number;
  lng: number;
  estimated_cost: string;
}

export interface Meal {
  meal_type: "breakfast" | "lunch" | "dinner";
  suggested_time?: string;
  restaurant_name: string;
  cuisine: string;
  price_range: string;
  specialty: string;
  area: string;
  best_for: string;
}

export interface DayWeather {
  condition: string;
  temperature_high: string;
  temperature_low: string;
  uv_index: string;
  humidity: string;
  wind: string;
  sunrise: string;
  sunset: string;
  travel_advisory: string;
  best_outdoor_hours: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  theme: string;
  daily_notes: string;
  places: Place[];
  meals?: Meal[];
  weather?: DayWeather;
  quick_tips?: string[];
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  trip_title: string;
  arrival_date: string;
  departure_date: string;
  hotel_name: string;
  hotel_address: string;
  num_travelers: number;
  trip_purpose: TripPurpose;
  budget_level: BudgetLevel;
  pace: Pace;
  interests: string[];
  dietary_prefs: string[];
  must_visit: string;
  estimated_budget: string;
  general_tips: string[];
  share_token: string | null;
  is_public: boolean;
  preferred_currency?: string;
  created_at: string;
}

export interface TripWithDays extends Trip {
  itinerary_days: ItineraryDay[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface DbChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface GeneratedItinerary {
  trip_title: string;
  estimated_budget: string;
  general_tips: string[];
  days: {
    day_number: number;
    date: string;
    theme: string;
    daily_notes: string;
    places: Place[];
    meals?: Meal[];
    weather?: DayWeather;
    quick_tips?: string[];
  }[];
}
