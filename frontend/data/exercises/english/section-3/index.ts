import { sectionThreeLessonOneExercises } from "@/data/exercises/english/section-3/lesson-1";
import { sectionThreeLessonTwoExercises } from "@/data/exercises/english/section-3/lesson-2";
import { sectionThreeLessonThreeExercises } from "@/data/exercises/english/section-3/lesson-3";
import { sectionThreeLessonFourExercises } from "@/data/exercises/english/section-3/lesson-4";
import { sectionThreeLessonFiveExercises } from "@/data/exercises/english/section-3/lesson-5";
import { sectionThreeCheckpointExercises } from "@/data/exercises/english/section-3/checkpoint";
import type { Exercise } from "@/types/exercise";

export const englishSectionThreeExerciseCatalog: Record<string, Exercise[]> = {
  "en-s3-c1-lesson-1": sectionThreeLessonOneExercises,
  "en-s3-c1-lesson-2": sectionThreeLessonTwoExercises,
  "en-s3-c1-lesson-3": sectionThreeLessonThreeExercises,
  "en-s3-c1-lesson-4": sectionThreeLessonFourExercises,
  "en-s3-c1-lesson-5": sectionThreeLessonFiveExercises,
  "en-s3-c1-checkpoint": sectionThreeCheckpointExercises,
};
