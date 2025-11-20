import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  const user = await auth.requireUser();
  const { id } = await context.params;
  const job = await db.job.findFirst({
    where: { id, profile: { orgId: user.orgId ?? undefined } },
    include: {
      profile: { include: { tools: { include: { tool: true } } } },
      device: true,
      tasks: true,
    },
  });
  if (!job) {
    return NextResponse.json({ message: "Job no encontrado" }, { status: 404 });
  }
  return NextResponse.json(job);
}
