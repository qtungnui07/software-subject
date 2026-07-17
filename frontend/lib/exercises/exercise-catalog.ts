import { englishExerciseCatalog } from "@/data/exercises/english";
import type { Exercise } from "@/types/exercise";

export const dedicatedExerciseCatalog: Record<string, Exercise[]> =
  englishExerciseCatalog;

export const hasDedicatedExerciseSet = (lessonId: string) =>
  Object.hasOwn(dedicatedExerciseCatalog, lessonId);

export const getExercisesForLesson = (lessonId: string): Exercise[] => {
  const exercises = dedicatedExerciseCatalog[lessonId];

  if (exercises) return exercises;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[exercise-catalog] Missing dedicated exercise set for ${lessonId}.`
    );
  }

  return [];
};

export const getExerciseById = (lessonId: string, exerciseId: string) =>
  getExercisesForLesson(lessonId).find((exercise) => exercise.id === exerciseId) ??
  null;
