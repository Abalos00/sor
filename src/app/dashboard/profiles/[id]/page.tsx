import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ensureDefaultTools } from "@/lib/tools";
import { ProfileForm } from "@/components/forms/ProfileForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProfilePage({ params }: Props) {
  const user = await auth.requireUser();
  const { id } = await params;
  await ensureDefaultTools();
  const [profile, tools] = await Promise.all([
    db.profile.findFirst({
      where: { id, orgId: user.orgId ?? undefined },
      include: { tools: { include: { tool: true } } },
    }),
    db.tool.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Editar perfil</p>
        <h1 className="text-2xl font-semibold text-slate-900">{profile.name}</h1>
      </div>
      <ProfileForm
        mode="edit"
        profileId={profile.id}
        initialValues={{
          name: profile.name,
          industry: profile.industry,
          os: profile.os,
          toolIds: profile.tools.map((t) => t.toolId),
          wallpaper: { url: profile.wallpaperUrl, locked: profile.wallpaperLock },
        }}
        tools={tools}
      />
    </div>
  );
}
