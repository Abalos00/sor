import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ email: user.email, role: user.role ?? "TECH", orgName: null });
  }

  const org = await db.org.findUnique({ where: { id: user.orgId } });
  return NextResponse.json({
    email: user.email,
    role: user.role ?? "TECH",
    orgName: org?.name ?? null,
  });
}
