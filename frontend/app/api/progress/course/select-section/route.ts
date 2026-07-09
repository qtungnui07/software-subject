import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import { selectCurrentSectionForUser } from "@/services/course-progress-service";

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

  const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";

  try {
    const result = await selectCurrentSectionForUser(userId, sectionId);

    if (result.reason === "invalid-section") {
      return adaptiveErrorResponse(
        "INVALID_REQUEST",
        "Phần học không hợp lệ.",
        400,
      );
    }
    if (result.reason === "locked-section") {
      return adaptiveErrorResponse(
        "SECTION_LOCKED",
        "Phần học này chưa được mở.",
        403,
      );
    }

    return NextResponse.json({ success: true, ...result }, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to select course section", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể cập nhật phần học lúc này.",
      503,
    );
  }
}
