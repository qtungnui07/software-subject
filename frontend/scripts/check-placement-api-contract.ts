import assert from "node:assert/strict";

import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import {
  PlacementApiContractError,
  parsePlacementSubmissionRequest,
  toPlacementGetResponse,
} from "@/lib/placement-test/placement-api-contract";
import { PlacementMemoryResultStore } from "@/lib/placement-test/placement-result-store";
import { gradePlacementSubmission } from "@/lib/placement-test/placement-submission";
import { toPublicPlacementQuestions } from "@/lib/placement-test/placement-public-question";
import type { Exercise, ExerciseAnswer } from "@/types/exercise";
import { ENGLISH_PLACEMENT_TEST_VERSION } from "@/types/placement-test";

const publicQuestions = toPublicPlacementQuestions(englishPlacementQuestions);
const serialized = JSON.stringify(publicQuestions);
for (const secretField of [
  "correctOptionId",
  "correctOrder",
  "acceptedAnswers",
  "explanation",
]) {
  assert.equal(
    serialized.includes(secretField),
    false,
    `Public API payload must not include ${secretField}.`
  );
}

const getCorrectAnswer = (exercise: Exercise): ExerciseAnswer => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return { type: "choice", optionId: exercise.correctOptionId };
    case "arrange_words":
      return { type: "arrange_words", tokenIds: [...exercise.correctOrder] };
    case "fill_blank":
      return { type: "fill_blank", value: exercise.acceptedAnswers[0] ?? "" };
  }
};

const submission = parsePlacementSubmissionRequest({
  submissionId: "1d65a233-9e10-41f4-82ff-d222dad2ae7a",
  testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
  startedAt: "2026-07-09T08:00:00.000Z",
  answers: englishPlacementQuestions.map(({ exercise }) => ({
    questionId: exercise.id,
    answer: getCorrectAnswer(exercise),
  })),
});
assert.equal(submission.answers.length, 12);

assert.throws(
  () =>
    parsePlacementSubmissionRequest({
      submissionId: "1d65a233-9e10-41f4-82ff-d222dad2ae7a",
      testVersion: "english-placement-v0",
      answers: [],
    }),
  (error) =>
    error instanceof PlacementApiContractError && error.status === 409,
  "Old versions must return a conflict contract."
);

assert.throws(
  () =>
    parsePlacementSubmissionRequest({
      submissionId: "not-a-uuid",
      testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
      answers: [],
    }),
  (error) =>
    error instanceof PlacementApiContractError && error.status === 400,
  "Invalid submission IDs must be rejected."
);

const store = new PlacementMemoryResultStore();
const score = gradePlacementSubmission(submission);
const saved = store.saveAttempt({
  userId: "api-user",
  courseId: "english",
  score,
  startedAt: submission.startedAt,
  completedAt: "2026-07-09T08:05:00.000Z",
  submissionId: submission.submissionId,
});
const response = toPlacementGetResponse({
  questions: publicQuestions,
  previousResult: saved,
});
assert.equal(response.questions.length, 12);
assert.equal(response.previousResult?.attemptCount, 1);
assert.equal(
  "scoredAnswers" in (response.previousResult ?? {}),
  false,
  "GET summary must not expose per-question scored answers."
);

console.log(
  "Placement API contract check passed: private answers are stripped, requests are validated, versions conflict safely, and result summaries expose only required fields."
);
