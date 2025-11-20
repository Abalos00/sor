import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const recommendedByIndustry: Record<string, string[]> = {
  Escolar: ["edge", "libreoffice", "sumatra"],
  Empresa: ["edge", "libreoffice", "7zip", "vlc"],
  Laboratorio: ["edge", "7zip", "vlc"],
  Otro: [],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const os = searchParams.get("os") ?? "windows";
  const industry = searchParams.get("industry") ?? undefined;
  const tools = await db.tool.findMany({ where: { os }, orderBy: { name: "asc" } });

  if (industry) {
    const picks = recommendedByIndustry[industry] ?? [];
    tools.sort((a, b) => {
      const aIsRecommended = picks.includes(a.id);
      const bIsRecommended = picks.includes(b.id);
      if (aIsRecommended === bIsRecommended) return a.name.localeCompare(b.name);
      return aIsRecommended ? -1 : 1;
    });
  }

  return NextResponse.json(tools);
}
