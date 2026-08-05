import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
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
  PlacementApiContractError,
  parsePlacementSubmissionRequest,
  toPlacementGetResponse,
  toPlacementResultResponse,
} from "@/lib/placement-test/placement-api-contract";
import {
  getPlacementTestResultForUser,
  submitPlacementTestForUser,
} from "@/services/placement-test-service";
import { getContentPlacementTest } from "@/services/content-service";

export const dynamic = "force-dynamic";

const getCurrentUserId = async () => {
  const session = await auth().catch(() => null);
  return session?.user?.id ?? null;
};

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const userId = await getCurrentUserId();

  if (!userId) {
    return adaptiveUnauthorizedResponse(requestId);
  }

  try {
    const [previousResult, contentTest] = await Promise.all([
      getPlacementTestResultForUser(userId),
      getContentPlacementTest(),
    ]);
    return NextResponse.json(
      {
        ...toPlacementGetResponse({
          questions: contentTest.questions,
          previousResult,
        }),
        requestId,
      },
      { headers: requestIdHeaders(requestId) },
    );
  } catch (error) {
    logger.error("placement_test_load_failed", { requestId, userId, error });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể tải bài kiểm tra lúc này.",
      503,
      [],
      requestId,
    );
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const userId = await getCurrentUserId();

  if (!userId) {
    return adaptiveUnauthorizedResponse(requestId);
  }

  const rateLimit = await consumeAdaptiveRateLimit({
    scope: "placement-submit",
    identifier: userId,
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!rateLimit.allowed) {
    return adaptiveErrorResponse(
      "RATE_LIMITED",
      "Bạn đã nộp bài quá nhiều lần. Vui lòng thử lại sau.",
      429,
      [],
      requestId,
      adaptiveRateLimitHeaders(rateLimit),
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const privilegedFields = findPrivilegedTopLevelFields(body);
    if (privilegedFields.length > 0) {
      return adaptiveErrorResponse(
        "INVALID_REQUEST",
        "Request chứa trường chỉ được phép tính ở server.",
        400,
        [],
        requestId,
      );
    }

    const submission = parsePlacementSubmissionRequest(body);
    const result = await submitPlacementTestForUser(userId, submission);

    logger.info("placement_submission_success", {
      requestId,
      userId,
      assignedSectionId: result.highestAssignedSectionId,
      totalCorrect: result.totalCorrect,
    });

    return NextResponse.json(
      { ...toPlacementResultResponse(result), requestId },
      {
        headers: {
          ...requestIdHeaders(requestId),
          ...adaptiveRateLimitHeaders(rateLimit),
        },
      },
    );
  } catch (error) {
    if (error instanceof PlacementApiContractError) {
      return adaptiveErrorResponse(
        "INVALID_REQUEST",
        error.issues[0] ?? "Dữ liệu bài làm không hợp lệ.",
        error.status,
        error.issues.map((message) => ({ message })),
        requestId,
      );
    }

    logger.error("placement_submission_failed", { requestId, userId, error });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể nộp bài lúc này. Vui lòng thử lại.",
      503,
      [],
      requestId,
    );
  }
}
