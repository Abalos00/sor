import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export async function getSession() {
  if (isBuildPhase) return null;
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export const auth = {
  getSession,
  getCurrentUser,
  async requireUser() {
    if (isBuildPhase) {
      return {
        id: "build-user",
        email: "g.abalos.v@gmail.com",
        role: "ADMIN",
        orgId: null,
      };
    }
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
  },
};
