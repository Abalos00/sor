import { headers } from "next/headers";

type Bucket = {
  count: number;
  expiresAt: number;
};

const globalStore = global as unknown as {
  __sorRateLimit?: Map<string, Bucket>;
};

const store = globalStore.__sorRateLimit ?? new Map<string, Bucket>();
if (!globalStore.__sorRateLimit) {
  globalStore.__sorRateLimit = store;
}

export async function getClientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return h.get("cf-connecting-ip") ?? "unknown";
}

export function assertRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || bucket.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    throw new Error("rate_limit_exceeded");
  }
}
