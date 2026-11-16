import React from "react";
import { cn } from "@/lib/utils";

/**
 * SettingRow — one consistent, rounded, hover row for toggle/settings lists
 * (feature flags, per‑agent switches, notification prefs), replacing the flat
 * `divide-y` rows. Left: optional accent icon‑tile + title/description.
 * Right: any control (Switch, Button, Badge).
 */
const SettingRow = ({ icon, accent = "acc-indigo", title, description, control, className }) => (
  <div className={cn("flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/50", className)}>
    <div className="flex min-w-0 items-center gap-3">
      {icon && (
        <span className={cn("acc-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl", accent)}>
          {React.cloneElement(icon, { className: "h-4 w-4" })}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
    {control && <div className="shrink-0">{control}</div>}
  </div>
);

export default SettingRow;
