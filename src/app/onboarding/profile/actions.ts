"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/session";
import { onboardingProfileSchema } from "@/lib/validators";

const toJsonInput = (value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
};

export async function createFirstProfile(input: unknown) {
  const user = await auth.requireUser();
  if (!user.orgId) {
    throw new Error("El usuario no tiene organización asociada");
  }

  const profileCount = await db.profile.count({ where: { orgId: user.orgId } });
  if (profileCount > 0) {
    throw new Error("Ya existen perfiles en esta organización");
  }

  const data = onboardingProfileSchema.parse(input);

  const profile = await db.profile.create({
    data: {
      orgId: user.orgId,
      name: data.name,
      industry: data.industry,
      os: data.os,
      tools: {
        create: data.toolIds.map((toolId) => ({
          toolId,
          options: toJsonInput(data.optionsByTool?.[toolId]),
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  return profile.id;
}
