import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

type AdapterUserWithOrg = {
  role?: string;
  orgId?: string | null;
};

const adapter = PrismaAdapter(db) as Adapter;

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email || "");
        const pw = String(creds?.password || "");
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(pw, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: user.orgId ?? null,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const candidate = user as AdapterUserWithOrg;
        if (candidate.role) token.role = candidate.role;
        if (typeof candidate.orgId !== "undefined") token.orgId = candidate.orgId;
      } else if (token.sub && (!token.role || typeof token.orgId === "undefined")) {
        const dbUser = await db.user.findUnique({ where: { id: token.sub } });
        if (dbUser) {
          token.role = dbUser.role;
          token.orgId = dbUser.orgId;
          token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.role = typeof token.role === "string" ? token.role : "TECH";
        session.user.orgId =
          typeof token.orgId === "string" || token.orgId === null ? token.orgId : null;
      }
      return session;
    },
  },
};
