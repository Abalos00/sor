import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";
import { profileSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

type JsonOptionsInput = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

const toJsonInput = (value: unknown): JsonOptionsInput | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
};

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params;
  const user = await auth.requireUser();
  const profile = await db.profile.findFirst({
    where: { id, orgId: user.orgId ?? undefined },
    include: { tools: { include: { tool: true } } },
  });
  if (!profile) {
    return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
  }
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const user = await auth.requireUser();
    const profile = await db.profile.findFirst({
      where: { id, orgId: user.orgId ?? undefined },
    });
    if (!profile) {
      return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    await db.profile.update({
      where: { id: profile.id },
      data: {
        name: parsed.data.name,
        industry: parsed.data.industry,
        os: parsed.data.os,
        wallpaperUrl: parsed.data.wallpaper?.url ?? null,
        wallpaperLock: parsed.data.wallpaper?.locked ?? false,
      },
    });

    await db.profileTool.deleteMany({ where: { profileId: profile.id } });
    await db.profileTool.createMany({
      data: parsed.data.toolIds.map((toolId) => ({
        profileId: profile.id,
        toolId,
        options: toJsonInput(parsed.data.optionsByTool?.[toolId]),
      })),
    });

    const refreshed = await db.profile.findUnique({
      where: { id: profile.id },
      include: { tools: { include: { tool: true } } },
    });
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "No pudimos actualizar el perfil" }, { status: 500 });
  }
}

