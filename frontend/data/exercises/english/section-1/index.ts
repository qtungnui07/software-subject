import { sectionOneLessonOneExercises } from "@/data/exercises/english/section-1/lesson-1";
import { sectionOneLessonTwoExercises } from "@/data/exercises/english/section-1/lesson-2";
import { sectionOneLessonThreeExercises } from "@/data/exercises/english/section-1/lesson-3";
import { sectionOneLessonFourExercises } from "@/data/exercises/english/section-1/lesson-4";
import { sectionOneLessonFiveExercises } from "@/data/exercises/english/section-1/lesson-5";
import { sectionOneLessonSixExercises } from "@/data/exercises/english/section-1/lesson-6";
import { sectionOneCheckpointExercises } from "@/data/exercises/english/section-1/checkpoint";
import type { Exercise } from "@/types/exercise";

export const englishSectionOneExerciseCatalog: Record<string, Exercise[]> = {
  "lesson-1": sectionOneLessonOneExercises,
  "lesson-2": sectionOneLessonTwoExercises,
  "lesson-3": sectionOneLessonThreeExercises,
  "lesson-4": sectionOneLessonFourExercises,
  "lesson-5": sectionOneLessonFiveExercises,
  "lesson-6": sectionOneLessonSixExercises,
  "chapter-1-test": sectionOneCheckpointExercises,
};
