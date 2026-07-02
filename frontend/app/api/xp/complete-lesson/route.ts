import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { recordQuestLessonProgress } from "@/services/quest-service";
import {
  getQuestProgressSkipCode,
  normalizeQuestAccuracy,
  normalizeQuestDurationSeconds,
  shouldRecordQuestProgress,
} from "@/services/quest-progress-policy";
import { completeLessonXp } from "@/services/xp-service";

export const dynamic = "force-dynamic";

type CompleteLessonXpRequestBody = {
  lessonId?: unknown;
  accuracy?: unknown;
  durationSeconds?: unknown;
};

const parseAccuracy = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const parseDurationSeconds = (value: unknown) => {
  return normalizeQuestDurationSeconds(value);
};

const SHOULD_LOG_XP_QUEST_BRIDGE =
  process.env.NEXT_PUBLIC_SHOW_QUEST_DEBUG === "true";

const logXpQuestBridgeWarning = (message: string, error: unknown) => {
  if (!SHOULD_LOG_XP_QUEST_BRIDGE) return;

  console.warn(message, error);
};

const parseBody = (body: CompleteLessonXpRequestBody) => {
  const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
  const accuracy = parseAccuracy(body.accuracy);
  const durationSeconds = parseDurationSeconds(body.durationSeconds);

  if (!lessonId) {
    return {
      error: "lessonId is required",
      lessonId: null,
      accuracy: null,
    };
  }

  if (accuracy === null) {
    return {
      error: "accuracy is required and must be a number",
      lessonId: null,
      accuracy: null,
    };
  }

  return {
    error: null,
    lessonId,
    accuracy,
    durationSeconds,
  };
};

const recordQuestProgressAfterLesson = async ({
  userId,
  earnedXp,
  accuracy,
  durationSeconds,
}: {
  userId: string;
  earnedXp: number;
  accuracy: number;
  durationSeconds: number;
}) => {
  try {
    return await recordQuestLessonProgress({
      userId,
      earnedXp,
      accuracy,
      durationSeconds,
    });
  } catch (error) {
    logXpQuestBridgeWarning(
      "Robogo XP completion could not record quest progress. Lesson completion remains valid.",
      error,
    );

    return {
      success: true as const,
      skipped: true,
      code: "QUEST_PROGRESS_RECORD_FAILED",
    };
  }
};

const getCurrentXpUser = async () => {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name || "User",
      image: session.user.image || "/mascot.svg",
    };
  }

  return null;
};

export async function POST(request: Request) {
  const currentUser = await getCurrentXpUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as CompleteLessonXpRequestBody;
    const parsedBody = parseBody(body);

    if (parsedBody.error || !parsedBody.lessonId || parsedBody.accuracy === null) {
      return NextResponse.json({ error: parsedBody.error }, { status: 400 });
    }

    const result = await completeLessonXp({
      userId: currentUser.id,
      userName: currentUser.name,
      userImageSrc: currentUser.image,
      lessonId: parsedBody.lessonId,
      accuracy: parsedBody.accuracy,
    });
    const shouldRecordQuestProgressForLesson = shouldRecordQuestProgress(result);
    const questProgress = shouldRecordQuestProgressForLesson
      ? await recordQuestProgressAfterLesson({
          userId: currentUser.id,
          earnedXp: result.earnedXp,
          accuracy: normalizeQuestAccuracy(result.accuracy),
          durationSeconds: parsedBody.durationSeconds,
        })
      : {
          success: true as const,
          skipped: true,
          code: getQuestProgressSkipCode(result) ?? "QUEST_PROGRESS_NOT_RECORDED",
        };

    return NextResponse.json({
      ...result,
      questProgress,
    });
  } catch (error) {
    console.error("Failed to complete lesson XP", error);

    return NextResponse.json(
      { error: "Failed to complete lesson XP" },
      { status: 500 }
    );
  }
}
