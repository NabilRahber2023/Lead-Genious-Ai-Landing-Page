import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PageHeader — one consistent title block for every page across both portals.
 * Replaces the repeated `<h1 class="text-3xl font-bold tracking-tight">` +
 * `<p class="text-muted-foreground">` pattern with an optional accent icon
 * tile, an eyebrow, and a right-aligned actions slot.
 */
const PageHeader = ({
  title,
  description,
  eyebrow,
  icon,
  accent = "acc-indigo",
  actions,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}
  >
    <div className="flex items-center gap-4 min-w-0">
      {icon && (
        <div className={cn("acc-tile hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-2xl", accent)}>
          {React.cloneElement(icon, { className: "h-6 w-6" })}
        </div>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <p className={cn("acc-text text-xs font-semibold uppercase tracking-wider", accent)}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </motion.div>
);

export default PageHeader;
