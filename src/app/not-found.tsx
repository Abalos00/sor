import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-14">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12">
          <div className="flex flex-1 flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
              Error 404
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">No encontramos esta página</h1>
            <p className="text-sm text-slate-600">
              Puede que el enlace esté roto o que el contenido se haya movido. Vuelve al inicio o revisa la sección de
              soporte.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-800"
              >
                Volver al inicio
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                Ir a soporte
              </Link>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-[28px] bg-emerald-200/40 blur-3xl" />
              <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/90 shadow-xl">
                <Image src="/logo-sor.svg" alt="SOR" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
