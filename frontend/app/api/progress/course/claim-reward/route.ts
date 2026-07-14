import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import {
  claimCourseRewardForUser,
  CourseRewardClaimError,
} from "@/services/course-reward-service";

export const dynamic = "force-dynamic";

const REWARD_CLAIM_FORBIDDEN_FIELDS = new Set([
  "reward",
  "rewards",
  "rewardType",
  "amount",
  "streakFreezes",
  "claimedRewardNodeIds",
  "completedNodeIds",
  "progress",
]);

const findForbiddenRewardClaimFields = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.keys(value).filter((key) =>
    REWARD_CLAIM_FORBIDDEN_FIELDS.has(key),
  );
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return adaptiveUnauthorizedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const forbiddenFields = [
    ...findPrivilegedTopLevelFields(body),
    ...findForbiddenRewardClaimFields(body),
  ];

  if (forbiddenFields.length > 0) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Request chứa trường chỉ được phép tính ở server.",
      400,
    );
  }

  const nodeId = typeof body?.nodeId === "string" ? body.nodeId.trim() : "";
  if (!nodeId) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Thiếu nodeId của rương thưởng.",
      400,
    );
  }

  try {
    const result = await claimCourseRewardForUser({ userId, nodeId });

    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    if (error instanceof CourseRewardClaimError) {
      const code = error.code === "NODE_LOCKED" ? "NODE_LOCKED" :
        error.code === "INVALID_NODE" ? "NODE_NOT_FOUND" : "INVALID_REQUEST";

      return adaptiveErrorResponse(code, error.message, error.status);
    }

    console.error("Failed to claim course reward", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể nhận phần thưởng lúc này.",
      503,
    );
  }
}
