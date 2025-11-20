import Link from "next/link";
import { TicketForm } from "@/components/landing/TicketForm";

export const metadata = {
  title: "Centro de tickets - SOR",
};

export default function TicketsPage() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">Tickets</p>
          <h1 className="text-4xl font-semibold text-slate-900">Centro de soporte</h1>
          <p className="text-sm text-slate-600">
            Abre tickets, deja notas y sigue el timeline desde un solo lugar. Guardamos la informacion en localStorage
            para que puedas retomarla aunque estes sin conexion.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">Nuevo ticket</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Describe el incidente</h2>
            <p className="mt-2 text-sm text-slate-600">
              Completa el formulario y guarda el ticket en local. Podras copiarlo y enviarlo por correo o mantenerlo
              como bitacora hasta que el panel administrativo quede listo.
            </p>
            <TicketForm />
          </div>

          <div className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Que puedes hacer</p>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Prioriza</p>
                <p>
                  Marca el ticket como alto, medio o bajo. Esto nos ayuda a acelerar incidentes que bloquean despliegues.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Guarda tu historial</p>
                <p>
                  Cada envio genera un registro local para que puedas copiarlo y compartirlo por email o Slack sin perder
                  contexto.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Panel proximo</p>
                <p>
                  Estamos preparando un subdominio protegido solo para administradores. Mientras tanto, todo queda
                  disponible aqui y en tu bandeja.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Ayuda rapida</p>
              <p>
                Si necesitas respuesta inmediata, escribe a{" "}
                <a href="mailto:g.abalos.v@gmail.com" className="font-semibold text-slate-900 underline">
                  g.abalos.v@gmail.com
                </a>{" "}
                o abre Slack con tu contacto de soporte asignado.
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href="/support"
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Ver tutoriales
              </Link>
              <Link
                href="/"
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
