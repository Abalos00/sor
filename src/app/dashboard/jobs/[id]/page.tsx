import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildJobManifest } from "@/lib/jobs";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { JobProgressPanel } from "@/components/jobs/JobProgressPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await auth.requireUser();
  const job = await db.job.findFirst({
    where: { id, profile: { orgId: user.orgId ?? undefined } },
    include: {
      profile: { include: { tools: { include: { tool: true } } } },
      device: true,
      tasks: true,
    },
  });
  if (!job) notFound();

  const manifest = buildJobManifest(job);
  const plannedTasks = manifest.tasks.map((task) => ({
    id: task.id,
    type: task.type,
    command: task.command,
  }));
  const initialTasks =
    job.tasks?.map((task) => ({
      id: task.id,
      toolId: task.toolId,
      status: task.status,
      startedAt: task.startedAt?.toISOString() ?? null,
      finishedAt: task.finishedAt?.toISOString() ?? null,
    })) ?? [];
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Job</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">#{job.id}</h1>
          <StatusBadge status={job.status} />
        </div>
        <p className="text-sm text-slate-500">Perfil: {job.profile.name}</p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-500">Creado por</p>
          <p className="text-lg font-semibold text-slate-900">{job.createdBy}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Dispositivo</p>
          <p className="text-lg font-semibold text-slate-900">{job.device?.name ?? "Sin asignar"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Access key (agentes offline)</p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-slate-600 break-all">{job.accessKey}</p>
            <CopyButton value={job.accessKey} label="Copiar key" />
          </div>
        </div>
      </div>

      <JobProgressPanel
        jobId={job.id}
        plannedTasks={plannedTasks}
        initialStatus={{ status: job.status, tasks: initialTasks }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Acciones</p>
            <h2 className="text-xl font-semibold text-slate-900">Script offline / agente</h2>
            <p className="text-sm text-slate-500">
              Ejecuta el agente conectado o descarga el script para correrlo desde un pendrive.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Link
              href={`/api/jobs/${job.id}/script?key=${job.accessKey}`}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 text-center"
            >
              Descargar script
            </Link>
            <Link
              href={`/api/jobs/${job.id}/package?key=${job.accessKey}`}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 text-center"
            >
              Paquete offline (.zip)
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">Ejecutar con agente conectado</p>
          <p className="font-mono text-sm text-slate-700">
            powershell -File agent.ps1 -JobId {job.id} -AccessKey {job.accessKey} -ServerUrl {baseUrl}
          </p>
          <p className="mt-3 font-semibold text-slate-900">Ejecutar offline</p>
          <ol className="list-decimal pl-4 text-slate-600">
            <li>Descarga el script y cárgalo en un pendrive.</li>
            <li>En el equipo destino, ábrelo con PowerShell (modo admin recomendado).</li>
            <li>El script validará si las apps ya existen antes de instalarlas.</li>
          </ol>
        </div>
      </div>

      {/* La sección de manifest se ocultó para simplificar la vista del usuario */}
    </div>
  );
}
