import type { Exercise } from "@/types/exercise";
import type {
  ExerciseAttemptResult,
  LessonScoreSummary,
} from "@/types/lesson-session";

export const buildLessonScoreSummary = (
  exercises: readonly Exercise[],
  attemptsByExerciseId: Readonly<Record<string, ExerciseAttemptResult>>,
): LessonScoreSummary => {
  const scores = exercises.map(
    (exercise) => attemptsByExerciseId[exercise.id]?.bestScoreRatio ?? 0,
  );
  const totalScoreRatio = scores.reduce((total, score) => total + score, 0);
  const totalExercises = exercises.length;
  const accuracy =
    totalExercises === 0
      ? 0
      : Math.round((totalScoreRatio / totalExercises) * 100);

  return {
    totalExercises,
    totalScoreRatio,
    accuracy,
    correctCount: scores.filter((score) => score >= 1).length,
    partialCount: scores.filter((score) => score > 0 && score < 1).length,
    incorrectCount: scores.filter((score) => score <= 0).length,
    perfectFirstTry:
      totalExercises > 0 &&
      exercises.every((exercise) => {
        const attempt = attemptsByExerciseId[exercise.id];
        return attempt?.attempts === 1 && attempt.firstScoreRatio === 1;
      }),
  };
};
