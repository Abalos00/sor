import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";
import { jobSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("limit") ?? 20) || 20;
  const jobs = await db.job.findMany({
    where: { profile: { orgId: user.orgId } },
    orderBy: { createdAt: "desc" },
    take,
    include: { profile: true, device: true },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  try {
    const user = await auth.requireUser();
    if (!user.orgId) {
      return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
    }
    const body = await req.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const profile = await db.profile.findFirst({
      where: { id: parsed.data.profileId, orgId: user.orgId },
    });
    if (!profile) {
      return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
    }

    let deviceId: string | null = null;
    if (parsed.data.deviceId) {
      const device = await db.device.findFirst({
        where: { id: parsed.data.deviceId, orgId: user.orgId },
      });
      if (!device) {
        return NextResponse.json({ message: "Dispositivo no encontrado" }, { status: 404 });
      }
      deviceId = device.id;
    } else if (parsed.data.deviceName) {
      const existingDevice = await db.device.findFirst({
        where: { orgId: user.orgId, name: parsed.data.deviceName },
      });
      if (existingDevice) {
        deviceId = existingDevice.id;
      } else {
        const device = await db.device.create({
          data: {
            name: parsed.data.deviceName,
            os: profile.os,
            orgId: user.orgId!,
            status: "idle",
            token: randomUUID(),
          },
        });
        deviceId = device.id;
      }
    }

    const job = await db.job.create({
      data: {
        profileId: profile.id,
        deviceId,
        createdBy: user.email ?? "desconocido",
        status: "encola",
      },
      include: { profile: true, device: true },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "No pudimos crear el job" }, { status: 500 });
  }
}

