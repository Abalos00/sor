import Link from "next/link";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilesPage() {
  const user = await auth.requireUser();
  const profiles = await db.profile.findMany({
    where: { orgId: user.orgId ?? undefined },
    include: { tools: { include: { tool: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Perfiles</p>
          <h1 className="text-2xl font-semibold text-slate-900">Catálogo de perfiles</h1>
        </div>
        <Link
          href="/dashboard/profiles/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nuevo perfil
        </Link>
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Todavía no tienes perfiles. Crea el primero para poder lanzar jobs.
        </div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{profile.name}</p>
                  <p className="text-sm text-slate-500">
                    {profile.industry} · {profile.os}
                  </p>
                  {profile.wallpaperUrl && (
                    <p className="text-xs text-slate-500">
                      Fondo definido {profile.wallpaperLock ? "(protegido)" : "(editable)"}.
                    </p>
                  )}
                </div>
                <Link href={`/dashboard/profiles/${profile.id}`} className="text-sm font-medium text-slate-900 underline">
                  Editar
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {profile.tools.length} herramientas ·{" "}
                {profile.tools.map((t) => t.tool.name).join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
