import assert from "node:assert/strict";

import { sectionOneV2PreviewExercises } from "@/data/exercises/english/section-1/section-one-v2-preview";
import { checkExerciseAnswer } from "@/lib/exercises/check-exercise-answer";
import { recordExerciseAttempt } from "@/lib/exercises/exercise-attempt";
import { buildLessonScoreSummary } from "@/lib/exercises/lesson-score-summary";
import type { ExerciseAttemptResult } from "@/types/lesson-session";

const matchExercise = sectionOneV2PreviewExercises.find(
  (exercise) => exercise.type === "match_pairs",
);
assert(matchExercise?.type === "match_pairs");

const twoCorrectPairs = [
  matchExercise.correctPairs[0],
  matchExercise.correctPairs[1],
  {
    leftId: matchExercise.correctPairs[2].leftId,
    rightId: matchExercise.correctPairs[0].rightId,
  },
];
const partialMatchResult = checkExerciseAnswer(matchExercise, {
  type: "match_pairs",
  pairs: twoCorrectPairs,
});
assert.equal(Number(partialMatchResult.scoreRatio.toFixed(4)), 0.6667);
assert.equal(partialMatchResult.isCorrect, false);

const writingExercise = sectionOneV2PreviewExercises.find(
  (exercise) => exercise.type === "short_writing",
);
assert(writingExercise?.type === "short_writing");
const partialWritingResult = checkExerciseAnswer(writingExercise, {
  type: "short_writing",
  value: "Saturday afternoon café.",
});
assert(partialWritingResult.scoreRatio > 0);
assert.equal(partialWritingResult.isCorrect, false);

const rewriteExercise = sectionOneV2PreviewExercises.find(
  (exercise) => exercise.type === "sentence_rewrite",
);
assert(rewriteExercise?.type === "sentence_rewrite");
const contractionResult = checkExerciseAnswer(rewriteExercise, {
  type: "sentence_rewrite",
  value: "Because it's raining, we're staying home.",
});
assert.equal(contractionResult.isCorrect, true);

const firstAttempt = recordExerciseAttempt({
  exerciseId: matchExercise.id,
  result: partialMatchResult,
  lostHeart: false,
});
const secondAttempt = recordExerciseAttempt({
  exerciseId: matchExercise.id,
  previous: firstAttempt,
  result: checkExerciseAnswer(matchExercise, {
    type: "match_pairs",
    pairs: matchExercise.correctPairs,
  }),
  lostHeart: false,
});
assert.equal(secondAttempt.attempts, 2);
assert.equal(secondAttempt.firstScoreRatio, partialMatchResult.scoreRatio);
assert.equal(secondAttempt.bestScoreRatio, 1);
assert.equal(secondAttempt.status, "correct");

const attempts: Record<string, ExerciseAttemptResult> = {
  [matchExercise.id]: secondAttempt,
  [writingExercise.id]: recordExerciseAttempt({
    exerciseId: writingExercise.id,
    result: partialWritingResult,
    lostHeart: false,
  }),
};
const summary = buildLessonScoreSummary(
  [matchExercise, writingExercise],
  attempts,
);
assert.equal(summary.correctCount, 1);
assert.equal(summary.partialCount, 1);
assert.equal(summary.incorrectCount, 0);
assert(summary.accuracy > 50 && summary.accuracy < 100);

console.log(
  "Section 1 V2 scoring check passed: partial ratios, contraction-safe rewrites, two-attempt best scores, and lesson accuracy are valid.",
);
