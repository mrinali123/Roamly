import type { GeneratedItinerary, Place, TripFormData } from "@/types/trip";
import {
  parseTime,
  formatTime24,
  to12h,
  computeDay1Start,
  computeLastDayEnd,
  isInValidWindow,
  isMidday,
  pickStartTime,
  SCHEDULE_RULES,
  type Mins,
} from "@/lib/itinerary-scheduler";

export interface ValidationIssue {
  severity: "error" | "warning";
  type:
    | "before_arrival"
    | "before_checkin"
    | "exceeds_checkout"
    | "exceeds_departure"
    | "overlap"
    | "wrong_window"
    | "midday_outdoor";
  day: number;
  place: string;
  detail: string;
  repaired: boolean;
}

export interface ValidationResult {
  valid: boolean;          // true = no errors (warnings are OK)
  issueCount: number;
  issues: ValidationIssue[];
  repaired: GeneratedItinerary;
}

const TRAVEL_GAP = 15; // minutes between activities (transit buffer)

function parseBestTime(t: string): Mins {
  if (!t) return 9 * 60;
  return parseTime(t);
}

/** Re-order and time-shift a single day's places so nothing violates constraints */
function repairDayPlaces(
  places: Place[],
  floorMins: Mins,
  ceilingMins: Mins,
  dayNum: number,
  issues: ValidationIssue[]
): Place[] {
  if (!places?.length) return [];

  // Sort by the AI's intended start time so we honour its ordering intent
  const sorted = [...places].sort(
    (a, b) => parseBestTime(a.best_time) - parseBestTime(b.best_time)
  );

  const result: Place[] = [];
  // cursor = earliest minute the next activity can START (accounting for travel gap)
  let cursor = floorMins;

  for (const place of sorted) {
    const aiStart = parseBestTime(place.best_time);
    const duration = Math.max(place.duration_minutes ?? 60, 30);

    // ── Determine ideal start ────────────────────────────────────────────
    let chosenStart: Mins;

    if (aiStart >= cursor && aiStart + duration <= ceilingMins && isInValidWindow(place.type, aiStart)) {
      // AI's time is perfectly valid — keep it
      chosenStart = aiStart;
    } else {
      // Need to find a better time
      const idealStart = pickStartTime(place.type, cursor, ceilingMins, duration);
      chosenStart = idealStart;

      // Record what went wrong
      if (aiStart < floorMins) {
        issues.push({
          severity: "error",
          type: dayNum === 1 ? "before_arrival" : "overlap",
          day: dayNum,
          place: place.name,
          detail: `Scheduled at ${to12h(formatTime24(aiStart))} but earliest allowed is ${to12h(formatTime24(floorMins))}. Moved to ${to12h(formatTime24(chosenStart))}.`,
          repaired: true,
        });
      } else if (aiStart < cursor) {
        issues.push({
          severity: "error",
          type: "overlap",
          day: dayNum,
          place: place.name,
          detail: `Overlaps previous activity (free at ${to12h(formatTime24(cursor))}). Moved to ${to12h(formatTime24(chosenStart))}.`,
          repaired: true,
        });
      } else if (!isInValidWindow(place.type, aiStart)) {
        const rule = SCHEDULE_RULES[place.type];
        issues.push({
          severity: "warning",
          type: isMidday(aiStart) ? "midday_outdoor" : "wrong_window",
          day: dayNum,
          place: place.name,
          detail: `${place.name} (${place.type}) at ${to12h(formatTime24(aiStart))} is outside recommended hours. ${rule?.notes ?? ""} Moved to ${to12h(formatTime24(chosenStart))}.`,
          repaired: true,
        });
      }
    }

    // ── Check if it fits before the ceiling ──────────────────────────────
    if (chosenStart + duration > ceilingMins) {
      // Try a tighter fit: start as late as possible before ceiling
      const tightStart = ceilingMins - duration;
      if (tightStart >= cursor) {
        issues.push({
          severity: "warning",
          type: "exceeds_checkout",
          day: dayNum,
          place: place.name,
          detail: `Activity would end after deadline ${to12h(formatTime24(ceilingMins))}. Compressed to start at ${to12h(formatTime24(tightStart))}.`,
          repaired: true,
        });
        chosenStart = tightStart;
      } else {
        // Truly no room — drop the place
        issues.push({
          severity: "error",
          type: "exceeds_departure",
          day: dayNum,
          place: place.name,
          detail: `Cannot fit ${place.name} (${duration} min) before ${to12h(formatTime24(ceilingMins))}. Removed from itinerary.`,
          repaired: true,
        });
        continue;
      }
    }

    result.push({
      ...place,
      best_time: to12h(formatTime24(chosenStart)),
      order: result.length + 1,
    });

    cursor = chosenStart + duration + TRAVEL_GAP;
  }

  return result;
}

/** Validate meals: ensure they fall in standard meal windows, fix if not */
function repairMeals(
  meals: GeneratedItinerary["days"][number]["meals"],
  floorMins: Mins,
  ceilingMins: Mins
) {
  if (!meals?.length) return meals;
  return meals.map((meal) => {
    if (!meal.suggested_time) return meal;
    const t = parseBestTime(meal.suggested_time);

    // Meal-type windows
    const ranges: Record<string, [Mins, Mins, Mins]> = {
      breakfast: [6 * 60, 10 * 60 + 30, 8 * 60],
      lunch:     [11 * 60 + 30, 15 * 60, 12 * 60 + 30],
      dinner:    [18 * 60, 22 * 60, 19 * 60],
    };
    const [wStart, wEnd, defaultTime] = ranges[meal.meal_type] ?? [12 * 60, 22 * 60, 12 * 60];

    let finalTime = t;
    if (t < wStart || t > wEnd) finalTime = defaultTime;
    if (finalTime < floorMins) finalTime = Math.max(floorMins, wStart);
    if (finalTime > ceilingMins) return null; // can't eat — drop the meal

    return { ...meal, suggested_time: to12h(formatTime24(finalTime)) };
  }).filter(Boolean) as typeof meals;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function validateAndRepairItinerary(
  itinerary: GeneratedItinerary,
  data: TripFormData
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const numDays = itinerary.days.length;

  const day1Floor     = computeDay1Start(data);
  const lastDayCeil   = computeLastDayEnd(data);
  const middayFloor   = 8 * 60;   // 8:00 AM for normal days
  const middayCeiling = 22 * 60;  // 10:00 PM for normal days

  const repairedDays = itinerary.days.map((day, idx) => {
    const isFirst = idx === 0;
    const isLast  = idx === numDays - 1;

    const floor   = isFirst ? day1Floor   : middayFloor;
    const ceiling = isLast  ? lastDayCeil : middayCeiling;

    const repairedPlaces = repairDayPlaces(day.places ?? [], floor, ceiling, day.day_number, issues);
    const repairedMeals  = repairMeals(day.meals, floor, ceiling);

    return { ...day, places: repairedPlaces, meals: repairedMeals };
  });

  const errors = issues.filter((i) => i.severity === "error");

  return {
    valid: errors.length === 0,
    issueCount: issues.length,
    issues,
    repaired: { ...itinerary, days: repairedDays },
  };
}
