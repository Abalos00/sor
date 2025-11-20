import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/validators";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    try {
      const ip = await getClientIp();
      assertRateLimit(`register:${ip}`, 5, 60_000);
    } catch {
      return NextResponse.json({ message: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      return NextResponse.json({ message: "Email ya registrado" }, { status: 409 });
    }

    const org = await db.org.create({
      data: { name: `Org ${parsed.data.email.split("@")[0]}` },
    });
    const hash = await bcrypt.hash(parsed.data.password, 10);

    await db.user.create({
      data: {
        email: parsed.data.email,
        password: hash,
        role: "ADMIN",
        orgId: org.id,
        termsAcceptedVersion: parsed.data.termsAcceptedVersion,
        termsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error inesperado" }, { status: 500 });
  }
}

