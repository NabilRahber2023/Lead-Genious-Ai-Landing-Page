import { describe, it, expect } from "vitest";
import { periodTrend } from "@/lib/deltas";

describe("periodTrend (honest KPI trends)", () => {
  it("shows only the fallback caption when there's no data at all", () => {
    expect(periodTrend(null, null, "All-time")).toEqual({ trendText: "All-time" });
    expect(periodTrend(0, 0, "All-time")).toEqual({ trendText: "All-time" });
  });

  it("never invents an arrow without a prior-period baseline", () => {
    const t = periodTrend(5, 0, "fallback");
    expect(t.trend).toBeUndefined();
    expect(t.trendText).toContain("no prior baseline");
  });

  it("computes a real up trend", () => {
    expect(periodTrend(15, 10, "x")).toEqual({ trend: "up", trendText: "+50% vs prior 30d" });
  });

  it("computes a real down trend", () => {
    expect(periodTrend(5, 10, "x")).toEqual({ trend: "down", trendText: "-50% vs prior 30d" });
  });

  it("flat periods get no arrow", () => {
    const t = periodTrend(10, 10, "x");
    expect(t.trend).toBeUndefined();
    expect(t.trendText).toContain("flat");
  });
});
