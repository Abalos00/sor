"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-600 text-white",
  destructive: "bg-red-600 text-white",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastInput: Omit<Toast, "id">) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...toastInput }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-72 flex-col gap-2">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={cn(
              "rounded-xl px-4 py-3 text-sm shadow-lg",
              variantStyles[toastItem.variant ?? "default"],
            )}
          >
            <p className="font-semibold">{toastItem.title}</p>
            {toastItem.description && (
              <p className="mt-1 text-xs text-white/80">{toastItem.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
