import type { Exercise } from "@/types/exercise";

export const createExerciseCatalogFingerprint = (exercises: Exercise[]) =>
  exercises
    .map(
      (exercise) =>
        `${exercise.id}:${exercise.type}:${exercise.contentVersion ?? 1}`,
    )
    .join("|");
