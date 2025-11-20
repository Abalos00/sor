import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JobsPage() {
  const user = await auth.requireUser();
  const jobs = await db.job.findMany({
    where: { profile: { orgId: user.orgId ?? undefined } },
    include: { profile: true, device: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Jobs</p>
          <h1 className="text-2xl font-semibold text-slate-900">Historial de ejecuciones</h1>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nuevo job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Aun no generas jobs. Crea uno y asocia un perfil para comenzar.
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <StatusBadge status={job.status} />
                  <p className="text-lg font-semibold text-slate-900">{job.profile.name}</p>
                </div>
                <p className="text-sm text-slate-500">
                  {new Date(job.createdAt).toLocaleString("es-AR")}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Dispositivo: {job.device?.name ?? "Sin asignar"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
