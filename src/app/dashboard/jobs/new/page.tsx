import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { JobForm } from "@/components/forms/JobForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewJobPage() {
  const user = await auth.requireUser();
  const [profiles, devices] = await Promise.all([
    db.profile.findMany({
      where: { orgId: user.orgId ?? undefined },
      orderBy: { name: "asc" },
      select: { id: true, name: true, os: true },
    }),
    db.device.findMany({
      where: { orgId: user.orgId ?? undefined },
      orderBy: { name: "asc" },
      select: { id: true, name: true, os: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Nuevo job</p>
        <h1 className="text-2xl font-semibold text-slate-900">Encola un despliegue</h1>
        <p className="text-sm text-slate-500">
          Selecciona el perfil y asigna un dispositivo existente o crea uno al vuelo.
        </p>
      </div>
      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Necesitas al menos un perfil para crear jobs.
          <div className="mt-4 flex justify-center">
            <Link
              href="/dashboard/profiles/new"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Crear perfil
            </Link>
          </div>
        </div>
      ) : (
        <JobForm profiles={profiles} devices={devices} />
      )}
    </div>
  );
}
