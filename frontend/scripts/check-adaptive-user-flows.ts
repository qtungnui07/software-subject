import assert from "node:assert/strict";

import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import {
  applyPlacementUnlock,
  canAccessCourseNode,
  isSectionUnlocked,
} from "@/lib/courses/course-unlock-policy";
import {
  completeBasicOnboarding,
  completePlacementOnboarding,
  createPendingOnboardingState,
  startPlacementOnboarding,
} from "@/lib/onboarding/onboarding-policy";
import { gradePlacementSubmission } from "@/lib/placement-test/placement-submission";
import type { CoreExercise, CoreExerciseAnswer } from "@/types/exercise";
import {
  ENGLISH_PLACEMENT_TEST_VERSION,
  type PlacementTestSubmission,
} from "@/types/placement-test";

const getCorrectAnswer = (exercise: CoreExercise): CoreExerciseAnswer => {
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

const getWrongAnswer = (exercise: CoreExercise): CoreExerciseAnswer => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return {
        type: "choice",
        optionId:
          exercise.options.find(
            (option) => option.id !== exercise.correctOptionId,
          )?.id ?? exercise.correctOptionId,
      };
    case "arrange_words":
      return {
        type: "arrange_words",
        tokenIds: [...exercise.correctOrder].reverse(),
      };
    case "fill_blank":
      return { type: "fill_blank", value: "incorrect" };
  }
};

const buildSubmission = (correctOrders: number[]): PlacementTestSubmission => {
  const correct = new Set(correctOrders);
  return {
    testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
    answers: englishPlacementQuestions.map((question) => ({
      questionId: question.exercise.id,
      answer: correct.has(question.order)
        ? getCorrectAnswer(question.exercise)
        : getWrongAnswer(question.exercise),
    })),
  };
};

const completedAt = "2026-07-09T10:00:00.000Z";

const basicOnboarding = completeBasicOnboarding(
  createPendingOnboardingState(),
  completedAt,
);
const basicProgress = {
  ...createDefaultCourseProgress(),
  onboardingStatus: basicOnboarding.status,
  onboardingChoice: basicOnboarding.choice,
  onboardingCompletedAt: basicOnboarding.completedAt,
};
assert.deepEqual(basicProgress.unlockedSectionIds, ["english-section-1"]);
assert.equal(basicProgress.currentSectionId, "english-section-1");
assert.equal(basicProgress.onboardingStatus, "completed");

const sectionTwoScore = gradePlacementSubmission(
  buildSubmission([1, 2, 5, 6, 9]),
);
assert.equal(sectionTwoScore.assignedSectionId, "english-section-2");
const sectionTwoProgress = applyPlacementUnlock(
  createDefaultCourseProgress(),
  sectionTwoScore.assignedSectionId,
);
const sectionTwoOnboarding = completePlacementOnboarding(
  startPlacementOnboarding(createPendingOnboardingState()),
  completedAt,
);
assert.deepEqual(sectionTwoProgress.unlockedSectionIds, [
  "english-section-1",
  "english-section-2",
]);
assert.equal(sectionTwoProgress.currentSectionId, "english-section-2");
assert.equal(sectionTwoOnboarding.status, "completed");
assert.equal(
  canAccessCourseNode(sectionTwoProgress, "en-s2-c1-lesson-1"),
  true,
);
assert.equal(
  canAccessCourseNode(sectionTwoProgress, "en-s3-c1-lesson-1"),
  false,
);

const sectionThreeScore = gradePlacementSubmission(
  buildSubmission([1, 2, 3, 5, 6, 7, 9, 10, 11]),
);
assert.equal(sectionThreeScore.assignedSectionId, "english-section-3");
const sectionThreeProgress = applyPlacementUnlock(
  sectionTwoProgress,
  sectionThreeScore.assignedSectionId,
);
assert.deepEqual(sectionThreeProgress.unlockedSectionIds, [
  "english-section-1",
  "english-section-2",
  "english-section-3",
]);

const lowerRetakeProgress = applyPlacementUnlock(
  sectionThreeProgress,
  "english-section-1",
);
assert.equal(
  isSectionUnlocked(lowerRetakeProgress, "english-section-3"),
  true,
  "A lower placement retake must never relock an opened section.",
);

console.log(
  "Adaptive user flow check passed: Basic, Placement Section 2/3, access gates, onboarding completion, and lower-retake preservation are valid.",
);
