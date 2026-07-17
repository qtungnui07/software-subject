import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { adaptiveRateLimits } from "@/db/schema";
import { logger } from "@/lib/observability/logger";

export type AdaptiveRateLimitScope =
  | "learning-complete"
  | "placement-submit"
  | "local-sign-in"
  | "local-sign-up"
  | "internal-sync";

export type AdaptiveRateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: string;
};

type ConsumeRateLimitInput = {
  scope: AdaptiveRateLimitScope;
  identifier: string;
  limit: number;
  windowMs: number;
  now?: Date;
};

type MemoryBucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, MemoryBucket>();

const hashIdentifier = (identifier: string) =>
  createHash("sha256").update(identifier).digest("hex");

const getWindowStart = (now: Date, windowMs: number) =>
  new Date(Math.floor(now.getTime() / windowMs) * windowMs);

const toResult = ({ count, limit, resetAt, now }: {
  count: number;
  limit: number;
  resetAt: Date;
  now: Date;
}): AdaptiveRateLimitResult => ({
  allowed: count <= limit,
  limit,
  remaining: Math.max(0, limit - count),
  retryAfterSeconds: Math.max(
    1,
    Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
  ),
  resetAt: resetAt.toISOString(),
});

const consumeMemoryBucket = (input: ConsumeRateLimitInput) => {
  const now = input.now ?? new Date();
  const key = `${input.scope}:${hashIdentifier(input.identifier)}`;
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now.getTime()) {
    const resetAt = now.getTime() + input.windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return toResult({ count: 1, limit: input.limit, resetAt: new Date(resetAt), now });
  }

  existing.count += 1;
  return toResult({
    count: existing.count,
    limit: input.limit,
    resetAt: new Date(existing.resetAt),
    now,
  });
};

export const consumeAdaptiveRateLimit = async (
  input: ConsumeRateLimitInput,
): Promise<AdaptiveRateLimitResult> => {
  const normalized = {
    ...input,
    limit: Math.max(1, Math.trunc(input.limit)),
    windowMs: Math.max(1_000, Math.trunc(input.windowMs)),
  };

  if (!process.env.DATABASE_URL) return consumeMemoryBucket(normalized);

  const now = input.now ?? new Date();
  const windowStart = getWindowStart(now, normalized.windowMs);
  const resetAt = new Date(windowStart.getTime() + normalized.windowMs);
  const identifierHash = hashIdentifier(input.identifier);
  const bucketId = `${input.scope}:${identifierHash}:${windowStart.toISOString()}`;

  try {
    const [bucket] = await db
      .insert(adaptiveRateLimits)
      .values({
        id: bucketId,
        scope: input.scope,
        identifierHash,
        windowStart,
        requestCount: 1,
        expiresAt: resetAt,
      })
      .onConflictDoUpdate({
        target: adaptiveRateLimits.id,
        set: {
          requestCount: sql`${adaptiveRateLimits.requestCount} + 1`,
          updatedAt: now,
        },
      })
      .returning({ requestCount: adaptiveRateLimits.requestCount });

    return toResult({
      count: Number(bucket?.requestCount ?? 1),
      limit: normalized.limit,
      resetAt,
      now,
    });
  } catch (error) {
    logger.warn("adaptive_rate_limit_storage_unavailable", {
      scope: input.scope,
      error,
    });
    return consumeMemoryBucket(normalized);
  }
};

export const getRequestNetworkIdentifier = (
  request: Request,
  fallback = "unknown-client",
) => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || fallback;
};

export const adaptiveRateLimitHeaders = (result: AdaptiveRateLimitResult) => ({
  "x-ratelimit-limit": String(result.limit),
  "x-ratelimit-remaining": String(result.remaining),
  "x-ratelimit-reset": result.resetAt,
  ...(result.allowed ? {} : { "retry-after": String(result.retryAfterSeconds) }),
});
