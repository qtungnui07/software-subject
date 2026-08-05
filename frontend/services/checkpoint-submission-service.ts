import "server-only";

import { getLearningNodeById, getSectionForNode } from "@/lib/courses/course-catalog";
import { canAttemptCheckpoint } from "@/lib/courses/course-unlock-policy";
import {
  getCourseProgressForUser,
  recordCheckpointScoreForUser,
} from "@/services/course-progress-service";
import {
  completeLearningNodeForUser,
  LearningCompletionError,
} from "@/services/learning-completion-service";
import {
  getContentCourse,
  gradeContentCheckpoint,
} from "@/services/content-service";
import type {
  CheckpointSubmission,
  CheckpointSubmissionResult,
} from "@/types/checkpoint";

export class CheckpointSubmissionError extends Error {
  constructor(
    public readonly code:
      | "INVALID_CHECKPOINT"
      | "INVALID_SUBMISSION"
      | "LOCKED_CHECKPOINT",
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CheckpointSubmissionError";
  }
}

const validateSubmission = (submission: CheckpointSubmission) => {
  if (!Array.isArray(submission.answers)) {
    throw new CheckpointSubmissionError(
      "INVALID_SUBMISSION",
      "Danh sách đáp án không hợp lệ.",
      400,
    );
  }
  const submittedIds = submission.answers.map((entry) => entry.exerciseId);
  const uniqueIds = new Set(submittedIds);

  if (uniqueIds.size !== submittedIds.length) {
    throw new CheckpointSubmissionError(
      "INVALID_SUBMISSION",
      "Mỗi câu hỏi chỉ được gửi một đáp án.",
      400,
    );
  }
};

const getGateAccuracy = (
  score: number,
  passed: boolean,
  passThreshold: number,
) => {
  if (passed) {
    return Math.max(
      passThreshold,
      Math.floor(score),
    );
  }

  return Math.min(
    passThreshold - 1,
    Math.floor(score),
  );
};

export const submitCheckpointForUser = async ({
  userId,
  userName,
  userImageSrc,
  submission,
}: {
  userId: string;
  userName?: string | null;
  userImageSrc?: string | null;
  submission: CheckpointSubmission;
}): Promise<CheckpointSubmissionResult> => {
  validateSubmission(submission);
  const course = await getContentCourse("english");
  const checkpoint = getLearningNodeById(course, submission.checkpointId);
  if (!checkpoint || checkpoint.type !== "checkpoint") {
    throw new CheckpointSubmissionError(
      "INVALID_CHECKPOINT",
      "Checkpoint không hợp lệ.",
      404,
    );
  }

  const progressBefore = await getCourseProgressForUser(userId, "english");
  if (!canAttemptCheckpoint(progressBefore, checkpoint.id, course)) {
    throw new CheckpointSubmissionError(
      "LOCKED_CHECKPOINT",
      "Bạn cần hoàn thành đủ sáu lesson trước khi làm checkpoint.",
      403,
    );
  }

  const scored = await gradeContentCheckpoint(submission);

  const completion = await completeLearningNodeForUser({
    userId,
    userName,
    userImageSrc,
    nodeId: checkpoint.id,
    accuracy: getGateAccuracy(
      scored.score,
      scored.passed,
      scored.passThreshold,
    ),
    durationSeconds: submission.durationSeconds,
    afkCount: submission.afkCount,
    idempotencyKey: submission.idempotencyKey,
  });

  const exactScoreMutation = await recordCheckpointScoreForUser(
    userId,
    checkpoint.id,
    scored.score,
    "english",
  );
  if (
    exactScoreMutation.reason === "locked-node" ||
    exactScoreMutation.reason === "invalid-node" ||
    exactScoreMutation.reason === "not-checkpoint"
  ) {
    throw new LearningCompletionError(
      "PROGRESS_UPDATE_FAILED",
      "Không thể lưu điểm checkpoint.",
      409,
    );
  }

  const progress = exactScoreMutation.progress;
  const bestScore = progress.checkpointScores[checkpoint.id] ?? 0;
  const section = getSectionForNode(course, checkpoint.id);
  const nextSection = section
    ? course.sections.find((candidate) => candidate.order === section.order + 1)
    : null;
  const sectionTwoUnlocked = nextSection
    ? progress.unlockedSectionIds.includes(nextSection.id)
    : false;

  return {
    success: true,
    assessmentMode: submission.assessmentMode,
    ...scored,
    bestScore,
    sectionTwoUnlocked,
    newlyUnlockedSectionId: completion.unlockedSectionId ?? null,
    completion: {
      ...completion,
      accuracy: scored.score,
      passed: scored.passed,
      passThreshold: scored.passThreshold,
      progress,
    },
  };
};
