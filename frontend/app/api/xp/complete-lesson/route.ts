import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { logger } from "@/lib/observability/logger";
import {
  normalizeCompletionAccuracy,
  normalizeCompletionDurationSeconds,
} from "@/lib/learning/completion-policy";
import {
  completeLearningNodeForUser,
  LearningCompletionError,
} from "@/services/learning-completion-service";

export const dynamic = "force-dynamic";

let didLogDeprecation = false;

type CompleteLessonXpRequestBody = {
  lessonId?: unknown;
  accuracy?: unknown;
  durationSeconds?: unknown;
  idempotencyKey?: unknown;
};

export async function POST(request: Request) {
  if (!didLogDeprecation) {
    didLogDeprecation = true;
    logger.warn("deprecated_compatibility_route_used", {
      route: "/api/xp/complete-lesson",
    });
  }
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as CompleteLessonXpRequestBody;
    const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
    const accuracy = normalizeCompletionAccuracy(body.accuracy);

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }
    if (accuracy === null) {
      return NextResponse.json(
        { error: "accuracy is required and must be a number" },
        { status: 400 },
      );
    }

    const result = await completeLearningNodeForUser({
      userId: user.id,
      userName: user.name,
      userImageSrc: user.image,
      nodeId: lessonId,
      accuracy,
      durationSeconds: normalizeCompletionDurationSeconds(body.durationSeconds),
      idempotencyKey:
        typeof body.idempotencyKey === "string" && body.idempotencyKey.trim()
          ? body.idempotencyKey.trim()
          : randomUUID(),
    });

    return NextResponse.json({
      success: true,
      lessonId: result.nodeId,
      earnedXp: result.xp.earnedXp,
      baseXp: result.xp.baseXp,
      accuracyBonus: result.xp.accuracyBonus,
      accuracy: result.accuracy,
      totalXp: result.xp.totalXp ?? 0,
      dailyXp: result.xp.dailyXp ?? 0,
      weeklyXp: result.xp.weeklyXp ?? 0,
      level: result.xp.level ?? 1,
      alreadyClaimed: result.xp.alreadyClaimed,
      isPassed: result.passed,
      rewardType: result.xp.rewardType ?? "none",
      message: result.xp.message ?? "Learning completion was processed.",
      currentDay: result.xp.currentDay ?? "",
      currentWeekStart: result.xp.currentWeekStart ?? "",
      questProgress: {
        success: true,
        skipped: result.quests.skipped,
        code: result.quests.code ?? undefined,
      },
      completion: result,
    });
  } catch (error) {
    if (error instanceof LearningCompletionError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    logger.error("legacy_xp_completion_failed", { error });
    return NextResponse.json(
      { error: "Failed to complete lesson XP" },
      { status: 500 },
    );
  }
}
