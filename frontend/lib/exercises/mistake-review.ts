import type { Exercise } from "@/types/exercise";
import type { ExerciseAttemptResult } from "@/types/lesson-session";

export const createMistakeReviewQueue = (
  exercises: readonly Exercise[],
  attemptsByExerciseId: Readonly<Record<string, ExerciseAttemptResult>>,
  limit = 3,
) =>
  exercises
    .filter(
      (exercise) =>
        (attemptsByExerciseId[exercise.id]?.bestScoreRatio ?? 0) < 1,
    )
    .sort((left, right) => {
      const leftScore = attemptsByExerciseId[left.id]?.bestScoreRatio ?? 0;
      const rightScore = attemptsByExerciseId[right.id]?.bestScoreRatio ?? 0;
      return leftScore - rightScore;
    })
    .slice(0, Math.max(0, limit))
    .map((exercise) => exercise.id);

export const getCorrectMatchPairLeftIds = (
  exercise: Extract<Exercise, { type: "match_pairs" }>,
  submittedPairs: { leftId: string; rightId: string }[],
) => {
  const submittedByLeftId = new Map(
    submittedPairs.map((pair) => [pair.leftId, pair.rightId]),
  );

  return exercise.correctPairs
    .filter((pair) => submittedByLeftId.get(pair.leftId) === pair.rightId)
    .map((pair) => pair.leftId);
};
