import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { deviceSchema } from "@/lib/validators";

export async function GET() {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
  }

  const devices = await db.device.findMany({
    where: { orgId: user.orgId },
    orderBy: { name: "asc" },
    take: 100,
  });

  return NextResponse.json(devices);
}

export async function POST(req: NextRequest) {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = deviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const exists = await db.device.findFirst({
      where: { orgId: user.orgId, name: parsed.data.name },
    });
    if (exists) {
      return NextResponse.json(
        { message: "Ya existe un dispositivo con ese nombre" },
        { status: 409 },
      );
    }

    const device = await db.device.create({
      data: {
        name: parsed.data.name,
        os: parsed.data.os,
        status: "idle",
        orgId: user.orgId,
        token: randomUUID(),
      },
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "No pudimos registrar el dispositivo" }, { status: 500 });
  }
}

