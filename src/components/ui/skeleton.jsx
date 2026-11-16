import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * Skeleton — layout-stable loading placeholders (Project Bible §22.3).
 * Base block plus shaped variants matching the app's real components, so pages
 * keep their final geometry while data loads (no spinner-induced layout jumps).
 * The pulse is killed under prefers-reduced-motion via Tailwind's motion-safe.
 */
export const Skeleton = ({ className, ...props }) => (
  <div
    aria-hidden="true"
    className={cn("motion-safe:animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
);

/** Matches StatTile: icon tile top-right, label, big value, caption. */
export const SkeletonStatTile = ({ className }) => (
  <Card className={cn("glass-card overflow-hidden", className)} aria-hidden="true">
    <div className="flex items-start justify-between gap-3 p-5">
      <div className="min-w-0 flex-1 space-y-2.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
    </div>
  </Card>
);

/** Matches a StatList row: leading tile + two text lines + right chip. */
export const SkeletonListRow = () => (
  <div className="flex items-center gap-3 rounded-xl px-2.5 py-2" aria-hidden="true">
    <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
    <Skeleton className="h-5 w-14 rounded-full" />
  </div>
);

/** Matches a ChartCard: title/description + chart area. */
export const SkeletonChartCard = ({ height = 300, className }) => (
  <Card className={cn("glass-card", className)} aria-hidden="true">
    <div className="space-y-1.5 p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3.5 w-56" />
    </div>
    <div className="px-6 pb-6">
      <Skeleton style={{ height }} className="w-full rounded-lg" />
    </div>
  </Card>
);

/**
 * Full dashboard-page skeleton: heading + KPI row + two card slots.
 * Wrapped in role=status so screen readers announce loading once.
 */
export const SkeletonDashboard = () => (
  <div className="container py-6 space-y-6" role="status" aria-label="Loading dashboard">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => <SkeletonStatTile key={i} />)}
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <SkeletonChartCard height={260} />
      <SkeletonChartCard height={260} />
    </div>
    <span className="sr-only">Loading…</span>
  </div>
);

export default Skeleton;
