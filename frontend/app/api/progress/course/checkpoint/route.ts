import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import { recordCheckpointScoreForUser } from "@/services/course-progress-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return adaptiveUnauthorizedResponse();
  }

  const body = await request.json().catch(() => ({}));
  const privilegedFields = findPrivilegedTopLevelFields(body);
  if (privilegedFields.length > 0) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Request chứa trường chỉ được phép tính ở server.",
      400,
    );
  }

  const checkpointId =
    typeof body?.checkpointId === "string" ? body.checkpointId : "";
  const score = Number(body?.score);

  if (!Number.isFinite(score)) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Điểm checkpoint không hợp lệ.",
      400,
    );
  }

  try {
    const result = await recordCheckpointScoreForUser(
      userId,
      checkpointId,
      score,
    );

    if (result.reason === "invalid-node" || result.reason === "not-checkpoint") {
      return adaptiveErrorResponse(
        "NODE_NOT_FOUND",
        "Checkpoint không hợp lệ.",
        404,
      );
    }
    if (result.reason === "locked-node") {
      return adaptiveErrorResponse(
        "NODE_LOCKED",
        "Checkpoint này chưa được mở.",
        403,
      );
    }

    return NextResponse.json({ success: true, ...result }, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to save checkpoint score", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể lưu điểm checkpoint lúc này.",
      503,
    );
  }
}
