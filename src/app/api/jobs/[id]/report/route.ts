import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobReportSchema } from "@/lib/validators";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendJobWebhook } from "@/lib/webhooks";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Context) {
  try {
    try {
      const ip = await getClientIp();
      assertRateLimit(`report:${ip}`, 120, 60_000);
    } catch {
      return NextResponse.json({ message: "Rate limit excedido" }, { status: 429 });
    }

    const key = new URL(req.url).searchParams.get("key");
    if (!key) {
      return NextResponse.json({ message: "Acceso no autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const job = await db.job.findUnique({ where: { id, accessKey: key } });
    if (!job) {
      return NextResponse.json({ message: "Job no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = jobReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    await db.job.update({
      where: { id: job.id },
      data: { status: parsed.data.status },
    });

    if (parsed.data.tasks?.length) {
      for (const task of parsed.data.tasks) {
        const existing = await db.jobTask.findFirst({
          where: { jobId: job.id, toolId: task.id },
        });
        const baseData = {
          status: task.status ?? parsed.data.status,
          startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
          finishedAt: task.finishedAt ? new Date(task.finishedAt) : undefined,
          logsUrl: task.logsUrl,
        };

        if (existing) {
          await db.jobTask.update({
            where: { id: existing.id },
            data: baseData,
          });
        } else {
          await db.jobTask.create({
            data: {
              jobId: job.id,
              toolId: task.id,
              ...baseData,
            },
          });
        }
      }
    }

    await sendJobWebhook(job.id, parsed.data.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "No pudimos registrar el reporte" }, { status: 500 });
  }
}

