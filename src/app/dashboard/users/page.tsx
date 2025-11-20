import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";
import UsersClient from "@/components/users/UsersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersPage() {
  const user = await auth.requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    where: { orgId: user.orgId ?? undefined },
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Usuarios</p>
        <h1 className="text-2xl font-semibold text-slate-900">Equipo y roles</h1>
        <p className="text-sm text-slate-500">
          Invita a nuevos colaboradores y define si administran o solo ejecutan tareas.
        </p>
      </div>
      <UsersClient initialUsers={users} />
    </div>
  );
}
