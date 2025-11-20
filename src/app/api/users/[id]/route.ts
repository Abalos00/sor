import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["ADMIN", "TECH"]),
});

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const admin = await requireAdmin();
    if (!admin.orgId) {
      return NextResponse.json({ message: "Organización inválida" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.orgId !== admin.orgId) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id: target.id },
      data: { role: parsed.data.role },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Solo administradores" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "No pudimos actualizar al usuario" }, { status: 500 });
  }
}


