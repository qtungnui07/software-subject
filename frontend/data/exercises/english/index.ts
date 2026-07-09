import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { englishSectionTwoExerciseCatalog } from "@/data/exercises/english/section-2";
import { englishSectionThreeExerciseCatalog } from "@/data/exercises/english/section-3";
import type { Exercise } from "@/types/exercise";

export const englishExerciseCatalog: Record<string, Exercise[]> = {
  ...englishSectionOneExerciseCatalog,
  ...englishSectionTwoExerciseCatalog,
  ...englishSectionThreeExerciseCatalog,
};
