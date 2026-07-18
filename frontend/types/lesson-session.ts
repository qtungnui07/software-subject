import type { ExerciseCheckResult } from "@/types/exercise";

export type ExerciseResultStatus = "correct" | "partial" | "incorrect";

export type ExerciseAttemptResult = {
  exerciseId: string;
  attempts: number;
  firstScoreRatio: number;
  bestScoreRatio: number;
  finalScoreRatio: number;
  status: ExerciseResultStatus;
  lostHeart: boolean;
};

export type LessonScoreSummary = {
  totalExercises: number;
  totalScoreRatio: number;
  accuracy: number;
  correctCount: number;
  partialCount: number;
  incorrectCount: number;
  perfectFirstTry: boolean;
};

export type MistakeReviewResult = {
  exerciseId: string;
  result: ExerciseCheckResult;
  recovered: boolean;
};
