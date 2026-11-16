import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// Rotating accent set so a row of tiles gets a distinct hue per card.
export const TILE_ACCENTS = ["acc-indigo", "acc-sky", "acc-violet", "acc-cyan", "acc-emerald", "acc-amber", "acc-teal"];

/** Split "45%" / "8/9" / "1,240" into a leading number + suffix for count-up. */
function parseValue(value) {
  const str = String(value ?? "");
  const m = str.match(/^(\d[\d,]*\.?\d*)(.*)$/s);
  if (!m) return { target: null, suffix: str };
  return { target: parseFloat(m[1].replace(/,/g, "")), suffix: m[2], hasComma: m[1].includes(",") };
}

function useCountUp(target, enabled = true, duration = 900) {
  const [n, setN] = useState(enabled && target != null ? 0 : target);
  useEffect(() => {
    if (!enabled || target == null) { setN(target); return; }
    let raf; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, duration]);
  return n;
}

/**
 * StatTile — the shared premium KPI card. Glass surface, colored icon tile,
 * cursor-follow spotlight, count-up value and an optional trend line. Each
 * card carries its own `accent` hue, which is how a KPI row reads as
 * "different color per card".
 *
 * Back-compat props: accepts `title` or `label`, `value`, `icon`,
 * `trend` ("up"|"down"), `trendText`, `itemVariants` (framer variants).
 */
const StatTile = ({
  title,
  label,
  value,
  icon,
  accent = "acc-indigo",
  trend,
  trendText,
  itemVariants,
  countUp = true,
  className,
}) => {
  const ref = useRef(null);
  const { target, suffix } = parseValue(value);
  const reduce = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const n = useCountUp(target, countUp && !reduce, 900);

  const display = target == null
    ? String(value ?? "")
    : `${Math.round(n).toLocaleString("en-US")}${suffix}`;

  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        ref={ref}
        onMouseMove={onMove}
        className={cn("glass-card app-spotlight acc-bar-top overflow-hidden", accent, className)}
      >
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title ?? label}</p>
            <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{display}</div>
            {trendText && (
              <p className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                trend === "up" && "text-emerald-600 dark:text-emerald-400",
                trend === "down" && "text-rose-600 dark:text-rose-400"
              )}>
                {/* Direction arrows appear only when a REAL trend is supplied —
                    never as decoration (no more hardcoded "up" everywhere). */}
                {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
                {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
                <span className="text-muted-foreground">{trendText}</span>
              </p>
            )}
          </div>
          {icon && (
            <div className="acc-tile grid h-11 w-11 shrink-0 place-items-center rounded-xl">
              {React.cloneElement(icon, { className: "h-5 w-5" })}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatTile;
