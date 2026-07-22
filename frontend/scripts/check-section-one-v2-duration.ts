import assert from "node:assert/strict";

import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import type { Exercise } from "@/types/exercise";

const BASE_SECONDS: Record<Exercise["type"], number> = {
  multiple_choice: 30,
  dialogue_choice: 35,
  listening_choice: 35,
  arrange_words: 40,
  fill_blank: 30,
  match_pairs: 60,
  arrange_dialogue: 60,
  sentence_rewrite: 50,
  short_writing: 90,
};

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const estimateLessonSeconds = (exercises: Exercise[]) => {
  let total = exercises.reduce(
    (seconds, exercise) => seconds + BASE_SECONDS[exercise.type],
    0,
  );
  const countedContexts = new Set<string>();

  for (const exercise of exercises) {
    const context = exercise.context;
    if (!context || countedContexts.has(context.id)) continue;
    countedContexts.add(context.id);

    if (context.kind === "reading") {
      total += Math.ceil((countWords(context.text) / 150) * 60);
    }
    if (context.kind === "listening") {
      const spokenWords = countWords(context.spokenText ?? "");
      total += Math.ceil(spokenWords / 1.9);
    }
  }

  return total;
};

const lessonOneSeconds = estimateLessonSeconds(
  englishSectionOneExerciseCatalog["lesson-1"],
);
const lessonTwoSeconds = estimateLessonSeconds(
  englishSectionOneExerciseCatalog["lesson-2"],
);

assert.ok(
  lessonOneSeconds >= 360,
  `Lesson 1 must estimate at least six minutes, received ${lessonOneSeconds} seconds.`,
);
assert.ok(
  lessonTwoSeconds >= 360,
  `Lesson 2 must estimate at least six minutes, received ${lessonTwoSeconds} seconds.`,
);
assert.ok(
  lessonOneSeconds <= 600 && lessonTwoSeconds <= 600,
  "The first two A1 lessons should remain convenient and stay below ten estimated minutes.",
);

console.log(
  `Section 1 V2 duration check passed: Lesson 1 estimates ${Math.ceil(lessonOneSeconds / 60)} minutes and Lesson 2 estimates ${Math.ceil(lessonTwoSeconds / 60)} minutes without artificial waiting.`,
);
