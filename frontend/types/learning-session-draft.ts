import type { ExerciseAnswer } from "@/types/exercise";
import type { ExerciseAttemptResult } from "@/types/lesson-session";

export type AssessmentMode = "standard" | "silent";
export type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

export type LearningSessionDraftBase = {
  schemaVersion: 1;
  userId: string;
  contentId: string;
  contentVersion: number;
  catalogFingerprint: string;
  savedAt: string;
  assessmentMode: AssessmentMode;
  durationSeconds: number;
  afkCount: number;
};

export type LessonSessionDraft = LearningSessionDraftBase & {
  kind: "lesson";
  currentExerciseIndex: number;
  currentAnswer: ExerciseAnswer | null;
  attemptResults: Record<string, ExerciseAttemptResult>;
  hearts: number;
  isRetryAttempt: boolean;
  lockedMatchPairLeftIds: string[];
  isReviewMode: boolean;
  reviewExerciseIds: string[];
  reviewExerciseIndex: number;
  reviewResults: Record<string, { exerciseId: string; recovered: boolean }>;
};

export type CheckpointSessionDraft = LearningSessionDraftBase & {
  kind: "checkpoint";
  currentExerciseIndex: number;
  answers: Record<string, ExerciseAnswer>;
  submissionId: string;
};

export type LearningSessionDraft = LessonSessionDraft | CheckpointSessionDraft;
