"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
  actionLabel: string;
};

export function ActionCard({ title, description, href, disabled, actionLabel }: ActionCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-lg text-slate-900">{description}</p>
      </div>
      <div className="mt-6">
        {disabled ? (
          <Button disabled className="w-full">
            {actionLabel}
          </Button>
        ) : (
          <Link
            href={href}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800",
            )}
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
