import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";
import { profileSchema } from "@/lib/validators";

type JsonOptionsInput = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

const toJsonInput = (value: unknown): JsonOptionsInput | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
};

export async function GET() {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
  }
  const profiles = await db.profile.findMany({
    where: { orgId: user.orgId },
    include: { tools: { include: { tool: true } } },
    orderBy: { name: "asc" },
    take: 100,
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  try {
    const user = await auth.requireUser();
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    if (!user.orgId) {
      return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
    }

    const created = await db.profile.create({
      data: {
        orgId: user.orgId,
        name: parsed.data.name,
        industry: parsed.data.industry,
        os: parsed.data.os,
        wallpaperUrl: parsed.data.wallpaper?.url ?? null,
        wallpaperLock: parsed.data.wallpaper?.locked ?? false,
        tools: {
          create: parsed.data.toolIds.map((toolId) => ({
            toolId,
            options: toJsonInput(parsed.data.optionsByTool?.[toolId]),
          })),
        },
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "No pudimos crear el perfil" }, { status: 500 });
  }
}

