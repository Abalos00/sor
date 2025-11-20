import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ensureDefaultTools } from "@/lib/tools";
import { ProfileForm } from "@/components/forms/ProfileForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewProfilePage() {
  await auth.requireUser();
  await ensureDefaultTools();
  const tools = await db.tool.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Nuevo perfil</p>
        <h1 className="text-2xl font-semibold text-slate-900">Configura qué instalar</h1>
        <p className="text-sm text-slate-500">
          Define el sistema operativo objetivo y las herramientas que el agente aplicará.
        </p>
      </div>
      <ProfileForm mode="create" tools={tools} />
    </div>
  );
}
