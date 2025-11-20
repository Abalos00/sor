import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import ReportsClient from "@/components/reports/ReportsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  const user = await auth.requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");

  const org = await db.org.findUnique({
    where: { id: user.orgId ?? undefined },
    select: { webhookUrl: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reportes y notificaciones</p>
        <h1 className="text-2xl font-semibold text-slate-900">Descargas y webhooks</h1>
        <p className="text-sm text-slate-500">
          Exporta jobs a CSV y configura alertas externas (Slack, Teams u otras plataformas) mediante webhooks.
        </p>
      </div>
      <ReportsClient initialWebhook={org?.webhookUrl ?? ""} />
    </div>
  );
}
