import { NextResponse } from "next/server";

import { adaptiveErrorResponse } from "@/lib/errors/api-response";
import { logger } from "@/lib/observability/logger";
import {
  getRequestId,
  requestIdHeaders,
} from "@/lib/observability/request-context";
import {
  adaptiveRateLimitHeaders,
  consumeAdaptiveRateLimit,
  getRequestNetworkIdentifier,
} from "@/lib/rate-limit/adaptive-rate-limit";
import { processPendingLearningSyncJobs } from "@/services/learning-sync-recovery-service";

export const dynamic = "force-dynamic";

const isAuthorized = (request: Request) => {
  const configured = process.env.INTERNAL_SYNC_SECRET?.trim();
  const authorization = request.headers.get("authorization")?.trim();
  return Boolean(configured && authorization === `Bearer ${configured}`);
};

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  if (!process.env.INTERNAL_SYNC_SECRET?.trim()) {
    return adaptiveErrorResponse(
      "SERVICE_UNAVAILABLE",
      "Internal sync is not configured.",
      503,
      [],
      requestId,
    );
  }

  if (!isAuthorized(request)) {
    return adaptiveErrorResponse(
      "UNAUTHORIZED",
      "Unauthorized internal request.",
      401,
      [],
      requestId,
    );
  }

  const rateLimit = await consumeAdaptiveRateLimit({
    scope: "internal-sync",
    identifier: getRequestNetworkIdentifier(request, "internal-worker"),
    limit: 12,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return adaptiveErrorResponse(
      "RATE_LIMITED",
      "Too many internal sync requests.",
      429,
      [],
      requestId,
      adaptiveRateLimitHeaders(rateLimit),
    );
  }

  const result = await processPendingLearningSyncJobs({ limit: 20 });
  logger.info("learning_sync_batch_processed", { requestId, ...result });

  return NextResponse.json(
    { ok: true, ...result, requestId },
    {
      headers: {
        ...requestIdHeaders(requestId),
        ...adaptiveRateLimitHeaders(rateLimit),
      },
    },
  );
}
