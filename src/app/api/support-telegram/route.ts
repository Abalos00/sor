import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: Request) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return NextResponse.json(
      { error: "Soporte no esta configurado. Falta TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID." },
      { status: 500 },
    );
  }

  const { message, email, name, lastName, ticketNumber } = await request.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Mensaje requerido." }, { status: 400 });
  }

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });
  }

  try {
    let ticket = null;
    if (ticketNumber) {
      ticket = await db.supportTicket.findUnique({ where: { number: ticketNumber } });
    }

    if (!ticket) {
      ticket = await db.supportTicket.create({
        data: {
          contactName: name,
          contactLastName: lastName || null,
          contactEmail: email || null,
        },
      });
    }

    const nameLine = ticket.contactName ? `\nNombre: ${ticket.contactName}${ticket.contactLastName ? ` ${ticket.contactLastName}` : ""}` : "";
    const emailLine = ticket.contactEmail ? `\nCorreo: ${ticket.contactEmail}` : "";
    const text = `[#${ticket.number}] Nuevo mensaje de soporte:${nameLine}${emailLine}\nMensaje:\n${message}`;

    const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
      }),
    });

    if (!tgResponse.ok) {
      const body = await tgResponse.text();
      return NextResponse.json({ error: "No se pudo enviar a Telegram", details: body }, { status: 502 });
    }

    await db.supportMessage.create({
      data: {
        ticketId: ticket.id,
        role: "user",
        content: message,
      },
    });

    const intro = `Hola ${ticket.contactName || ""}, soy soporte de SOR. Estoy aqui para ayudarte. Si quieres dejar tu apellido o correo es opcional; seguimos por aqui y te respondo enseguida.`;
    const introMessage = await db.supportMessage.create({
      data: {
        ticketId: ticket.id,
        role: "support",
        content: intro.trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      ticketNumber: ticket.number,
      introMessage,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "PrismaClientInitializationError") {
      return NextResponse.json({ error: "Servicio de soporte no disponible. Intenta en unos minutos." }, { status: 503 });
    }
    return NextResponse.json({ error: "Error enviando a Telegram" }, { status: 500 });
  }
}
