import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "Organización inválida" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 30);
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const jobs = await db.job.findMany({
    where: { profile: { orgId: user.orgId }, createdAt: { gte: fromDate } },
    include: { profile: { select: { name: true } }, device: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["jobId", "perfil", "dispositivo", "estado", "creado", "ultimaActualizacion"],
    ...jobs.map((job) => [
      job.id,
      job.profile.name,
      job.device?.name ?? "N/A",
      job.status,
      job.createdAt.toISOString(),
      job.updatedAt?.toISOString?.() ?? job.createdAt.toISOString(),
    ]),
  ];

  const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jobs-${days}d.csv"`,
    },
  });
}
