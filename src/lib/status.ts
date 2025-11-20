const STATUS_ALIASES: Record<string, string> = {
  queued: "encola",
};

export const STATUS_LABELS: Record<string, string> = {
  encola: "En cola",
  running: "En progreso",
  failed: "Con errores",
  succeeded: "Completado",
  pending: "Pendiente",
  error: "Con errores",
  done: "Completado",
};

export const STATUS_STYLES: Record<string, string> = {
  encola: "bg-slate-100 text-slate-700",
  running: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-700",
  succeeded: "bg-emerald-100 text-emerald-700",
  pending: "bg-slate-100 text-slate-700",
  error: "bg-red-100 text-red-700",
  done: "bg-emerald-100 text-emerald-700",
};

export function normalizeStatus(raw?: string | null) {
  if (!raw) return "";
  const normalized = raw.toLowerCase();
  return STATUS_ALIASES[normalized] ?? normalized;
}

export function getStatusLabel(raw?: string | null) {
  const normalized = normalizeStatus(raw);
  if (!normalized) return "";
  return (
    STATUS_LABELS[normalized] ??
    normalized.replace(/^\w/, (char) => char.toUpperCase())
  );
}
