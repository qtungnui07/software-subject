import assert from "node:assert/strict";

import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { checkExerciseAnswer } from "@/lib/exercises/check-exercise-answer";
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

const lessonOne = englishSectionOneExerciseCatalog["lesson-1"];
const lessonTwo = englishSectionOneExerciseCatalog["lesson-2"];

const lessonOneReadings = getUniqueContexts(lessonOne, "reading");
const lessonTwoReadings = getUniqueContexts(lessonTwo, "reading");
const lessonOneListening = getUniqueContexts(lessonOne, "listening");
const lessonTwoListening = getUniqueContexts(lessonTwo, "listening");

assert.equal(lessonOneReadings.length, 1);
assert.equal(lessonTwoReadings.length, 1);
assert.equal(lessonOneListening.length, 1);
assert.equal(lessonTwoListening.length, 1);

const lessonOneReadingWords = countWords(
  lessonOneReadings[0].kind === "reading" ? lessonOneReadings[0].text : "",
);
const lessonTwoReadingWords = countWords(
  lessonTwoReadings[0].kind === "reading" ? lessonTwoReadings[0].text : "",
);
assert.ok(
  lessonOneReadingWords >= 50 && lessonOneReadingWords <= 70,
  `Lesson 1 reading must stay within 50-70 words, received ${lessonOneReadingWords}.`,
);
assert.ok(
  lessonTwoReadingWords >= 60 && lessonTwoReadingWords <= 85,
  `Lesson 2 reading must stay within 60-85 words, received ${lessonTwoReadingWords}.`,
);

const lessonOneListeningWords = countWords(
  lessonOneListening[0].kind === "listening"
    ? (lessonOneListening[0].spokenText ?? "")
    : "",
);
const lessonTwoListeningWords = countWords(
  lessonTwoListening[0].kind === "listening"
    ? (lessonTwoListening[0].spokenText ?? "")
    : "",
);
assert.ok(lessonOneListeningWords >= 45 && lessonOneListeningWords <= 65);
assert.ok(lessonTwoListeningWords >= 55 && lessonTwoListeningWords <= 80);
assert.ok(
  lessonOneListening[0].kind === "listening" &&
    lessonOneListening[0].transcriptAfterSubmit,
  "Lesson 1 listening must provide a transcript after completion.",
);
assert.ok(
  lessonTwoListening[0].kind === "listening" &&
    lessonTwoListening[0].transcriptAfterSubmit,
  "Lesson 2 listening must provide a transcript after completion.",
);

for (const exercise of [...lessonOne, ...lessonTwo]) {
  assert.notEqual(exercise.difficulty, 3, "Phase 4 lessons must not exceed A1 scope.");
}

const blockedAdvancedTerms = [
  "present perfect",
  "reported speech",
  "passive voice",
  "third conditional",
  "relative clause",
];
const combinedContent = JSON.stringify([...lessonOne, ...lessonTwo]).toLowerCase();
for (const term of blockedAdvancedTerms) {
  assert.ok(!combinedContent.includes(term), `A1 lessons must not teach ${term}.`);
}

const lessonOneWriting = lessonOne.find(
  (exercise) => exercise.type === "short_writing",
);
const lessonTwoWriting = lessonTwo.find(
  (exercise) => exercise.type === "short_writing",
);
assert.ok(lessonOneWriting?.type === "short_writing");
assert.ok(lessonTwoWriting?.type === "short_writing");
assert.deepEqual(
  [lessonOneWriting.minWords, lessonOneWriting.maxWords],
  [15, 25],
);
assert.deepEqual(
  [lessonTwoWriting.minWords, lessonTwoWriting.maxWords],
  [20, 30],
);

const slightlyLongAnswer =
  "My name is Minh. I am from Vietnam and live in Hanoi. I like music, football, English, films, and meeting new classmates at school every day.";
const slightlyLongResult = checkExerciseAnswer(lessonOneWriting, {
  type: "short_writing",
  value: slightlyLongAnswer,
});
assert.equal(
  slightlyLongResult.feedbackCriteria?.find(
    (criterion) => criterion.id === "word-count",
  )?.passed,
  true,
  "A writing answer up to the 20% soft limit should still pass the length criterion.",
);

console.log(
  "Section 1 V2 A1 level check passed: reading, listening, grammar difficulty, writing ranges, transcript policy, and soft word-limit handling stay within the agreed A1 scope.",
);
