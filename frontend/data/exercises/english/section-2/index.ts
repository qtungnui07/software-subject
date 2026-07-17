import { sectionTwoLessonOneExercises } from "@/data/exercises/english/section-2/lesson-1";
import { sectionTwoLessonTwoExercises } from "@/data/exercises/english/section-2/lesson-2";
import { sectionTwoLessonThreeExercises } from "@/data/exercises/english/section-2/lesson-3";
import { sectionTwoLessonFourExercises } from "@/data/exercises/english/section-2/lesson-4";
import { sectionTwoLessonFiveExercises } from "@/data/exercises/english/section-2/lesson-5";
import { sectionTwoCheckpointExercises } from "@/data/exercises/english/section-2/checkpoint";
import type { Exercise } from "@/types/exercise";

export const englishSectionTwoExerciseCatalog: Record<string, Exercise[]> = {
  "en-s2-c1-lesson-1": sectionTwoLessonOneExercises,
  "en-s2-c1-lesson-2": sectionTwoLessonTwoExercises,
  "en-s2-c1-lesson-3": sectionTwoLessonThreeExercises,
  "en-s2-c1-lesson-4": sectionTwoLessonFourExercises,
  "en-s2-c1-lesson-5": sectionTwoLessonFiveExercises,
  "en-s2-c1-checkpoint": sectionTwoCheckpointExercises,
};
