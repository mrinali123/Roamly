export function countNights(arrivalDate: string, departureDate: string): number {
  return Math.round(
    (new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86_400_000
  );
}

/**
 * Extract a JSON object from raw LLM output.
 *
 * Handles all common Groq / Llama output patterns:
 *   1. Clean JSON (nothing extra)
 *   2. Wrapped in ```json … ``` fences
 *   3. Prose before/after the JSON ("Here is the itinerary:\n{…}\nHope you enjoy!")
 *   4. Trailing commas before } or ] (LLM mistake, technically invalid JSON)
 *   5. Truncated JSON (hit max_tokens mid-stream)
 *
 * Returns the extracted string if parsing succeeds, null otherwise.
 * The route's robustRepairJson() will handle truncation (bracket-closing).
 */
export function stripGroqJson(rawText: string): string | null {
  if (!rawText?.trim()) return null;

  // ── Step 1: strip markdown fences ──────────────────────────────────────
  let s = rawText
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  // ── Step 2: locate the JSON object boundaries ───────────────────────────
  const start = s.indexOf("{");
  if (start === -1) return null;

  const end = s.lastIndexOf("}");
  if (end !== -1 && end >= start) {
    s = s.slice(start, end + 1);
  } else {
    // No closing brace — truncated; return what we have for repairJson to close
    s = s.slice(start);
  }

  // ── Step 3: fix trailing commas (common in LLM-generated JSON) ──────────
  //    Repeat until stable (handles nested occurrences)
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s
      .replace(/,(\s*})/g, "$1")
      .replace(/,(\s*])/g, "$1");
  }

  // ── Step 4: return only if parseable ────────────────────────────────────
  try {
    JSON.parse(s);
    return s;
  } catch {
    // Truncated or still-malformed — return raw slice so repairJson can try
    return s.includes("{") ? s : null;
  }
}
