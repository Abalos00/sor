import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { defaultTools } from "../src/lib/data/default-tools";

const db = new PrismaClient();

async function main() {
  const org = await db.org.upsert({
    where: { id: "seed-org" },
    update: {},
    create: { id: "seed-org", name: "Org Demo" },
  });

  const hash = await bcrypt.hash("admin", 10);
  await db.user.upsert({
    where: { email: "admin@sor.local" },
    update: {},
    create: { email: "admin@sor.local", password: hash, role: "ADMIN", orgId: org.id },
  });

  await db.tool.createMany({
    data: defaultTools,
    skipDuplicates: true,
  });

  if (process.env.SEED_PROFILE === "true") {
    await db.profile.upsert({
      where: { id: "seed-profile" },
      update: {},
      create: {
        id: "seed-profile",
        orgId: org.id,
        name: "PC Escolar basico",
        industry: "Escolar",
        os: "windows",
      },
    });

    await db.profileTool.createMany({
      data: [
        { profileId: "seed-profile", toolId: "edge" },
        { profileId: "seed-profile", toolId: "libreoffice" },
      ],
      skipDuplicates: true,
    });
  }
}

main().finally(() => db.$disconnect());
