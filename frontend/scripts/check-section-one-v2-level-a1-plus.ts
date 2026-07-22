import assert from "node:assert/strict";

import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import type { Exercise, ExerciseContext } from "@/types/exercise";

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const getUniqueContexts = (exercises: Exercise[], kind: ExerciseContext["kind"]) => {
  const contexts = new Map<string, ExerciseContext>();
  for (const exercise of exercises) {
    if (exercise.context?.kind === kind) {
      contexts.set(exercise.context.id, exercise.context);
    }
  }
  return [...contexts.values()];
};

const BASE_SECONDS: Record<Exercise["type"], number> = {
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
      total += Math.ceil((countWords(context.text) / 135) * 60);
    }
    if (context.kind === "listening") {
      total += Math.ceil(countWords(context.spokenText ?? "") / 1.75);
    }
  }

  return total;
};

const lessonThree = englishSectionOneExerciseCatalog["lesson-3"];
const lessonFour = englishSectionOneExerciseCatalog["lesson-4"];
const lessonThreeReading = getUniqueContexts(lessonThree, "reading");
const lessonFourReading = getUniqueContexts(lessonFour, "reading");
const lessonThreeListening = getUniqueContexts(lessonThree, "listening");
const lessonFourListening = getUniqueContexts(lessonFour, "listening");

assert.equal(lessonThreeReading.length, 1);
assert.equal(lessonFourReading.length, 1);
assert.equal(lessonThreeListening.length, 1);
assert.equal(lessonFourListening.length, 1);

const menuWordCount = countWords(
  lessonThreeReading[0].kind === "reading" ? lessonThreeReading[0].text : "",
);
const townWordCount = countWords(
  lessonFourReading[0].kind === "reading" ? lessonFourReading[0].text : "",
);
assert.ok(
  menuWordCount >= 50 && menuWordCount <= 75,
  `Lesson 3 menu context must stay within 50-75 words, received ${menuWordCount}.`,
);
assert.ok(
  townWordCount >= 70 && townWordCount <= 95,
  `Lesson 4 town reading must stay within 70-95 words, received ${townWordCount}.`,
);

const caféListeningWords = countWords(
  lessonThreeListening[0].kind === "listening"
    ? (lessonThreeListening[0].spokenText ?? "")
    : "",
);
const directionsListeningWords = countWords(
  lessonFourListening[0].kind === "listening"
    ? (lessonFourListening[0].spokenText ?? "")
    : "",
);
assert.ok(caféListeningWords >= 60 && caféListeningWords <= 85);
assert.ok(directionsListeningWords >= 70 && directionsListeningWords <= 95);
assert.ok(
  lessonThreeListening[0].kind === "listening" &&
    lessonThreeListening[0].transcriptAfterSubmit,
  "Lesson 3 must reveal a transcript only through the existing post-submit policy.",
);
assert.ok(
  lessonFourListening[0].kind === "listening" &&
    lessonFourListening[0].transcriptAfterSubmit,
  "Lesson 4 must reveal a transcript only through the existing post-submit policy.",
);

for (const exercise of [...lessonThree, ...lessonFour]) {
  assert.ok(
    exercise.difficulty === 1 || exercise.difficulty === 2,
    `${exercise.id} must stay within A1+ difficulty.`,
  );
}

const blockedAdvancedTerms = [
  "present perfect",
  "reported speech",
  "passive voice",
  "third conditional",
  "relative clause",
  "wish clause",
];
const combinedContent = JSON.stringify([...lessonThree, ...lessonFour]).toLowerCase();
for (const term of blockedAdvancedTerms) {
  assert.ok(!combinedContent.includes(term), `A1+ lessons must not teach ${term}.`);
}

const lessonThreeWriting = lessonThree.find(
  (exercise) => exercise.type === "short_writing",
);
const lessonFourWriting = lessonFour.find(
  (exercise) => exercise.type === "short_writing",
);
assert.ok(lessonThreeWriting?.type === "short_writing");
assert.ok(lessonFourWriting?.type === "short_writing");
assert.deepEqual(
  [lessonThreeWriting.minWords, lessonThreeWriting.maxWords],
  [18, 30],
);
assert.deepEqual(
  [lessonFourWriting.minWords, lessonFourWriting.maxWords],
  [25, 40],
);
assert.deepEqual(lessonFourWriting.requiredPhraseOrder, [
  "go straight",
  "walk past",
  "turn right",
]);

const lessonThreeSeconds = estimateLessonSeconds(lessonThree);
const lessonFourSeconds = estimateLessonSeconds(lessonFour);
assert.ok(
  lessonThreeSeconds >= 420 && lessonThreeSeconds <= 600,
  `Lesson 3 should estimate 7-10 minutes, received ${lessonThreeSeconds} seconds.`,
);
assert.ok(
  lessonFourSeconds >= 480 && lessonFourSeconds <= 600,
  `Lesson 4 should estimate 8-10 minutes, received ${lessonFourSeconds} seconds.`,
);

console.log(
  `Section 1 V2 A1+ level check passed: Lesson 3 estimates ${Math.ceil(lessonThreeSeconds / 60)} minutes and Lesson 4 estimates ${Math.ceil(lessonFourSeconds / 60)} minutes with suitable reading, listening and writing ranges.`,
);
