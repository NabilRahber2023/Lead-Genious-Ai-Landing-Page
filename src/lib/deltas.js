// Turn a real period comparison (current vs previous window) into StatTile
// trend props. Honesty rules (Project Bible R7):
//  - no previous-period baseline → no arrow, just a factual caption
//  - equal → no arrow
//  - otherwise a real up/down arrow with the % change
export function periodTrend(current, previous, fallbackText, periodDays = 30) {
  if (previous == null || current == null) return { trendText: fallbackText };
  if (previous === 0) {
    return current > 0
      ? { trendText: `${current} in last ${periodDays}d (no prior baseline)` }
      : { trendText: fallbackText };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { trendText: `flat vs prior ${periodDays}d` };
  return {
    trend: pct > 0 ? "up" : "down",
    trendText: `${pct > 0 ? "+" : ""}${pct}% vs prior ${periodDays}d`,
  };
}
