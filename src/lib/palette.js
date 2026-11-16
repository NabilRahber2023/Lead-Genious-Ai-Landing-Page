// The one palette, derived from the landing page so the signed-in app reads as
// the SAME product. Each entry is a single solid color (never a gradient).
//
// hue  = for recharts fills/strokes
// acc  = the matching .acc-* class (drives StatTile / icon-tile / spotlight; light
//        uses a darker "ink" text shade automatically)
// bg   = solid Tailwind bg for nav pills / badges (white text reads on all of these)
//
// Rose is a LIGHT-MODE-ONLY color system-wide: its .acc-rose token remaps to indigo
// in dark mode (see index.css), and where a raw bg class is used it carries a
// `dark:bg-indigo-600`. Rose is therefore intentionally NOT in CHART_COLORS.
export const PALETTE = [
  { key: "indigo",  hex: "#6366f1", acc: "acc-indigo",  bg: "bg-indigo-600" },
  { key: "sky",     hex: "#0ea5e9", acc: "acc-sky",     bg: "bg-sky-600" },
  { key: "violet",  hex: "#8b5cf6", acc: "acc-violet",  bg: "bg-violet-600" },
  { key: "cyan",    hex: "#06b6d4", acc: "acc-cyan",    bg: "bg-cyan-600" },
  { key: "emerald", hex: "#10b981", acc: "acc-emerald", bg: "bg-emerald-600" },
  { key: "amber",   hex: "#f59e0b", acc: "acc-amber",   bg: "bg-amber-500" },
  { key: "teal",    hex: "#14b8a6", acc: "acc-teal",    bg: "bg-teal-600" },
  { key: "rose",    hex: "#f43f5e", acc: "acc-rose",    bg: "bg-rose-500 dark:bg-indigo-600" },
  { key: "slate",   hex: "#64748b", acc: "acc-slate",   bg: "bg-slate-600" },
];

// Vivid rotation for categorical charts — each bar/slice a distinct rich color.
// (Rose + slate excluded: rose is light-only; slate is a muted UI hue.)
export const CHART_COLORS = ["#6366f1", "#10b981", "#8b5cf6", "#f59e0b", "#0ea5e9", "#06b6d4", "#14b8a6"];

export const hue = (key) => PALETTE.find((p) => p.key === key) || PALETTE[0];
