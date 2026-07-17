import assert from "node:assert/strict";
import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import type { Exercise, ExerciseContext } from "@/types/exercise";

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const contexts = (exercises: Exercise[], kind: ExerciseContext["kind"]) => {
  const map = new Map<string, ExerciseContext>();
  for (const exercise of exercises) {
    if (exercise.context?.kind === kind) map.set(exercise.context.id, exercise.context);
  }
  return [...map.values()];
};
const baseSeconds: Record<Exercise["type"], number> = {
  multiple_choice: 30,
  dialogue_choice: 35,
  listening_choice: 40,
  arrange_words: 40,
  fill_blank: 30,
  match_pairs: 60,
  arrange_dialogue: 65,
  sentence_rewrite: 50,
  short_writing: 95,
};
const estimate = (exercises: Exercise[]) => {
  let total = exercises.reduce((sum, exercise) => sum + baseSeconds[exercise.type], 0);
  const seen = new Set<string>();
  for (const exercise of exercises) {
    const context = exercise.context;
    if (!context || seen.has(context.id)) continue;
    seen.add(context.id);
    if (context.kind === "reading") total += Math.ceil((countWords(context.text) / 135) * 60);
    if (context.kind === "listening") total += Math.ceil(countWords(context.spokenText ?? "") / 1.75);
    if (context.kind === "scenario") total += 30;
  }
  return total;
};

const lessonFive = englishSectionOneExerciseCatalog["lesson-5"];
const lessonSix = englishSectionOneExerciseCatalog["lesson-6"];
const l5Reading = contexts(lessonFive, "reading")[0];
const l6Reading = contexts(lessonSix, "reading")[0];
const l5Listening = contexts(lessonFive, "listening")[0];
const l6Listening = contexts(lessonSix, "listening")[0];
assert.ok(l5Reading?.kind === "reading" && l6Reading?.kind === "reading");
assert.ok(l5Listening?.kind === "listening" && l6Listening?.kind === "listening");
const l5ReadingWords = countWords(l5Reading.text);
const l6ReadingWords = countWords(l6Reading.text);
assert.ok(l5ReadingWords >= 85 && l5ReadingWords <= 100);
assert.ok(l6ReadingWords >= 95 && l6ReadingWords <= 110);
assert.ok(countWords(l5Listening.spokenText ?? "") >= 75 && countWords(l5Listening.spokenText ?? "") <= 95);
assert.ok(countWords(l6Listening.spokenText ?? "") >= 85 && countWords(l6Listening.spokenText ?? "") <= 105);
assert.ok(l5Listening.transcriptAfterSubmit && l6Listening.transcriptAfterSubmit);
assert.ok([...lessonFive, ...lessonSix].every((exercise) => exercise.difficulty === 2));

const combined = JSON.stringify([...lessonFive, ...lessonSix]).toLowerCase();
for (const term of ["present perfect", "reported speech", "passive voice", "third conditional", "relative clause", "wish clause"]) {
  assert.ok(!combined.includes(term));
}
assert.match(combined, /going to/);

const l5Writing = lessonFive.find((exercise) => exercise.type === "short_writing");
const l6Writing = lessonSix.find((exercise) => exercise.type === "short_writing");
assert.ok(l5Writing?.type === "short_writing" && l6Writing?.type === "short_writing");
assert.deepEqual([l5Writing.minWords, l5Writing.maxWords], [30, 45]);
assert.deepEqual([l6Writing.minWords, l6Writing.maxWords], [40, 60]);
assert.equal(l5Writing.requiredContentGroups?.length, 4);
assert.equal(l6Writing.requiredContentGroups?.length, 5);

const l5Seconds = estimate(lessonFive);
const l6Seconds = estimate(lessonSix);
assert.ok(l5Seconds >= 8 * 60 && l5Seconds <= 10 * 60);
assert.ok(l6Seconds >= 9 * 60 && l6Seconds <= 11 * 60);
assert.ok(l6ReadingWords > l5ReadingWords && l6Writing.minWords > l5Writing.minWords);

console.log(
  `Section 1 V2 A2 level check passed: Lesson 5 estimates ${Math.ceil(l5Seconds / 60)} minutes and Lesson 6 estimates ${Math.ceil(l6Seconds / 60)} minutes with suitable reading, listening and writing ranges.`,
);
