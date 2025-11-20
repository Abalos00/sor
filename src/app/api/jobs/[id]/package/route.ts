import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { buildJobManifest } from "@/lib/jobs";
import { buildPowerShellScript } from "@/lib/scripts";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  if (process.env.NODE_ENV === "production") {
    try {
      const ip = await getClientIp();
      assertRateLimit(`package:${ip}`, 20, 60_000);
    } catch {
      return NextResponse.json({ message: "Rate limit excedido" }, { status: 429 });
    }
  }

  const key = new URL(req.url).searchParams.get("key");
  if (!key) {
    return NextResponse.json({ message: "Acceso no autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const job = await db.job.findUnique({
    where: { id, accessKey: key },
    include: { profile: { include: { tools: { include: { tool: true } } } } },
  });
  if (!job) {
    return NextResponse.json({ message: "Job no encontrado" }, { status: 404 });
  }

  const manifest = buildJobManifest(job);
  const script = buildPowerShellScript(manifest, job.id);

  const zip = new JSZip();
  zip.file(`run-job-${job.id}.ps1`, script);
  zip.file(
    "README.txt",
    `SOR - Paquete offline

Job: ${job.id}
Perfil: ${job.profile.name}

Instrucciones:
1. Ejecuta "run-job-${job.id}.ps1" en PowerShell como administrador.
2. El script verificara e instalara las aplicaciones necesarias y aplicara los ajustes del perfil (incluido el fondo corporativo).
3. Al finalizar, los resultados se reportaran automaticamente al servidor.`,
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="sor-package-${job.id}.zip"`,
    },
  });
}
