export function countNights(arrivalDate: string, departureDate: string): number {
  return Math.round(
    (new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / 86_400_000
  );
}

export function stripGroqJson(rawText: string): string | null {
  const stripped = rawText.replace(/```(?:json)?\n?/g, "").replace(/```/g, "");
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}
