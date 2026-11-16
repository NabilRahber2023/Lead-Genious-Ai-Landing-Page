import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/**
 * EmptyState — guided empty states (Project Bible §19.18 / §22.3). Instead of a
 * bare "nothing here" line, every empty view gets an icon, a headline, a short
 * explanation, and (crucially) the next action to take.
 *
 * Props:
 *   icon      lucide icon element
 *   accent    .acc-<hue> class for the icon tile (defaults indigo)
 *   title     short headline ("No leads yet")
 *   body      one-sentence guidance
 *   actions   node — usually one primary Button (+ optional secondary)
 *   plain     render without the Card wrapper (for use inside existing cards)
 */
const EmptyState = ({ icon, accent = "acc-indigo", title, body, actions, plain = false, className }) => {
  const inner = (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-10 text-center", className)}>
      {icon && (
        <span className={cn("acc-tile grid h-12 w-12 place-items-center rounded-2xl", accent)}>
          {React.cloneElement(icon, { className: "h-6 w-6" })}
        </span>
      )}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {body && <p className="mx-auto max-w-sm text-sm text-muted-foreground">{body}</p>}
      </div>
      {actions && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );

  if (plain) return inner;
  return (
    <Card className="border-dashed bg-muted/20 shadow-none">
      <CardContent className="p-0">{inner}</CardContent>
    </Card>
  );
};

export default EmptyState;
