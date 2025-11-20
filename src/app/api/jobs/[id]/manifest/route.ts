import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildJobManifest } from "@/lib/jobs";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  try {
    const ip = await getClientIp();
    assertRateLimit(`manifest:${ip}`, 60, 60_000);
  } catch {
    return NextResponse.json({ message: "Rate limit excedido" }, { status: 429 });
  }

  const { id } = await context.params;
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Acceso no autorizado" }, { status: 401 });

  const job = await db.job.findUnique({
    where: { id, accessKey: key },
    include: { profile: { include: { tools: { include: { tool: true } } } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  return NextResponse.json(buildJobManifest(job));
}
