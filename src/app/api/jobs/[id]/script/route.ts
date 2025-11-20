import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildJobManifest } from "@/lib/jobs";
import { buildPowerShellScript } from "@/lib/scripts";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  try {
    const ip = await getClientIp();
    assertRateLimit(`script:${ip}`, 30, 60_000);
  } catch {
    return NextResponse.json({ message: "Rate limit excedido" }, { status: 429 });
  }

  const { id } = await context.params;
  const key = new URL(req.url).searchParams.get("key");
  if (!key) {
    return NextResponse.json({ message: "Acceso no autorizado" }, { status: 401 });
  }
  const job = await db.job.findUnique({
    where: { id, accessKey: key },
    include: { profile: { include: { tools: { include: { tool: true } } } } },
  });
  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  const manifest = buildJobManifest(job);
  const script = buildPowerShellScript(manifest, job.id);

  return new NextResponse(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="sor-job-${job.id}.ps1"`,
    },
  });
}
