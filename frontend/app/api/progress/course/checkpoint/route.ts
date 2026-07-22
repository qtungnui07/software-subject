import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import {
  isUuid,
  normalizeCompletionDurationSeconds,
} from "@/lib/learning/completion-policy";
import { normalizeAfkCount } from "@/lib/study-session-policy";
import {
  CheckpointSubmissionError,
  submitSectionOneCheckpointForUser,
} from "@/services/checkpoint-submission-service";
import { LearningCompletionError } from "@/services/learning-completion-service";
import type {
  CheckpointSubmission,
  CheckpointSubmissionAnswer,
} from "@/types/checkpoint";

export const dynamic = "force-dynamic";

type RawCheckpointBody = {
  checkpointId?: unknown;
  answers?: unknown;
  durationSeconds?: unknown;
  afkCount?: unknown;
  idempotencyKey?: unknown;
  assessmentMode?: unknown;
};

const parseAnswers = (value: unknown): CheckpointSubmissionAnswer[] | null => {
  if (!Array.isArray(value) || value.length > 12) return null;

  const answers: CheckpointSubmissionAnswer[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const record = item as Record<string, unknown>;
    const exerciseId =
      typeof record.exerciseId === "string" ? record.exerciseId.trim() : "";
    const answer = record.answer;

    if (!exerciseId || !answer || typeof answer !== "object" || Array.isArray(answer)) {
      return null;
    }

    answers.push({
      exerciseId,
      answer: answer as CheckpointSubmissionAnswer["answer"],
    });
  }

  return answers;
};

const parseBody = (body: RawCheckpointBody): CheckpointSubmission | null => {
  const checkpointId =
    typeof body.checkpointId === "string" ? body.checkpointId.trim() : "";
  const answers = parseAnswers(body.answers);

  const assessmentMode =
    body.assessmentMode === "standard" || body.assessmentMode === "silent"
      ? body.assessmentMode
      : null;

  if (!checkpointId || !answers || !isUuid(body.idempotencyKey) || !assessmentMode) return null;

  return {
    checkpointId,
    answers,
    durationSeconds: normalizeCompletionDurationSeconds(body.durationSeconds),
    afkCount: normalizeAfkCount(body.afkCount),
    idempotencyKey: body.idempotencyKey,
    assessmentMode,
  };
};

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return adaptiveUnauthorizedResponse();
  }

  const rawBody = await request.json().catch(() => ({}));
  const privilegedFields = findPrivilegedTopLevelFields(rawBody);
  if (privilegedFields.length > 0) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Checkpoint chỉ chấp nhận đáp án; điểm và trạng thái đạt được tính ở server.",
      400,
    );
  }

  const submission = parseBody(rawBody as RawCheckpointBody);
  if (!submission) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Dữ liệu nộp checkpoint không hợp lệ.",
      400,
    );
  }

  try {
    const result = await submitSectionOneCheckpointForUser({
      userId: user.id,
      userName: user.name,
      userImageSrc: user.image,
      submission,
    });

    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    if (error instanceof CheckpointSubmissionError) {
      const code =
        error.code === "LOCKED_CHECKPOINT"
          ? "NODE_LOCKED"
          : error.code === "INVALID_CHECKPOINT"
            ? "NODE_NOT_FOUND"
            : "INVALID_REQUEST";
      return adaptiveErrorResponse(code, error.message, error.status);
    }

    if (error instanceof LearningCompletionError) {
      return adaptiveErrorResponse(
        error.code === "LOCKED_NODE" ? "NODE_LOCKED" : "PROGRESS_CONFLICT",
        error.message,
        error.status,
      );
    }

    console.error("Failed to submit checkpoint", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể chấm checkpoint lúc này.",
      503,
    );
  }
}
