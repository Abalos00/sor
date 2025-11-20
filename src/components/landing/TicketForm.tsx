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

  const containsLink = (text: string) => /(https?:\/\/|www\.)/i.test(text);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
    const updated = [ticket, ...tickets];
    setTickets(updated);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setForm({ name: "", email: "", message: "" });
    toast({
      title: "Ticket guardado en local",
      description: "Asignaremos prioridad cuando revisemos el caso.",
    });
  };

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
        <button className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Enviar ticket
        </button>
      </form>
      {tickets.length > 0 && (
        <div className="mt-6 space-y-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Tickets locales</p>
          <div className="space-y-3">
            {tickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">Pendiente - {ticket.name}</p>
                <p className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="mt-2 text-slate-600 line-clamp-3">{ticket.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

