import "server-only";

import {
  SECTION_ONE_CHECKPOINT_ID,
  SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
  sectionOneCheckpointAssessments,
  sectionOneCheckpointExercises,
} from "@/data/exercises/english/section-1/checkpoint";
import { canAttemptCheckpoint } from "@/lib/courses/course-unlock-policy";
import { scoreCheckpointSubmission } from "@/lib/checkpoints/checkpoint-scoring";
import {
  getCourseProgressForUser,
  recordCheckpointScoreForUser,
} from "@/services/course-progress-service";
import {
  completeLearningNodeForUser,
  LearningCompletionError,
} from "@/services/learning-completion-service";
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
  if (submission.checkpointId !== SECTION_ONE_CHECKPOINT_ID) {
    throw new CheckpointSubmissionError(
      "INVALID_CHECKPOINT",
      "Checkpoint không hợp lệ.",
      404,
    );
  }

  if (!Array.isArray(submission.answers)) {
    throw new CheckpointSubmissionError(
      "INVALID_SUBMISSION",
      "Danh sách đáp án không hợp lệ.",
      400,
    );
  }

  const knownIds = new Set(
    sectionOneCheckpointExercises.map((exercise) => exercise.id),
  );
  const submittedIds = submission.answers.map((entry) => entry.exerciseId);
  const uniqueIds = new Set(submittedIds);

  if (uniqueIds.size !== submittedIds.length) {
    throw new CheckpointSubmissionError(
      "INVALID_SUBMISSION",
      "Mỗi câu hỏi chỉ được gửi một đáp án.",
      400,
    );
  }

  if (submittedIds.some((exerciseId) => !knownIds.has(exerciseId))) {
    throw new CheckpointSubmissionError(
      "INVALID_SUBMISSION",
      "Submission chứa câu hỏi không thuộc checkpoint.",
      400,
    );
  }
};

const getGateAccuracy = (score: number, passed: boolean) => {
  if (passed) {
    return Math.max(
      SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
      Math.floor(score),
    );
  }

  return Math.min(
    SECTION_ONE_CHECKPOINT_PASS_THRESHOLD - 1,
    Math.floor(score),
  );
};

export const submitSectionOneCheckpointForUser = async ({
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

  const progressBefore = await getCourseProgressForUser(userId, "english");
  if (!canAttemptCheckpoint(progressBefore, SECTION_ONE_CHECKPOINT_ID)) {
    throw new CheckpointSubmissionError(
      "LOCKED_CHECKPOINT",
      "Bạn cần hoàn thành đủ sáu lesson trước khi làm checkpoint.",
      403,
    );
  }

  const scored = scoreCheckpointSubmission({
    checkpointId: SECTION_ONE_CHECKPOINT_ID,
    exercises: sectionOneCheckpointExercises,
    assessments: sectionOneCheckpointAssessments,
    answers: submission.answers,
    passThreshold: SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
  });

  const completion = await completeLearningNodeForUser({
    userId,
    userName,
    userImageSrc,
    nodeId: SECTION_ONE_CHECKPOINT_ID,
    accuracy: getGateAccuracy(scored.score, scored.passed),
    durationSeconds: submission.durationSeconds,
    afkCount: submission.afkCount,
    idempotencyKey: submission.idempotencyKey,
  });

  const exactScoreMutation = await recordCheckpointScoreForUser(
    userId,
    SECTION_ONE_CHECKPOINT_ID,
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
  const bestScore = progress.checkpointScores[SECTION_ONE_CHECKPOINT_ID] ?? 0;
  const sectionTwoUnlocked = progress.unlockedSectionIds.includes(
    "english-section-2",
  );

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
      passThreshold: SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
      progress,
    },
  };
};
