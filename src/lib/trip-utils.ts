export function countNights(arrivalDate: string, departureDate: string): number {
  return Math.round(
    (new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86_400_000
  );
}

export function stripGroqJson(rawText: string): string | null {
  const stripped = rawText
    .replace(/```(?:json)?\n?/g, "")
    .replace(/```/g, "")
    .trim();

  const start = stripped.indexOf("{");
  if (start === -1) return null;

  // Try the full text first
  const candidate = stripped.slice(start);
  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    // fall through to repairJson caller
  }

  // Return raw slice starting at { so repairJson can attempt a fix
  return candidate;
}
