import assert from "node:assert/strict";

import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import { PlacementMemoryResultStore } from "@/lib/placement-test/placement-result-store";
import { gradePlacementSubmission } from "@/lib/placement-test/placement-submission";
import type { Exercise, ExerciseAnswer } from "@/types/exercise";
import { ENGLISH_PLACEMENT_TEST_VERSION } from "@/types/placement-test";

const getAnswer = (exercise: Exercise, correct: boolean): ExerciseAnswer => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice": {
      const optionId = correct
        ? exercise.correctOptionId
        : exercise.options.find(
            (option) => option.id !== exercise.correctOptionId
          )?.id ?? exercise.correctOptionId;
      return { type: "choice", optionId };
    }
    case "arrange_words":
      return {
        type: "arrange_words",
        tokenIds: correct
          ? [...exercise.correctOrder]
          : [...exercise.correctOrder].reverse(),
      };
    case "fill_blank":
      return {
        type: "fill_blank",
        value: correct
          ? exercise.acceptedAnswers[0] ?? ""
          : "incorrect answer",
      };
  }
};

const buildScore = (correct: boolean) =>
  gradePlacementSubmission({
    testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
    answers: englishPlacementQuestions.map((question) => ({
      questionId: question.exercise.id,
      answer: getAnswer(question.exercise, correct),
    })),
  });

const store = new PlacementMemoryResultStore();
const highScore = buildScore(true);
const lowScore = buildScore(false);

const first = store.saveAttempt({
  userId: "user-a",
  courseId: "english",
  score: highScore,
  startedAt: "2026-07-09T08:00:00.000Z",
  completedAt: "2026-07-09T08:06:30.000Z",
  submissionId: "4f4bb70d-49e8-4d45-9d3f-9429abce7810",
});
assert.equal(first.attemptCount, 1, "First attempt must start at 1.");
assert.equal(first.latestAssignedSectionId, "english-section-3");
assert.equal(first.highestAssignedSectionId, "english-section-3");
assert.equal(first.durationSeconds, 390, "Duration must be calculated safely.");

const duplicateFirst = store.saveAttempt({
  userId: "user-a",
  courseId: "english",
  score: highScore,
  completedAt: "2026-07-09T08:07:00.000Z",
  submissionId: "4f4bb70d-49e8-4d45-9d3f-9429abce7810",
});
assert.equal(
  duplicateFirst.attemptCount,
  1,
  "The same submissionId must not increment attemptCount twice."
);

const second = store.saveAttempt({
  userId: "user-a",
  courseId: "english",
  score: lowScore,
  completedAt: "2026-07-09T09:00:00.000Z",
  submissionId: "aa26fe3d-08ce-426f-8d3f-5133954d8e43",
});
assert.equal(second.attemptCount, 2, "Retake must increment attemptCount.");
assert.equal(second.latestAssignedSectionId, "english-section-1");
assert.equal(
  second.highestAssignedSectionId,
  "english-section-3",
  "A lower retake must not reduce the highest assigned section."
);
assert.equal(second.totalCorrect, 0, "Latest result must replace the previous score.");

const otherUser = store.saveAttempt({
  userId: "user-b",
  courseId: "english",
  score: lowScore,
  completedAt: "2026-07-09T09:05:00.000Z",
  submissionId: "fa46a0af-677f-4cd9-a2cc-c924229a97d5",
});
assert.equal(otherUser.attemptCount, 1, "Users must have isolated attempt counts.");
assert.equal(
  store.get("user-a")?.attemptCount,
  2,
  "Saving another user must not overwrite the first user."
);

store.clear();
assert.equal(store.get("user-a"), null, "Memory storage clear must be deterministic.");

console.log(
  "Placement Test storage check passed: first attempt, idempotent retry, retake replacement, highest-level preservation, duration, and user isolation are valid."
);
