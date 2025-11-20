import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ActionCard } from "@/components/ActionCard";
import { TicketDashboard } from "@/components/tickets/TicketDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await auth.requireUser();
  const orgId = user.orgId!;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [profileCount, jobs7d] = await Promise.all([
    db.profile.count({ where: { orgId } }),
    db.job.count({ where: { profile: { orgId }, createdAt: { gte: sevenDaysAgo } } }),
  ]);

  if (profileCount === 0) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">SystemOnReady</h1>
        <p className="text-slate-500">
          Administra perfiles, herramientas y jobs de instalación desde un solo lugar.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-sm text-slate-500">Perfiles activos</p>
          <p className="text-3xl font-semibold text-slate-900">{profileCount}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Jobs creados (últimos 7 días)</p>
          <p className="text-3xl font-semibold text-slate-900">{jobs7d}</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ActionCard
          title="Perfiles"
          description="Define qué software debe instalarse y configura las bases de cada rubro."
          href="/dashboard/profiles/new"
          actionLabel="Crear perfil"
        />
        <ActionCard
          title="Jobs"
          description="Encola despliegues para tus dispositivos usando un perfil existente."
          href="/dashboard/jobs/new"
          actionLabel="Crear job"
          disabled={profileCount === 0}
        />
        <ActionCard
          title="Dispositivos"
          description="Registra agentes permanentes y copia su token para conectarlos al servicio."
          href="/dashboard/devices"
          actionLabel="Gestionar dispositivos"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Atajos rápidos</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Link
            href="/dashboard/profiles"
            className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 hover:border-slate-400"
          >
            Ver perfiles creados
          </Link>
          <Link
            href="/dashboard/jobs"
            className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 hover:border-slate-400"
          >
            Historial de jobs
          </Link>
        </div>
      </section>

      <TicketDashboard />
    </div>
  );
}

