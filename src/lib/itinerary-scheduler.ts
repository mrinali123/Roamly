import type { TripFormData } from "@/types/trip";

/** Minutes since midnight, e.g. 9:30 AM = 570 */
export type Mins = number;

const h = (hour: number) => hour * 60;
const hm = (hour: number, min: number) => hour * 60 + min;

// ---------------------------------------------------------------------------
// Time parsing / formatting
// ---------------------------------------------------------------------------

/** "3:15 PM" | "14:30" | "08:00" → minutes since midnight */
export function parseTime(t: string): Mins {
  if (!t) return 0;
  const s = t.trim();

  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let hour = parseInt(m12[1], 10);
    const min = parseInt(m12[2], 10);
    const pm = m12[3].toUpperCase() === "PM";
    if (pm && hour !== 12) hour += 12;
    if (!pm && hour === 12) hour = 0;
    return hour * 60 + min;
  }

  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) return parseInt(m24[1], 10) * 60 + parseInt(m24[2], 10);

  return 0;
}

export function formatTime24(mins: Mins): string {
  const clamped = Math.max(0, Math.min(mins, 23 * 60 + 59));
  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`;
}

export function to12h(time24: string): string {
  const mins = parseTime(time24);
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const hour = h24 % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Hard constraint computation
// ---------------------------------------------------------------------------

/** Earliest minute any activity may START on Day 1 */
export function computeDay1Start(data: TripFormData): Mins {
  const ARRIVAL_BUFFER = 60;  // airport/station exit + transit to hotel
  const CHECKIN_BUFFER = 30;  // settle in after check-in

  let floor = h(9); // fallback when no times provided

  if (data.arrivalTime) {
    floor = parseTime(data.arrivalTime) + ARRIVAL_BUFFER;
  }

  if (data.checkInTime) {
    const afterCheckin = parseTime(data.checkInTime) + CHECKIN_BUFFER;
    if (afterCheckin > floor) floor = afterCheckin;
  }

  return floor;
}

/** Latest minute any activity may END on the last day */
export function computeLastDayEnd(data: TripFormData): Mins {
  const DEPARTURE_BUFFER = 90; // time needed to reach airport/station + check-in

  let ceiling = hm(23, 59);

  if (data.checkOutTime) {
    const checkout = parseTime(data.checkOutTime);
    if (checkout < ceiling) ceiling = checkout;
  }

  if (data.departureTime) {
    const beforeDeparture = parseTime(data.departureTime) - DEPARTURE_BUFFER;
    if (beforeDeparture < ceiling) ceiling = beforeDeparture;
  }

  return ceiling;
}

// ---------------------------------------------------------------------------
// Per-category time-window rules
// ---------------------------------------------------------------------------

export interface TimeWindow {
  label: string;
  startMin: Mins;
  endMin: Mins;
  preferred: boolean;
}

export interface ScheduleRule {
  windows: TimeWindow[];
  avoidMidday?: boolean; // true = flag 11 AM–3 PM as invalid
  notes: string;
}

/**
 * Canonical schedule rules for every place type the AI might emit.
 * Key is the PlaceType value OR a common alias the model may use.
 */
export const SCHEDULE_RULES: Record<string, ScheduleRule> = {
  // ── Outdoor / nature ────────────────────────────────────────────────────
  landmark: {
    windows: [
      { label: "early morning", startMin: h(6),    endMin: hm(9, 30), preferred: true  },
      { label: "late afternoon", startMin: h(16),   endMin: hm(18, 30), preferred: true  },
      { label: "morning",       startMin: hm(9, 30), endMin: h(11),    preferred: false },
    ],
    avoidMidday: true,
    notes: "Landmarks best at golden hours. Avoid 11 AM–3 PM (harsh light, peak crowds).",
  },
  viewpoint: {
    windows: [
      { label: "sunrise",        startMin: hm(5, 0),  endMin: hm(7, 30), preferred: true  },
      { label: "sunset",         startMin: h(17),     endMin: hm(19, 30), preferred: true  },
    ],
    avoidMidday: true,
    notes: "Viewpoints are ONLY for sunrise or sunset. Hazy midday kills the view.",
  },
  nature: {
    windows: [
      { label: "early morning", startMin: hm(6, 0),  endMin: h(10),    preferred: true  },
      { label: "late afternoon", startMin: h(16),    endMin: hm(18, 30), preferred: false },
    ],
    avoidMidday: true,
    notes: "Parks, forests, waterfalls — cooler hours only.",
  },
  beach: {
    windows: [
      { label: "sunrise / early morning", startMin: hm(5, 30), endMin: h(8),     preferred: true  },
      { label: "sunset",                  startMin: hm(16, 30), endMin: h(19),   preferred: true  },
    ],
    avoidMidday: true,
    notes: "Beaches ONLY at sunrise or sunset. Midday UV is extreme — never schedule then.",
  },
  waterfall: {
    windows: [
      { label: "morning", startMin: h(7), endMin: h(11), preferred: true },
    ],
    avoidMidday: false,
    notes: "Waterfalls cooler and less crowded before noon.",
  },
  temple: {
    windows: [
      { label: "early morning", startMin: hm(5, 30), endMin: h(9),  preferred: true  },
      { label: "morning",       startMin: h(9),      endMin: h(12), preferred: false },
      { label: "evening aarti", startMin: h(18),     endMin: h(20), preferred: false },
    ],
    avoidMidday: false,
    notes: "Temples: dawn is most atmospheric; evening aarti is also valid.",
  },

  // ── Indoor ───────────────────────────────────────────────────────────────
  museum: {
    windows: [
      { label: "morning",   startMin: hm(9, 30), endMin: h(12), preferred: true  },
      { label: "afternoon", startMin: h(14),     endMin: h(17), preferred: false },
    ],
    avoidMidday: false,
    notes: "Museums open ~10 AM. Ideal for 10 AM–noon or 2–5 PM slots.",
  },
  shopping: {
    windows: [
      { label: "afternoon", startMin: h(11), endMin: h(20), preferred: true },
    ],
    avoidMidday: false,
    notes: "Malls and shops typically open 10–11 AM.",
  },

  // ── Food & drink ─────────────────────────────────────────────────────────
  restaurant: {
    windows: [
      { label: "breakfast", startMin: h(6),       endMin: hm(10, 30), preferred: false },
      { label: "lunch",     startMin: hm(11, 30), endMin: h(15),      preferred: true  },
      { label: "dinner",    startMin: h(18),       endMin: h(22),      preferred: true  },
    ],
    avoidMidday: false,
    notes: "Breakfast 6–10:30 AM, lunch 11:30 AM–3 PM, dinner 6–10 PM. Never outside these windows.",
  },
  cafe: {
    windows: [
      { label: "morning",   startMin: hm(7, 30), endMin: h(11), preferred: true  },
      { label: "afternoon", startMin: h(14),     endMin: h(17), preferred: false },
    ],
    avoidMidday: false,
    notes: "Cafes are morning or mid-afternoon.",
  },

  // ── Evening / nightlife ───────────────────────────────────────────────────
  market: {
    windows: [
      { label: "evening",        startMin: h(17), endMin: h(21), preferred: true  },
      { label: "early morning",  startMin: h(6),  endMin: h(9),  preferred: false },
    ],
    avoidMidday: false,
    notes: "Travel markets peak in the evening. Some produce markets are early morning.",
  },
  bar: {
    windows: [
      { label: "evening",    startMin: h(19), endMin: hm(23, 0), preferred: true },
      { label: "late night", startMin: h(22), endMin: hm(23, 59), preferred: false },
    ],
    avoidMidday: false,
    notes: "Bars/clubs never before 7 PM.",
  },
  nightlife: {
    windows: [
      { label: "night", startMin: h(21), endMin: hm(23, 59), preferred: true },
    ],
    avoidMidday: false,
    notes: "Nightlife starts at 9 PM or later.",
  },

  // ── Catch-alls ───────────────────────────────────────────────────────────
  activity: {
    windows: [
      { label: "morning",   startMin: h(8),  endMin: h(12), preferred: true  },
      { label: "afternoon", startMin: h(14), endMin: h(18), preferred: false },
    ],
    avoidMidday: false,
    notes: "Adventure activities best in morning.",
  },
  transport:     { windows: [{ label: "any", startMin: h(0), endMin: hm(23, 59), preferred: false }], notes: "" },
  accommodation: { windows: [{ label: "any", startMin: h(0), endMin: hm(23, 59), preferred: false }], notes: "" },
};

// ---------------------------------------------------------------------------
// Scheduling helpers
// ---------------------------------------------------------------------------

/** Whether a start time is inside at least one valid window for the type */
export function isInValidWindow(type: string, startMins: Mins): boolean {
  const rule = SCHEDULE_RULES[type];
  if (!rule) return true; // unknown type: don't penalise
  return rule.windows.some((w) => startMins >= w.startMin && startMins <= w.endMin);
}

/** Whether a start time falls in the "avoid midday" band (11 AM – 3 PM) */
export function isMidday(startMins: Mins): boolean {
  return startMins >= h(11) && startMins < h(15);
}

/**
 * Pick the ideal start time for a place given:
 * - its type (for window rules)
 * - floor: earliest it can start (cursor after previous activity + travel)
 * - ceiling: latest it can end
 * - duration: how long it takes
 */
export function pickStartTime(
  type: string,
  floorMins: Mins,
  ceilingMins: Mins,
  durationMins: number
): Mins {
  const rule = SCHEDULE_RULES[type];
  const windows = rule?.windows ?? [{ startMin: h(9), endMin: h(21), preferred: true }];

  // Try preferred windows first, then any window
  for (const preferred of [true, false]) {
    for (const w of windows) {
      if (preferred && !w.preferred) continue;
      const candidateStart = Math.max(w.startMin, floorMins);
      if (candidateStart + durationMins <= ceilingMins && candidateStart <= w.endMin) {
        return candidateStart;
      }
    }
  }

  // Last resort: just use the floor
  return floorMins;
}
