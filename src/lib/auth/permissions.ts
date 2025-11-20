import { auth } from "@/lib/auth/session";

export async function requireAdmin() {
  const user = await auth.requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
