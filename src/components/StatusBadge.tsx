import { cn } from "@/lib/utils";
import { STATUS_STYLES, getStatusLabel, normalizeStatus } from "@/lib/status";

type StatusBadgeProps = {
  status: string;
  children?: React.ReactNode;
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const label = children ?? getStatusLabel(normalized);
  const style = STATUS_STYLES[normalized] ?? "bg-slate-100 text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
        style,
      )}
    >
      {label}
    </span>
  );
}
