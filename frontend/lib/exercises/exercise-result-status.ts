import type { ExerciseResultStatus } from "@/types/lesson-session";

export const getExerciseResultStatus = (
  scoreRatio: number,
): ExerciseResultStatus => {
  if (scoreRatio >= 1) return "correct";
  if (scoreRatio > 0) return "partial";
  return "incorrect";
};
