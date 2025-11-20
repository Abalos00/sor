import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";

export async function GET() {
  const user = await auth.requireUser();
  const orgId = user.orgId ?? undefined;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [profiles, jobs7d] = await Promise.all([
    db.profile.count({ where: { orgId } }),
    db.job.count({ where: { profile: { orgId }, createdAt: { gte: sevenDaysAgo } } }),
  ]);

  return NextResponse.json({ profiles, jobs7d });
}
