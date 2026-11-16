import React from "react";
import { cn } from "@/lib/utils";

/**
 * SectionHeader — one consistent heading for in-page / in-card sections, so
 * every "AI Agent ROI", "Hot Leads", "Active Agents" title looks the same:
 * an accent icon-tile, a title (+ optional count pill), an optional description,
 * and a right-aligned actions slot. Replaces the ad-hoc
 * `<CardTitle className="flex gap-2"><Icon/>Title</CardTitle>` pattern.
 */
const SectionHeader = ({ icon, accent = "acc-indigo", title, description, count, actions, className }) => (
  <div className={cn("flex items-start justify-between gap-3", className)}>
    <div className="flex items-center gap-3 min-w-0">
      {icon && (
        <span className={cn("acc-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl", accent)}>
          {React.cloneElement(icon, { className: "h-4 w-4" })}
        </span>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold leading-tight">{title}</h3>
          {count != null && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">{count}</span>
          )}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export default SectionHeader;
