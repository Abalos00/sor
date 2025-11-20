import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/permissions";
import { z } from "zod";
import bcrypt from "bcrypt";
import { generateTempPassword } from "@/lib/passwords";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "TECH"]).default("TECH"),
});

export async function GET() {
  const user = await auth.requireUser();
  const users = await db.user.findMany({
    where: { orgId: user.orgId ?? undefined },
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    if (!admin.orgId) {
      return NextResponse.json({ message: "Necesitas una organización válida" }, { status: 400 });
    }

    const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      return NextResponse.json({ message: "Ese email ya existe" }, { status: 409 });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);
    const user = await db.user.create({
      data: {
        email: parsed.data.email,
        password: hash,
        role: parsed.data.role,
        orgId: admin.orgId,
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({ user, tempPassword }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Solo administradores" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "No pudimos crear el usuario" }, { status: 500 });
  }
}

