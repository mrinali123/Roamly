import { describe, it, expect } from "vitest";
import { countNights, stripGroqJson } from "@/lib/trip-utils";

describe("countNights", () => {
  it("counts nights between two distinct dates", () => {
    expect(countNights("2026-07-01", "2026-07-05")).toBe(4);
  });

  it("returns 0 for a same-day trip", () => {
    expect(countNights("2026-07-01", "2026-07-01")).toBe(0);
  });

  it("returns 1 for an overnight stay", () => {
    expect(countNights("2026-07-01", "2026-07-02")).toBe(1);
  });

  it("correctly counts a week-long trip", () => {
    expect(countNights("2026-12-20", "2026-12-27")).toBe(7);
  });
});

describe("stripGroqJson", () => {
  it("returns a bare JSON object unchanged", () => {
    const raw = '{"trip_title":"Paris"}';
    expect(stripGroqJson(raw)).toBe(raw);
  });

  it("strips markdown json fences", () => {
    const raw = "```json\n{\"trip_title\":\"Rome\"}\n```";
    expect(stripGroqJson(raw)).toBe('{"trip_title":"Rome"}');
  });

  it("strips plain code fences", () => {
    const raw = "```\n{\"trip_title\":\"Bali\"}\n```";
    expect(stripGroqJson(raw)).toBe('{"trip_title":"Bali"}');
  });

  it("extracts JSON from surrounding prose", () => {
    const raw = 'Here is your itinerary: {"days":[]} — enjoy!';
    expect(stripGroqJson(raw)).toBe('{"days":[]}');
  });

  it("returns null when no JSON object is present", () => {
    expect(stripGroqJson("Something went wrong")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(stripGroqJson("")).toBeNull();
  });
});
