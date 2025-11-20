import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { DeviceForm } from "@/components/forms/DeviceForm";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DevicesPage() {
  const user = await auth.requireUser();
  const devices = await db.device.findMany({
    where: { orgId: user.orgId ?? undefined },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dispositivos</p>
        <h1 className="text-2xl font-semibold text-slate-900">Gestión de agentes</h1>
        <p className="text-sm text-slate-500">
          Registra dispositivos para tener tokens dedicados o crea agentes on-demand al lanzar un job.
        </p>
      </div>

      <DeviceForm />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Dispositivos registrados</h2>
        {devices.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aún no registras dispositivos manualmente.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Sistema</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Token</th>
                  <th className="py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="border-t border-slate-100">
                    <td className="py-2 font-medium text-slate-900">{device.name}</td>
                    <td className="py-2 text-slate-600 capitalize">{device.os}</td>
                    <td className="py-2 text-slate-600">{device.status}</td>
                    <td className="py-2 font-mono text-xs text-slate-600">{device.token}</td>
                    <td className="py-2">
                      <div className="flex flex-col gap-2 md:flex-row">
                        <CopyButton value={device.token} label="Copiar token" />
                        <a
                          href={`/api/devices/${device.id}/agent`}
                          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Descargar script
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
