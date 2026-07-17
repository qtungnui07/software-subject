import { getExerciseResultStatus } from "@/lib/exercises/exercise-result-status";
import type { ExerciseCheckResult } from "@/types/exercise";
import type { ExerciseAttemptResult } from "@/types/lesson-session";

export const recordExerciseAttempt = ({
  exerciseId,
  previous,
  result,
  lostHeart,
}: {
  exerciseId: string;
  previous?: ExerciseAttemptResult;
  result: ExerciseCheckResult;
  lostHeart: boolean;
}): ExerciseAttemptResult => {
  const attempts = (previous?.attempts ?? 0) + 1;
  const firstScoreRatio = previous?.firstScoreRatio ?? result.scoreRatio;
  const bestScoreRatio = Math.max(
    previous?.bestScoreRatio ?? 0,
    result.scoreRatio,
  );

  return {
    exerciseId,
    attempts,
    firstScoreRatio,
    bestScoreRatio,
    finalScoreRatio: result.scoreRatio,
    status: getExerciseResultStatus(bestScoreRatio),
    lostHeart: previous?.lostHeart === true || lostHeart,
  };
};

export const canRetryExerciseAttempt = (
  attempt: ExerciseAttemptResult | undefined,
  result: ExerciseCheckResult | null,
  maxAttempts = 2,
) =>
  Boolean(
    result && !result.isCorrect && (attempt?.attempts ?? 0) < maxAttempts,
  );
