"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "support";
  text: string;
  id: string;
};

type SendStatus = "idle" | "sending" | "sent" | "error";

type PersistedChat = {
  conversation: ChatMessage[];
  name: string;
  lastName: string;
  email: string;
  fieldsHidden: boolean;
  ticketNumber?: number | null;
};

const STORAGE_KEY = "sor-support-chat";
const BTN_STORAGE_KEY = "sor-support-chat-btn-shown";

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [fieldsHidden, setFieldsHidden] = useState(false);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [showLauncherLabel, setShowLauncherLabel] = useState(false);
  const [launcherHover, setLauncherHover] = useState(false);
  const seenSupportIds = useRef<Set<string>>(new Set());

  const formatMessage = (text: string) => {
    return text.replace(/^\s*(\[?#?\d+\]?|<#[^>]+>)\s*/i, "").trim();
  };

  const buildSupportIntro = (userName: string) =>
    `Hola${userName ? ` ${userName}` : ""}, soy soporte de SOR. Estoy aqui para ayudarte. Si quieres dejar tu apellido o correo es opcional; seguimos por aqui y te respondo enseguida.`;

  const toggleOpen = () => setOpen((prev) => !prev);

  const helperText = useMemo(() => {
    if (status === "sent") return "Mensaje enviado. Te responderemos aqui.";
    if (status === "error") return error || "No se pudo enviar. Intenta nuevamente.";
    return "Contactemos con soporte. Su nombre será requerido para mejorar nuestra atención.";
  }, [status, error]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedChat;
        setConversation(parsed.conversation ?? []);
        setName(parsed.name ?? "");
        setLastName(parsed.lastName ?? "");
        setEmail(parsed.email ?? "");
        setFieldsHidden(Boolean(parsed.fieldsHidden));
        setTicketNumber(parsed.ticketNumber ?? null);
        parsed.conversation?.forEach((msg) => {
          if (msg.role === "support") {
            seenSupportIds.current.add(msg.id);
          }
        });
      }
    } catch {
      // ignore corrupted storage
    }

    try {
      const btnSeen = localStorage.getItem(BTN_STORAGE_KEY);
      if (!btnSeen) {
        setShowLauncherLabel(true);
        localStorage.setItem(BTN_STORAGE_KEY, "1");
        setTimeout(() => setShowLauncherLabel(false), 2200);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const payload: PersistedChat = { conversation, name, lastName, email, fieldsHidden, ticketNumber };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [conversation, name, lastName, email, fieldsHidden, ticketNumber]);

  useEffect(() => {
    if (open && unreadSupportCount > 0) {
      setUnreadSupportCount(0);
    }
  }, [open, unreadSupportCount]);

  useEffect(() => {
    if (!ticketNumber) return;

    let active = true;
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`/api/support-telegram/updates?ticketNumber=${ticketNumber}`);
        if (!res.ok) return;
        const data = await res.json();
        const incoming: { id: string; text: string; role: "user" | "support" }[] = data?.messages ?? [];
        if (!active) return;

        setConversation(
          incoming.map((m) => ({
            ...m,
            text: m.role === "support" ? formatMessage(m.text) : m.text,
          })),
        );
        const supportIds = incoming.filter((m) => m.role === "support").map((m) => m.id);
        const newOnes = supportIds.filter((id) => !seenSupportIds.current.has(id));
        supportIds.forEach((id) => seenSupportIds.current.add(id));
        if (!open) {
          setUnreadSupportCount((prev) => prev + newOnes.length);
        }
      } catch {
        // swallow polling errors
      }
    };

    const poll = () => fetchUpdates();
    const intervalId = setInterval(poll, 5000);
    fetchUpdates();

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [ticketNumber, open]);

  const resetChat = () => {
    setConversation([]);
    setFieldsHidden(false);
    setStatus("idle");
    setError("");
    setMessage("");
    setUnreadSupportCount(0);
    setTicketNumber(null);
    seenSupportIds.current.clear();
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !name.trim()) return;
    setStatus("sending");
    setError("");
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", text: message.trim() };
    setConversation((prev) => [...prev, userMessage]);
    try {
      const res = await fetch("/api/support-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim(),
          name: name.trim(),
          lastName: lastName.trim(),
          ticketNumber,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo enviar el mensaje.");
      }

      const result = await res.json();
      if (result?.ticketNumber) {
        setTicketNumber(result.ticketNumber);
      }

      setStatus("sent");
      setMessage("");
      setFieldsHidden(true);
      setConversation((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "support", text: buildSupportIntro(name.trim()) },
      ]);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje.");
      setConversation((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      <div
        className={`w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Soporte</p>
            <p className="text-sm font-semibold">Chat en vivo</p>
            {ticketNumber && (
              <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">
                Ticket #{ticketNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Nuevo chat"
              onClick={resetChat}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              title="Nuevo chat"
            >
              +
            </button>
            <button
              type="button"
              className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
        <div className="space-y-3 px-4 py-4 text-sm text-slate-700">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-[13px] text-slate-600">{helperText}</div>
          <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            {conversation.length === 0 && (
              <p className="text-xs text-slate-400">No hay mensajes todavia.</p>
            )}
            {conversation.map((msg) => (
              <div
                key={msg.id}
                className={`flex text-xs ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200"
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            {!fieldsHidden && (
              <>
                <input
                  type="text"
                  placeholder="Nombre (requerido)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Apellido (opcional)"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Tu correo (opcional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                />
              </>
            )}
            <textarea
              placeholder="Escribe tu duda o problema"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "sending" ? "Enviando..." : "Enviar a soporte"}
            </button>
          </form>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label="Abrir chat de soporte"
        onClick={toggleOpen}
        onMouseEnter={() => setLauncherHover(true)}
        onMouseLeave={() => setLauncherHover(false)}
        className={`flex items-center gap-2 rounded-full bg-slate-900 text-sm font-semibold text-white shadow-xl shadow-slate-900/25 transition duration-300 hover:bg-slate-800 ${
          open || launcherHover || showLauncherLabel ? "px-4 py-3" : "px-2.5 py-2.5"
        }`}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-slate-900">
          💬
        </span>
        <span
          className={`whitespace-nowrap text-sm font-semibold transition-all duration-300 ${
            open || launcherHover || showLauncherLabel
              ? "max-w-xs opacity-100 translate-x-0"
              : "max-w-0 opacity-0 -translate-x-1"
          } overflow-hidden`}
        >
          Chat con soporte
        </span>
        {unreadSupportCount > 0 && (
          <span className="ml-2 rounded-full bg-emerald-400 px-2 text-xs font-bold text-slate-900">
            {unreadSupportCount}
          </span>
        )}
      </button>
    </div>
  );
}
