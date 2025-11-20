import { db } from "@/lib/db";
import { defaultTools } from "@/lib/data/default-tools";

export async function ensureDefaultTools() {
  await db.tool.createMany({
    data: defaultTools,
    skipDuplicates: true,
  });
}
