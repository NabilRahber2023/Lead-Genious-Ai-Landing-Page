import React from "react";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { CHART_COLORS } from "@/lib/palette";
import { cn } from "@/lib/utils";

/**
 * A true funnel — centered, narrowing stage bars (width ∝ count), each stage its
 * own solid color, with the stage count, its share of the top stage, and the
 * stage-to-stage conversion %. The single biggest drop-off is highlighted, since
 * that's the number a pipeline owner actually acts on. Reads top→bottom.
 * (ui-ux-pro-max funnel guidance: labels + conversion % always visible, not hover.)
 */
const PipelineFunnel = ({ data = [], onStageClick }) => {
  const top = data[0]?.value || Math.max(...data.map((d) => d.value), 1);

  // Stage-to-stage conversion vs previous stage; find the worst drop to highlight.
  const rows = data.map((stage, i) => {
    const prev = i === 0 ? null : data[i - 1].value || 0;
    const conv = prev ? Math.round((stage.value / prev) * 100) : null;
    return { ...stage, conv, drop: conv == null ? 0 : 100 - conv };
  });
  const worst = rows.reduce((w, r, i) => (r.conv != null && r.drop > (rows[w]?.drop ?? -1) ? i : w), -1);

  return (
    <div className="space-y-1.5 py-1">
      {rows.map((stage, i) => {
        const width = Math.max(Math.round((stage.value / top) * 100), 8);
        const share = Math.round((stage.value / top) * 100);
        const c = CHART_COLORS[i % CHART_COLORS.length];
        const isWorst = i === worst;
        return (
          <div key={stage.name}>
            {/* conversion connector between stages */}
            {stage.conv != null && (
              <div className="flex items-center justify-center">
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  isWorst
                    ? "bg-rose-500/12 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"
                    : "text-muted-foreground"
                )}>
                  {isWorst && <TrendingDown className="h-3 w-3" />}
                  {stage.conv}% continue{isWorst ? " · biggest drop" : ""}
                </span>
              </div>
            )}
            {/* When onStageClick is provided the whole row is a real button that
                drills into the Leads view filtered to that stage. */}
            {(() => {
              const Row = onStageClick ? "button" : "div";
              return (
                <Row
                  {...(onStageClick
                    ? {
                        type: "button",
                        onClick: () => onStageClick(stage.name),
                        "aria-label": `View the ${stage.value} leads in stage ${stage.name}`,
                        title: `View leads in "${stage.name}"`,
                      }
                    : {})}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg",
                    onStageClick &&
                      "cursor-pointer px-1 -mx-1 transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  )}
                >
                  <span className="w-24 shrink-0 truncate text-right text-xs font-medium capitalize text-muted-foreground">
                    {stage.name}
                  </span>
                  <div className="flex flex-1 justify-center">
                    <motion.div
                      className="h-9 rounded-lg shadow-sm"
                      style={{ backgroundColor: c }}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${width}%`, opacity: 1 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">{stage.value}</span>
                  <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">{share}%</span>
                </Row>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
};

export default PipelineFunnel;
