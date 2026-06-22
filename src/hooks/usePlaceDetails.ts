"use client";

// With free OSM-based search (Nominatim + Photon), lat/lng and address are
// already included in the autocomplete suggestions. This hook is kept for
// API compatibility but is no longer needed for primary functionality.

export interface PlaceDetails {
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  rating?: number;
}

export function usePlaceDetails() {
  // No-op: details are returned directly from Nominatim/Photon suggestions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDetails = async (_placeId: string): Promise<PlaceDetails | null> => null;
  return { getDetails };
}
