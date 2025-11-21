import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

type TelegramMessage = {
  text?: string;
  chat?: { id?: string | number };
  from?: { is_bot?: boolean };
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

let lastUpdateId = 0;
const processedUpdateIds = new Set<number>();

export async function GET(req: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return NextResponse.json(
      { error: "Soporte no esta configurado. Falta TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID." },
      { status: 500 },
    );
  }

  const ticketNumberParam = req.nextUrl.searchParams.get("ticketNumber");
  const ticketNumber = ticketNumberParam ? Number(ticketNumberParam) : null;

  try {
    await ingestTelegramReplies();

    if (!ticketNumber) {
      return NextResponse.json({ messages: [] });
    }

    const ticket = await db.supportTicket.findUnique({ where: { number: ticketNumber } });
    if (!ticket) {
      return NextResponse.json({ messages: [], status: "not_found" });
    }

    const messages = await db.supportMessage.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({ id: m.id, text: m.content, role: m.role })),
      status: ticket.status,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        { error: "Servicio de soporte no disponible. Intenta en unos minutos." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Error interno consultando soporte." }, { status: 500 });
  }
}

async function ingestTelegramReplies() {
  try {
    const url = new URL(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
    if (lastUpdateId > 0) {
      url.searchParams.set("offset", String(lastUpdateId + 1));
    }

    const tgResponse = await fetch(url.toString());
    if (!tgResponse.ok) {
      return;
    }

    const payload = await tgResponse.json();
    const updates: TelegramUpdate[] = payload?.result ?? [];

    for (const upd of updates) {
      if (processedUpdateIds.has(upd?.update_id)) continue;
      processedUpdateIds.add(upd.update_id);

      const msg = upd?.message;
      if (!msg || !msg.text) continue;
      if (String(msg.chat?.id) !== String(TELEGRAM_CHAT_ID)) continue;
      if (msg.from?.is_bot) continue;

      const text: string = msg.text.trim();

      // Command: help
      if (text.startsWith("/help")) {
        await sendTelegramMessage(
          "Comandos:\n/close <ticket> - marcar ticket como finalizado\n/status <ticket> - ver estado\n/assign <ticket> <agente> - asignar agente (texto libre)\nTip: responde siempre con #<ticket> para que llegue al cliente correcto.",
        );
        continue;
      }

      // Command: close
      if (text.startsWith("/close")) {
        const match = text.match(/\/close\s+#?(\d+)/);
        if (!match) {
          await sendTelegramMessage("Indica el ticket: /close 123");
          continue;
        }
        const number = Number(match[1]);
        const ticket = await db.supportTicket.findUnique({ where: { number } });
        if (!ticket) {
          await sendTelegramMessage(`Ticket #${number} no encontrado.`);
          continue;
        }
        await db.supportTicket.update({ where: { id: ticket.id }, data: { status: "closed" } });
        await db.supportMessage.create({
          data: { ticketId: ticket.id, role: "support", content: `Ticket #${number} finalizado.` },
        });
        await sendTelegramMessage(`Ticket #${number} marcado como finalizado.`);
        continue;
      }

      // Command: status
      if (text.startsWith("/status")) {
        const match = text.match(/\/status\s+#?(\d+)/);
        if (!match) {
          await sendTelegramMessage("Indica el ticket: /status 123");
          continue;
        }
        const number = Number(match[1]);
        const ticket = await db.supportTicket.findUnique({ where: { number } });
        if (!ticket) {
          await sendTelegramMessage(`Ticket #${number} no encontrado.`);
          continue;
        }
        await sendTelegramMessage(`Ticket #${number} estado: ${ticket.status}`);
        continue;
      }

      // Command: assign
      if (text.startsWith("/assign") || text.startsWith("/asign")) {
        const match = text.match(/\/(?:assign|asign)\s+#?(\d+)\s+(.+)/);
        if (!match) {
          await sendTelegramMessage("Indica el ticket y agente: /assign 123 Juan");
          continue;
        }
        const number = Number(match[1]);
        const agent = match[2];
        const ticket = await db.supportTicket.findUnique({ where: { number } });
        if (!ticket) {
          await sendTelegramMessage(`Ticket #${number} no encontrado.`);
          continue;
        }
        await db.supportMessage.create({
          data: { ticketId: ticket.id, role: "support", content: `Agente asignado: ${agent}` },
        });
        await sendTelegramMessage(`Ticket #${number}: asignado a ${agent}.`);
        continue;
      }

      // Regular replies: try to find ticket number, else fallback to single open ticket
      const ticketMatch = text.match(/#(\d+)/);
      let number: number | null = ticketMatch ? Number(ticketMatch[1]) : null;

      if (!number) {
        const openTickets = await db.supportTicket.findMany({ where: { status: "open" }, select: { number: true, id: true } });
        if (openTickets.length === 1) {
          number = openTickets[0].number;
        }
      }

      if (!number) continue;

      const ticket = await db.supportTicket.findUnique({ where: { number } });
      if (!ticket) continue;

      const isClosing = /ticket finalizado/i.test(text);
      const cleanedContent = ticketMatch ? text.replace(/^\s*\[#?\d+\]\s*/i, "").trim() : text;

      await db.supportMessage.create({
        data: {
          ticketId: ticket.id,
          role: "support",
          content: cleanedContent || text,
        },
      });

      if (isClosing) {
        await db.supportTicket.update({
          where: { id: ticket.id },
          data: { status: "closed" },
        });
      }
    }

    if (updates.length > 0) {
      const maxId = Math.max(...updates.map((u) => Number(u?.update_id ?? 0)));
      lastUpdateId = Math.max(lastUpdateId, maxId);
    }
  } catch {
    // Swallow polling errors to keep UI responsive
    return;
  }
}

async function sendTelegramMessage(text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
    }),
  });
}
