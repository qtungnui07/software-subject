import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import { completeCourseNodeForUser } from "@/services/course-progress-service";

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

  const nodeId = typeof body?.nodeId === "string" ? body.nodeId : "";

  try {
    const result = await completeCourseNodeForUser(userId, nodeId);

    if (result.reason === "invalid-node" || result.reason === "not-checkpoint") {
      return adaptiveErrorResponse(
        "NODE_NOT_FOUND",
        "Bài học không hợp lệ.",
        404,
      );
    }
    if (result.reason === "locked-node") {
      return adaptiveErrorResponse(
        "NODE_LOCKED",
        "Bài học này chưa được mở.",
        403,
      );
    }

    return NextResponse.json({ success: true, ...result }, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to complete course node", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể lưu tiến độ bài học lúc này.",
      503,
    );
  }
}
