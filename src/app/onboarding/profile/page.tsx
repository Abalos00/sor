import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";
import { ProfileWizard } from "@/components/onboarding/ProfileWizard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OnboardingProfilePage() {
  const user = await auth.requireUser();
  if (!user.orgId) redirect("/login");

  const profileCount = await db.profile.count({ where: { orgId: user.orgId } });
  if (profileCount > 0) redirect("/dashboard");

  const tools = await db.tool.findMany({
    where: { os: "windows" },
    orderBy: { name: "asc" },
  });

  return <ProfileWizard tools={tools} />;
}
