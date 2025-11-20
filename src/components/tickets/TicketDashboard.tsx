"use client";

import { useEffect, useMemo, useState } from "react";

type Ticket = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "sor_tickets_local";

function loadTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return (JSON.parse(saved) as Partial<Ticket>[]).map((ticket) => ({
      id: ticket.id ?? crypto.randomUUID(),
      name: ticket.name ?? "Sin nombre",
      email: ticket.email ?? "sin-email",
      message: ticket.message ?? "",
      createdAt: ticket.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function TicketDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setTickets(loadTickets());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const summary = useMemo(
    () => ({
      total: tickets.length,
      pendientes: tickets.length,
    }),
    [tickets],
  );

  const sorted = [...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (tickets.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Resumen de tickets</h2>
        <p className="mt-2 text-sm text-slate-500">Aun no hay tickets guardados en esta máquina.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Resumen de tickets</h2>
          <p className="text-sm text-slate-500">Solo ves los tickets guardados localmente.</p>
        </div>
        <div className="text-xs text-slate-500">
          Total: {summary.total} �� Pendientes: {summary.pendientes}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {sorted.slice(0, 5).map((ticket) => (
          <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">Pendiente �� {ticket.name}</p>
              <p className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-xs text-slate-500">{ticket.email}</p>
            <p className="mt-2 whitespace-pre-line text-slate-600">{ticket.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

