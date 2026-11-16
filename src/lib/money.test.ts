import { describe, expect, it } from "vitest";
import { formatCents, parseDollarsToCents } from "./money";

describe("formatCents", () => {
  it("formats integer cents as USD", () => {
    expect(formatCents(18000)).toBe("$180.00");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(123456)).toBe("$1,234.56");
    expect(formatCents(-2550)).toBe("-$25.50");
  });

  it("rejects non-integer values instead of silently rounding", () => {
    expect(() => formatCents(10.5)).toThrow(TypeError);
    expect(() => formatCents(Number.NaN)).toThrow(TypeError);
  });
});

describe("parseDollarsToCents", () => {
  it("parses common dollar inputs exactly", () => {
    expect(parseDollarsToCents("180")).toBe(18000);
    expect(parseDollarsToCents("$1,234.5")).toBe(123450);
    expect(parseDollarsToCents("12.99")).toBe(1299);
    expect(parseDollarsToCents("0.07")).toBe(7);
    expect(parseDollarsToCents("  45.10 ")).toBe(4510);
  });

  it("avoids floating-point error (0.1 + 0.2 style cases)", () => {
    expect(parseDollarsToCents("19.99")).toBe(1999);
    expect(parseDollarsToCents("1.15")).toBe(115);
  });

  it("rejects invalid input", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1..2", "$", "1e3"]) {
      expect(parseDollarsToCents(bad)).toBeNull();
    }
  });
});
