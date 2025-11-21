"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

type Ticket = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "sor_tickets_local";
const FORMSPREE_URL = "https://formspree.io/f/mblwbvln";

type RawTicket = Partial<Ticket> & { description?: string };

function loadTickets(): Ticket[] {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved) as RawTicket[];
    return parsed.map((ticket) => ({
      id: ticket.id ?? crypto.randomUUID(),
      name: String(ticket.name ?? "").slice(0, 120),
      email: String(ticket.email ?? ""),
      message: String(ticket.message ?? ticket.description ?? ""),
      createdAt: ticket.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function TicketForm() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const containsLink = (text: string) => /(https?:\/\/|www\.)/i.test(text);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !message) {
      toast({ title: "Completa los campos requeridos", variant: "destructive" });
      return;
    }
    if (!emailRegex.test(email)) {
      toast({ title: "Email invalido", variant: "destructive" });
      return;
    }
    if (name.length > 120) {
      toast({ title: "Nombre demasiado largo", variant: "destructive" });
      return;
    }
    if (message.length < 20) {
      toast({ title: "Describe con mas detalle la situacion", variant: "destructive" });
      return;
    }
    if (message.length > 1200) {
      toast({ title: "El mensaje supera el limite permitido", variant: "destructive" });
      return;
    }
    if (containsLink(message)) {
      toast({
        title: "Enlaces bloqueados",
        description: "Por seguridad no aceptamos links en el ticket.",
        variant: "destructive",
      });
      return;
    }
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);

    let succeeded = false;
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });
      succeeded = response.ok;
    } catch {
      succeeded = false;
    } finally {
      setSubmitting(false);
    }
    if (!succeeded) {
      toast({
        title: "No pudimos enviar el ticket",
        description: "Intenta nuevamente o envianos un correo directo.",
        variant: "destructive",
      });
      return;
    }

    const updated = [ticket, ...tickets];
    setTickets(updated);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setForm({ name: "", email: "", message: "" });
    toast({
      title: "Ticket enviado",
      description: "Asignaremos prioridad cuando revisemos el caso.",
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      ticket.name.toLowerCase().includes(term) ||
      ticket.email.toLowerCase().includes(term) ||
      ticket.message.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500" htmlFor="ticket-name">
              Nombre
            </label>
            <input
              id="ticket-name"
              type="text"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500" htmlFor="ticket-email">
              Email
            </label>
            <input
              id="ticket-email"
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="tu@empresa.com"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500" htmlFor="ticket-message">
            Describe tu situacion
          </label>
          <textarea
            id="ticket-message"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Detalla el problema o solicitud..."
          />
        </div>
        <button
          className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={submitting}
        >
          Enviar ticket
        </button>
      </form>
      {tickets.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              <span>Mis tickets</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700">{tickets.length}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTicketsModal(true)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Ver todos
            </button>
          </div>
        </div>
      )}

      {showTicketsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTicketsModal(false)} />
          <div className="relative z-10 flex w-full max-w-3xl flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Resumen</p>
                <h3 className="text-xl font-semibold text-slate-900">Tus tickets locales</h3>
                <p className="text-sm text-slate-600">
                  Filtra por nombre, email o descripcion. Los mas recientes aparecen primero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketsModal(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-slate-500" htmlFor="tickets-search">
                  Buscar ticket
                </label>
                <input
                  id="tickets-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre, email o palabra clave..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="self-start text-xs font-semibold text-slate-500 md:self-center">
                {filteredTickets.length} de {tickets.length} tickets
              </div>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
              {filteredTickets.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No encontramos tickets con ese criterio de busqueda.
                </p>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">Pendiente - {ticket.name}</p>
                      <p className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-slate-500">{ticket.email}</p>
                    <p className="mt-2 text-slate-600">{ticket.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

