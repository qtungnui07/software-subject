import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/observability/logger";
import { recordLearningStreak } from "@/services/streak-service";

export const dynamic = "force-dynamic";

let didLogDeprecation = false;

type UpdateStreakRequestBody = {
  lessonId?: unknown;
  earnedXp?: unknown;
};

const parseUpdateStreakBody = (body: UpdateStreakRequestBody) => {
  const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";

  if (!lessonId) {
    return {
      error: "lessonId is required",
      lessonId: null,
      earnedXp: 0,
    };
  }

  const earnedXp =
    typeof body.earnedXp === "number" && Number.isFinite(body.earnedXp)
      ? body.earnedXp
      : 10;

  return {
    error: null,
    lessonId,
    earnedXp,
  };
};

export async function POST(request: Request) {
  if (!didLogDeprecation) {
    didLogDeprecation = true;
    logger.warn("deprecated_compatibility_route_used", {
      route: "/api/streak/update",
    });
  }
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as UpdateStreakRequestBody;
    const parsedBody = parseUpdateStreakBody(body);

    if (parsedBody.error || !parsedBody.lessonId) {
      return NextResponse.json({ error: parsedBody.error }, { status: 400 });
    }

    const result = await recordLearningStreak({
      userId,
      nodeId: parsedBody.lessonId,
      earnedXp: parsedBody.earnedXp,
      completedLessons: 1,
    });

    return NextResponse.json({
      lessonId: result.nodeId,
      ...result,
    });
  } catch (error) {
    logger.error("legacy_streak_update_failed", { error });

    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 },
    );
  }
}
