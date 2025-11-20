import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await auth.requireUser();
  if (!user.orgId) {
    return NextResponse.json({ message: "El usuario no tiene organización" }, { status: 400 });
  }

  const body = await req.json();
  const profileId = String(body.profileId || "");
  if (!profileId) {
    return NextResponse.json({ message: "Selecciona un perfil" }, { status: 400 });
  }

  const profile = await db.profile.findFirst({
    where: { id: profileId, orgId: user.orgId },
  });
  if (!profile) {
    return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { orgId: profile.orgId },
  });

  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
