import type { TripFormData } from "@/types/trip";

export function validateTripStep(
  step: number,
  data: TripFormData,
  destinationConfirmed: boolean
): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 1) {
    if (!data.destination.trim()) {
      e.destination = "Destination is required";
    } else if (!destinationConfirmed) {
      e.destination = "Please select a destination from the suggestions";
    }
    if (!data.arrivalDate)   e.arrivalDate   = "Arrival date is required";
    if (!data.departureDate) e.departureDate = "Departure date is required";
    if (data.arrivalDate && data.departureDate && data.departureDate < data.arrivalDate) {
      e.departureDate = "Departure must be on or after arrival";
    }
  }
  if (step === 2) {
    if (!data.hotelName.trim()) e.hotelName = "Hotel name is required";
  }
  if (step === 3) {
    if (data.interests.length === 0) e.interests = "Pick at least one interest";
  }
  return e;
}
