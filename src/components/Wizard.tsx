"use client";

import { cn } from "@/lib/utils";

type WizardProps = {
  steps: { id: string; label: string }[];
  activeStep: number;
  children: React.ReactNode;
};

export function Wizard({ steps, activeStep, children }: WizardProps) {
  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-4">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          return (
            <li key={step.id} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                  isActive && "border-slate-900 bg-slate-900 text-white",
                  isCompleted && !isActive && "border-emerald-600 bg-emerald-600 text-white",
                )}
              >
                {idx + 1}
              </span>
              <span className={cn("font-medium", isActive ? "text-slate-900" : "text-slate-500")}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
