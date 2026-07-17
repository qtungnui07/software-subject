import assert from "node:assert/strict";

import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import { dedicatedExerciseCatalog } from "@/lib/exercises/exercise-catalog";
import { toPublicPlacementQuestions } from "@/lib/placement-test/placement-public-question";
import {
  gradePlacementSubmission,
  PlacementSubmissionError,
} from "@/lib/placement-test/placement-submission";
import { validatePlacementQuestions } from "@/lib/placement-test/placement-validator";
import type { Exercise, ExerciseAnswer } from "@/types/exercise";
import {
  ENGLISH_PLACEMENT_TEST_VERSION,
  type PlacementTestSubmission,
} from "@/types/placement-test";

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

const getWrongAnswer = (exercise: Exercise): ExerciseAnswer => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return {
        type: "choice",
        optionId:
          exercise.options.find(
            (option) => option.id !== exercise.correctOptionId
          )?.id ?? exercise.correctOptionId,
      };
    case "arrange_words":
      return {
        type: "arrange_words",
        tokenIds: [...exercise.correctOrder].reverse(),
      };
    case "fill_blank":
      return { type: "fill_blank", value: "definitely incorrect" };
  }
};

const buildSubmission = (correctOrders: number[]): PlacementTestSubmission => {
  const correctOrderSet = new Set(correctOrders);

  return {
    testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
    answers: englishPlacementQuestions.map((question) => ({
      questionId: question.exercise.id,
      answer: correctOrderSet.has(question.order)
        ? getCorrectAnswer(question.exercise)
        : getWrongAnswer(question.exercise),
    })),
  };
};

const allCourseExercises = Object.values(dedicatedExerciseCatalog).flat();
const definitionIssues = validatePlacementQuestions(
  englishPlacementQuestions,
  allCourseExercises
);
assert.deepEqual(
  definitionIssues,
  [],
  definitionIssues.map((issue) => `${issue.field}: ${issue.message}`).join("\n")
);

const publicQuestions = toPublicPlacementQuestions(englishPlacementQuestions);
const serializedPublicQuestions = JSON.stringify(publicQuestions);
for (const secretKey of [
  "correctOptionId",
  "correctOrder",
  "acceptedAnswers",
  "explanation",
]) {
  assert.equal(
    serializedPublicQuestions.includes(secretKey),
    false,
    `Public placement questions leak ${secretKey}.`
  );
}

const cases = [
  {
    label: "0/12",
    correct: [],
    expected: "english-section-1",
  },
  {
    label: "4/12 basic only",
    correct: [1, 2, 3, 4],
    expected: "english-section-1",
  },
  {
    label: "5/12 with Section 2 gates",
    correct: [1, 2, 5, 6, 9],
    expected: "english-section-2",
  },
  {
    label: "8/12",
    correct: [1, 2, 3, 4, 5, 6, 7, 8],
    expected: "english-section-2",
  },
  {
    label: "9/12 but advanced gate fails",
    correct: [1, 2, 3, 4, 5, 6, 7, 9, 10],
    expected: "english-section-2",
  },
  {
    label: "9/12 with all Section 3 gates",
    correct: [1, 2, 3, 5, 6, 7, 9, 10, 11],
    expected: "english-section-3",
  },
  {
    label: "12/12",
    correct: Array.from({ length: 12 }, (_, index) => index + 1),
    expected: "english-section-3",
  },
] as const;

for (const testCase of cases) {
  const result = gradePlacementSubmission(buildSubmission([...testCase.correct]));
  assert.equal(
    result.assignedSectionId,
    testCase.expected,
    `${testCase.label} was assigned incorrectly.`
  );
  assert.equal(
    result.totalCorrect,
    testCase.correct.length,
    `${testCase.label} has an incorrect total.`
  );
}

const partialResult = gradePlacementSubmission({
  testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
  answers: [],
});
assert.equal(partialResult.totalCorrect, 0, "Missing answers must count as incorrect.");

assert.throws(
  () =>
    gradePlacementSubmission({
      testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
      answers: [
        {
          questionId: "unknown-question",
          answer: { type: "fill_blank", value: "test" },
        },
      ],
    }),
  PlacementSubmissionError,
  "Unknown question IDs must be rejected."
);

const firstQuestion = englishPlacementQuestions[0];
assert.throws(
  () =>
    gradePlacementSubmission({
      testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
      answers: [
        {
          questionId: firstQuestion.exercise.id,
          answer: getCorrectAnswer(firstQuestion.exercise),
        },
        {
          questionId: firstQuestion.exercise.id,
          answer: getCorrectAnswer(firstQuestion.exercise),
        },
      ],
    }),
  PlacementSubmissionError,
  "Duplicate placement answers must be rejected."
);

console.log(
  "Placement Test check passed: 12 private questions, public answer stripping, five exercise types, missing-answer handling, tamper guards, and all Section 1-3 scoring gates are valid."
);
