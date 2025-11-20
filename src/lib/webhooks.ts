import { db } from "@/lib/db";

export async function sendJobWebhook(jobId: string, status: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      profile: { select: { name: true, org: { select: { webhookUrl: true } } } },
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!job?.profile.org.webhookUrl) return;
  const payload = {
    jobId: job.id,
    status,
    profile: job.profile.name,
    createdBy: job.createdBy,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };

  try {
    await fetch(job.profile.org.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Webhook error", error);
  }
}
