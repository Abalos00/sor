import Link from "next/link";
import { termsSections, TERMS_VERSION } from "@/content/terms-of-service";

export const metadata = {
  title: "Terminos de servicio - SOR",
};

export default function TermsPage() {
  return (
    <main className="bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl space-y-8 px-4">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Terminos de servicio
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Condiciones de uso de SystemOnReady</h1>
          <p className="text-sm text-slate-500">Version {TERMS_VERSION}</p>
        </div>
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {termsSections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <p>
            Si tienes dudas sobre estos terminos o necesitas una version en PDF, escribe a{" "}
            <a href="mailto:g.abalos.v@gmail.com" className="font-semibold text-slate-900 underline">
              g.abalos.v@gmail.com
            </a>
            .
          </p>
          <p className="mt-2">
            Para volver al soporte o la documentacion principal visita{" "}
            <Link href="/support" className="font-semibold text-slate-900 underline">
              la seccion de soporte
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
