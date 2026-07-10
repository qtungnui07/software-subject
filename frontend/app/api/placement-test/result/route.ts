import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { toPlacementResultResponse } from "@/lib/placement-test/placement-api-contract";
import { getPlacementTestResultForUser } from "@/services/placement-test-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  if (!userId) {
    return adaptiveUnauthorizedResponse();
  }

  try {
    const result = await getPlacementTestResultForUser(userId);

    if (!result) {
      return adaptiveErrorResponse(
        "RESULT_NOT_FOUND",
        "Chưa có kết quả kiểm tra đầu vào.",
        404,
      );
    }

    return NextResponse.json(toPlacementResultResponse(result), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load Placement Test result", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể tải kết quả lúc này.",
      503,
    );
  }
}
