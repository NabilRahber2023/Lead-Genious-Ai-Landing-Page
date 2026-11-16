import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime, formatCurrency } from "@/lib/data/formatters";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns empty string for missing/invalid input", () => {
    expect(formatRelativeTime(null)).toBe("");
    expect(formatRelativeTime("not-a-date")).toBe("");
  });

  it("formats recent times", () => {
    expect(formatRelativeTime("2026-07-03T11:59:40Z")).toBe("just now");
    expect(formatRelativeTime("2026-07-03T11:15:00Z")).toBe("45m ago");
    expect(formatRelativeTime("2026-07-03T06:00:00Z")).toBe("6h ago");
    expect(formatRelativeTime("2026-06-30T12:00:00Z")).toBe("3d ago");
  });

  it("falls back to a short date past 30 days", () => {
    const out = formatRelativeTime("2026-01-01T00:00:00Z");
    expect(out).not.toMatch(/ago$/);
    expect(out.length).toBeGreaterThan(4);
  });
});

describe("formatCurrency", () => {
  it("formats whole dollars", () => {
    expect(formatCurrency(5000)).toMatch(/\$5,000/);
  });
});
