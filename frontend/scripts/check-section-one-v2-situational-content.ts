import assert from "node:assert/strict";

import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { checkExerciseAnswer } from "@/lib/exercises/check-exercise-answer";
import type { Exercise } from "@/types/exercise";

const getExercise = <Type extends Exercise["type"]>(
  lessonId: "lesson-3" | "lesson-4",
  exerciseId: string,
  type: Type,
) => {
  const exercise = englishSectionOneExerciseCatalog[lessonId].find(
    (item) => item.id === exerciseId,
  );
  assert.ok(exercise, `${exerciseId} must exist.`);
  assert.equal(exercise.type, type, `${exerciseId} must be ${type}.`);
  return exercise as Extract<Exercise, { type: Type }>;
};

const caféTotal = getExercise("lesson-3", "lesson-3-exercise-4", "multiple_choice");
const caféTotalCorrectOption = caféTotal.options.find(
  (option) => option.id === caféTotal.correctOptionId,
);
assert.equal(caféTotalCorrectOption?.text, "£5.00");
assert.match(caféTotal.context?.kind === "reading" ? caféTotal.context.text : "", /tea £2\.00/i);
assert.match(caféTotal.context?.kind === "reading" ? caféTotal.context.text : "", /chocolate cake £3\.00/i);

const budgetExercise = getExercise("lesson-3", "lesson-3-exercise-5", "fill_blank");
const budgetResult = checkExerciseAnswer(budgetExercise, {
  type: "fill_blank",
  value: "tea",
});
assert.equal(budgetResult.isCorrect, true, "£2.00 tea plus £1.50 water must fit a £4 budget.");

for (const lessonId of ["lesson-3", "lesson-4"] as const) {
  const arrangeExercise = englishSectionOneExerciseCatalog[lessonId].find(
    (exercise) => exercise.type === "arrange_dialogue",
  );
  assert.ok(arrangeExercise?.type === "arrange_dialogue");
  assert.equal(
    arrangeExercise.lines.length - arrangeExercise.correctOrder.length,
    1,
    `${lessonId} must use exactly one distractor.`,
  );
}

const directionsReading = getExercise(
  "lesson-4",
  "lesson-4-exercise-6",
  "multiple_choice",
);
const routeText =
  directionsReading.context?.kind === "reading"
    ? directionsReading.context.text.toLowerCase()
    : "";
assert.match(
  routeText,
  /from the station, go straight and walk past the bank\. turn right at the supermarket/i,
);
assert.match(routeText, /library is next to/i);

const directionsWriting = getExercise(
  "lesson-4",
  "lesson-4-exercise-9",
  "short_writing",
);
const correctRoute = checkExerciseAnswer(directionsWriting, {
  type: "short_writing",
  value:
    "Go straight along Green Street. Walk past the bank and turn right at the supermarket. The library is next to the café on your left.",
});
assert.equal(correctRoute.isCorrect, true);
assert.equal(
  correctRoute.feedbackCriteria?.find((criterion) => criterion.id === "phrase-order")
    ?.passed,
  true,
);

const wrongRouteOrder = checkExerciseAnswer(directionsWriting, {
  type: "short_writing",
  value:
    "Turn right at the supermarket. Go straight along Green Street. Walk past the bank. The library is next to the café on your left.",
});
assert.ok(
  wrongRouteOrder.scoreRatio > 0 && wrongRouteOrder.scoreRatio < 1,
  "A route with useful language but the wrong order must receive partial credit.",
);
assert.equal(
  wrongRouteOrder.feedbackCriteria?.find(
    (criterion) => criterion.id === "phrase-order",
  )?.passed,
  false,
);

for (const exercise of [
  ...englishSectionOneExerciseCatalog["lesson-3"],
  ...englishSectionOneExerciseCatalog["lesson-4"],
]) {
  if (!exercise.hint) continue;
  const answerText =
    exercise.type === "multiple_choice" ||
    exercise.type === "dialogue_choice" ||
    exercise.type === "listening_choice"
      ? exercise.options.find((option) => option.id === exercise.correctOptionId)?.text
      : exercise.type === "fill_blank"
        ? exercise.acceptedAnswers[0]
        : "";
  if (answerText && answerText.length >= 4) {
    assert.ok(
      !exercise.hint.toLowerCase().includes(answerText.toLowerCase()),
      `${exercise.id} hint must not reveal the complete answer.`,
    );
  }
}

console.log(
  "Section 1 V2 situational content check passed: café prices and totals are consistent, each lesson has one distractor, directions follow one clear route, and wrong route order receives partial credit without answer-leaking hints.",
);
