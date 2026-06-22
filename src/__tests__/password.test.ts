import { describe, it, expect } from "vitest";
import { getStrength } from "@/lib/password";

describe("getStrength", () => {
  it("returns level 0 for empty string", () => {
    const r = getStrength("");
    expect(r.level).toBe(0);
    expect(r.label).toBe("");
  });

  it("returns Weak for a short password with no variety", () => {
    const r = getStrength("abc");
    expect(r.level).toBe(1);
    expect(r.label).toBe("Weak");
    expect(r.color).toBe("#EF4444");
  });

  it("returns Weak for 8+ chars but no variety beyond length", () => {
    const r = getStrength("password");
    expect(r.level).toBe(1);
    expect(r.label).toBe("Weak");
  });

  it("returns Fair when length >= 8 and has a digit", () => {
    const r = getStrength("password1");
    expect(r.level).toBe(2);
    expect(r.label).toBe("Fair");
    expect(r.color).toBe("#F59E0B");
  });

  it("returns Strong when length + digit + uppercase", () => {
    const r = getStrength("Password1");
    expect(r.level).toBe(3);
    expect(r.label).toBe("Strong");
    expect(r.color).toBe("#38BDF8");
  });

  it("returns Very strong when all four criteria are met", () => {
    const r = getStrength("Password1!");
    expect(r.level).toBe(4);
    expect(r.label).toBe("Very strong");
    expect(r.color).toBe("#10B981");
  });

  it("a single special char without other criteria stays Weak", () => {
    // "a!" → only special char qualifies (s=1) → Weak
    const r = getStrength("a!");
    expect(r.level).toBe(1);
  });
});
