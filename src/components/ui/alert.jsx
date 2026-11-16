import React from "react";
import { Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alert — static inline callout (Project Bible §22.3). For persistent context
 * (view-only notices, Ollama offline, import results), unlike toasts which are
 * transient. Variants map to the app's semantic hues; light-mode text uses the
 * darker "ink" shades to stay ≥ AA.
 */
const VARIANTS = {
  info: {
    icon: Info,
    className: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
  error: {
    icon: XCircle,
    className: "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  },
};

const Alert = ({ variant = "info", title, children, action, className }) => {
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", v.className, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && <div className={cn("text-[13px] leading-relaxed", title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default Alert;
