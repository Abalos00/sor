import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  webhookUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.orgId) {
    return NextResponse.json({ webhookUrl: null });
  }
  const org = await db.org.findUnique({ where: { id: admin.orgId }, select: { webhookUrl: true } });
  return NextResponse.json({ webhookUrl: org?.webhookUrl ?? "" });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.orgId) {
      return NextResponse.json({ message: "Organización inválida" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const value = parsed.data.webhookUrl === "" ? null : parsed.data.webhookUrl;
    await db.org.update({ where: { id: admin.orgId }, data: { webhookUrl: value ?? null } });
    return NextResponse.json({ webhookUrl: value });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Solo administradores" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ message: "No pudimos actualizar la configuración" }, { status: 500 });
  }
}

