import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * StatList — the one premium replacement for the flat `row + border-b + badge`
 * lists scattered across the dashboards (AI Agent ROI, Team Snapshot, Hot Leads,
 * Recent Activity, Active Campaigns, Top Campaigns, …).
 *
 * Each item is a rounded, hover-lifting row with:
 *   leading   a node (accent icon-tile or avatar) — or pass { icon, accent } / { initials, color }
 *   title     primary text            subtitle  secondary text (muted)
 *   bar       0..1 proportional bar (for rankings/leaderboards), colored by `barColor` (hex) or accent
 *   right     a node rendered right-aligned (values / badges / actions)
 *   rank      optional number chip on the far left (leaderboard)
 *
 * Empty state: pass `empty` (string/node) — shown when items is empty.
 */
const Tile = ({ leading }) => {
  if (!leading) return null;
  if (React.isValidElement(leading)) return leading;
  if (leading.initials) {
    return (
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white", leading.color || "bg-primary")}>
        {leading.initials}
      </span>
    );
  }
  return (
    <span className={cn("acc-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl", leading.accent)}>
      {leading.icon && React.cloneElement(leading.icon, { className: "h-4 w-4" })}
    </span>
  );
};

const StatList = ({ items = [], empty = "Nothing to show yet.", className }) => {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className={cn("space-y-1", className)}>
      {items.map((it, i) => (
        <motion.div
          key={it.key ?? i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/50"
        >
          {it.rank != null && (
            <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-muted-foreground">{it.rank}</span>
          )}
          <Tile leading={it.leading} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium">{it.title}</p>
            </div>
            {it.subtitle && <p className="truncate text-xs text-muted-foreground">{it.subtitle}</p>}
            {it.bar != null && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: it.barColor || "rgb(var(--acc-indigo))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(Math.min(it.bar, 1), 0) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </div>
          {it.right && <div className="flex shrink-0 items-center gap-2">{it.right}</div>}
        </motion.div>
      ))}
    </div>
  );
};

export default StatList;
