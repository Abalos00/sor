"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900",
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";
