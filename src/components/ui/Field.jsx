import React from "react";
import { cn } from "@/lib/utils";

/**
 * Field — one consistent form-field wrapper (label + control + help/error), so
 * every form (Onboard, Settings, Team invite) is aligned and labelled the same.
 * Wrap any input/select as children.
 */
const Field = ({ label, htmlFor, required, help, error, className, children }) => (
  <div className={cn("space-y-1.5", className)}>
    {label && (
      <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
    ) : help ? (
      <p className="text-xs text-muted-foreground">{help}</p>
    ) : null}
  </div>
);

export default Field;
