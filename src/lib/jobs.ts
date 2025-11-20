import { Job, Profile, ProfileTool, Tool } from "@prisma/client";

type ManifestJob = Job & {
  profile: Profile & {
    tools: (ProfileTool & { tool: Tool })[];
  };
};

export type Manifest = ReturnType<typeof buildJobManifest>;

export function buildJobManifest(job: ManifestJob) {
  const tasks = job.profile.tools.map((pt) => {
    const tool = pt.tool;
    if (tool.type === "app" && tool.installer === "winget" && tool.package) {
      return {
        id: tool.id,
        type: "app",
        packageId: tool.package,
        command: `winget install --id ${tool.package} --accept-source-agreements --accept-package-agreements`,
      };
    }

    return { id: tool.id, type: tool.type, packageId: null, command: "" };
  });

  const wallpaper = job.profile.wallpaperUrl
    ? {
        url: job.profile.wallpaperUrl,
        locked: job.profile.wallpaperLock,
      }
    : null;

  return {
    version: 1,
    profile: job.profile.name,
    os: job.profile.os,
    wallpaper,
    tasks,
  };
}
