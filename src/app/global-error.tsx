"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const prerender = false;

type GlobalErrorProps = {
  error: Error & { digest?: string };
};

export default function GlobalError({ error }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">SOR</p>
          <h1 className="mt-4 text-3xl font-semibold">Ha ocurrido un error</h1>
          <p className="mt-3 text-sm text-slate-600">
            No pudimos renderizar la vista. Refresca la página o vuelve al inicio mientras investigamos el incidente.
          </p>
          {error?.digest && (
            <p className="mt-2 text-xs text-slate-400">Código de seguimiento: {error.digest}</p>
          )}
          <Link
            href="/"
            className="mt-6 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Ir a la landing
          </Link>
        </div>
      </body>
    </html>
  );
}
