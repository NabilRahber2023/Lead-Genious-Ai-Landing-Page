import React from "react";
import StatTile from "@/components/ui/StatTile";

/**
 * StatCard — kept as the dashboards' KPI entry point, now a thin pass-through
 * to the shared premium StatTile (glass, colored icon tile, spotlight hover,
 * count-up). Existing callers keep working; add `accent` (e.g. "acc-emerald")
 * to give each card in a row its own hue.
 */
const StatCard = (props) => <StatTile {...props} />;

export default StatCard;
