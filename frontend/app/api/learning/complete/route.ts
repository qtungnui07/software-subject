import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import {
  isUuid,
  normalizeCompletionAccuracy,
  normalizeCompletionDurationSeconds,
} from "@/lib/learning/completion-policy";
import { logger } from "@/lib/observability/logger";
import {
  getRequestId,
  requestIdHeaders,
} from "@/lib/observability/request-context";
import {
  adaptiveRateLimitHeaders,
  consumeAdaptiveRateLimit,
} from "@/lib/rate-limit/adaptive-rate-limit";
import {
  completeLearningNodeForUser,
  LearningCompletionError,
} from "@/services/learning-completion-service";
import { processPendingLearningSyncJobs } from "@/services/learning-sync-recovery-service";

export const dynamic = "force-dynamic";

type CompletionRequestBody = {
  nodeId?: unknown;
  accuracy?: unknown;
  durationSeconds?: unknown;
  idempotencyKey?: unknown;
};

const parseBody = (body: CompletionRequestBody) => {
  const nodeId = typeof body.nodeId === "string" ? body.nodeId.trim() : "";
  const accuracy = normalizeCompletionAccuracy(body.accuracy);
  const durationSeconds = normalizeCompletionDurationSeconds(
    body.durationSeconds,
  );
  const idempotencyKey = body.idempotencyKey;

  if (!nodeId) return { error: "nodeId is required" } as const;
  if (accuracy === null) {
    return { error: "accuracy must be a number from 0 to 100" } as const;
  }
  if (!isUuid(idempotencyKey)) {
    return { error: "idempotencyKey must be a UUID" } as const;
  }

  return {
    error: null,
    nodeId,
    accuracy,
    durationSeconds,
    idempotencyKey,
  } as const;
};

const mapCompletionErrorCode = (error: LearningCompletionError) => {
  if (error.code === "INVALID_NODE") return "NODE_NOT_FOUND" as const;
  if (error.code === "LOCKED_NODE") return "NODE_LOCKED" as const;
  if (error.code === "PROGRESS_UPDATE_FAILED") {
    return "PROGRESS_CONFLICT" as const;
  }
  return "INVALID_REQUEST" as const;
};

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return adaptiveUnauthorizedResponse(requestId);
  }

  const rateLimit = await consumeAdaptiveRateLimit({
    scope: "learning-complete",
    identifier: user.id,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return adaptiveErrorResponse(
      "RATE_LIMITED",
      "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
      429,
      [],
      requestId,
      adaptiveRateLimitHeaders(rateLimit),
    );
  }

  try {
    await processPendingLearningSyncJobs({
      userId: user.id,
      limit: 3,
    }).catch((error) => {
      logger.warn("learning_sync_opportunistic_retry_failed", {
        requestId,
        userId: user.id,
        error,
      });
    });

    const rawBody = await request.json().catch(() => ({}));
    const privilegedFields = findPrivilegedTopLevelFields(rawBody);

    if (privilegedFields.length > 0) {
      return adaptiveErrorResponse(
        "INVALID_REQUEST",
        "Request chứa trường chỉ được phép tính ở server.",
        400,
        privilegedFields.map((field) => ({
          field,
          message: `${field} không được phép gửi từ client.`,
        })),
        requestId,
      );
    }

    const parsed = parseBody(rawBody as CompletionRequestBody);

    if (parsed.error) {
      return adaptiveErrorResponse(
        "INVALID_REQUEST",
        parsed.error,
        400,
        [],
        requestId,
      );
    }

    const result = await completeLearningNodeForUser({
      userId: user.id,
      userName: user.name,
      userImageSrc: user.image,
      nodeId: parsed.nodeId,
      accuracy: parsed.accuracy,
      durationSeconds: parsed.durationSeconds,
      idempotencyKey: parsed.idempotencyKey,
    });

    logger.info("learning_completion_success", {
      requestId,
      userId: user.id,
      nodeId: result.nodeId,
      passed: result.passed,
      syncStatus: result.syncStatus,
      pendingSystems: result.pendingSystems,
    });

    return NextResponse.json(
      { ...result, requestId },
      {
        headers: {
          ...requestIdHeaders(requestId),
          ...adaptiveRateLimitHeaders(rateLimit),
        },
      },
    );
  } catch (error) {
    if (error instanceof LearningCompletionError) {
      return adaptiveErrorResponse(
        mapCompletionErrorCode(error),
        error.message,
        error.status,
        [],
        requestId,
      );
    }

    logger.error("learning_completion_failed", {
      requestId,
      userId: user.id,
      error,
    });
    return adaptiveErrorResponse(
      "INTERNAL_ERROR",
      "Không thể lưu kết quả bài học lúc này.",
      500,
      [],
      requestId,
    );
  }
}
