import { describe, it, expect } from "vitest";
import { validateTripStep } from "@/lib/trip-validation";
import type { TripFormData } from "@/types/trip";

const baseForm: TripFormData = {
  destination: "Paris",
  arrivalDate: "2026-08-01",
  arrivalTime: "10:00",
  departureDate: "2026-08-07",
  departureTime: "18:00",
  numTravelers: 2,
  tripPurpose: "tourism",
  hotelName: "Hotel Le Marais",
  hotelAddress: "3 Rue de Bretagne, Paris",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  budgetLevel: "mid-range",
  interests: ["Food & Dining", "Art & Museums"],
  pace: "balanced",
  mustVisit: "",
  dietaryPrefs: [],
};

describe("validateTripStep — step 1 (destination & dates)", () => {
  it("flags missing destination", () => {
    const errs = validateTripStep(1, { ...baseForm, destination: "" }, true);
    expect(errs.destination).toBeDefined();
  });

  it("flags unconfirmed destination even when text is present", () => {
    const errs = validateTripStep(1, baseForm, false);
    expect(errs.destination).toBeDefined();
  });

  it("passes with a confirmed destination and valid dates", () => {
    const errs = validateTripStep(1, baseForm, true);
    expect(Object.keys(errs)).toHaveLength(0);
  });

  it("flags departure before arrival", () => {
    const errs = validateTripStep(1, { ...baseForm, departureDate: "2026-07-31" }, true);
    expect(errs.departureDate).toBeDefined();
  });

  it("flags missing arrival date", () => {
    const errs = validateTripStep(1, { ...baseForm, arrivalDate: "" }, true);
    expect(errs.arrivalDate).toBeDefined();
  });

  it("flags missing departure date", () => {
    const errs = validateTripStep(1, { ...baseForm, departureDate: "" }, true);
    expect(errs.departureDate).toBeDefined();
  });
});

describe("validateTripStep — step 2 (hotel)", () => {
  it("flags missing hotel name", () => {
    const errs = validateTripStep(2, { ...baseForm, hotelName: "" }, true);
    expect(errs.hotelName).toBeDefined();
  });

  it("passes with a hotel name", () => {
    const errs = validateTripStep(2, baseForm, true);
    expect(Object.keys(errs)).toHaveLength(0);
  });
});

describe("validateTripStep — step 3 (preferences)", () => {
  it("flags empty interests array", () => {
    const errs = validateTripStep(3, { ...baseForm, interests: [] }, true);
    expect(errs.interests).toBeDefined();
  });

  it("passes when at least one interest is selected", () => {
    const errs = validateTripStep(3, baseForm, true);
    expect(Object.keys(errs)).toHaveLength(0);
  });
});
