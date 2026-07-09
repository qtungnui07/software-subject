import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { getCourseProgressForUser } from "@/services/course-progress-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return adaptiveUnauthorizedResponse();
  }

  try {
    const progress = await getCourseProgressForUser(userId, "english");
    return NextResponse.json(
      { success: true, user: { id: userId }, progress },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load course progress", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể tải tiến độ khóa học lúc này.",
      503,
    );
  }
}
