"use client";

import { useState } from "react";

type Item = {
  q: string;
  a: string;
};

type Props = {
  items: Item[];
};

export function FaqAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div
            key={item.q}
            className={`rounded-3xl border p-5 shadow-sm transition ${
              open
                ? "border-slate-900/20 bg-white"
                : "border-slate-200 bg-white/90 hover:-translate-y-1 hover:border-slate-300"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900"
            >
              <span>{item.q}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
            {open && <p className="mt-2 text-sm text-slate-600">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
