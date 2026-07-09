import type { ExerciseAnswer } from "@/types/exercise";
import {
  ENGLISH_PLACEMENT_TEST_VERSION,
  type PlacementTestVersion,
} from "@/types/placement-test";

export type PlacementDraft = {
  testVersion: PlacementTestVersion;
  currentQuestionIndex: number;
  answers: Record<string, ExerciseAnswer>;
  startedAt: string;
  submissionId: string;
};

export const getPlacementDraftStorageKey = (ownerKey: string) =>
  `robogo-placement:${ENGLISH_PLACEMENT_TEST_VERSION}:${ownerKey}`;

export const createPlacementDraft = (
  submissionId: string,
  startedAt = new Date().toISOString()
): PlacementDraft => ({
  testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
  currentQuestionIndex: 0,
  answers: {},
  startedAt,
  submissionId,
});

const isExerciseAnswer = (value: unknown): value is ExerciseAnswer => {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }

  if (value.type === "choice") {
    return "optionId" in value && typeof value.optionId === "string";
  }

  if (value.type === "arrange_words") {
    return (
      "tokenIds" in value &&
      Array.isArray(value.tokenIds) &&
      value.tokenIds.every((tokenId) => typeof tokenId === "string")
    );
  }

  return (
    value.type === "fill_blank" &&
    "value" in value &&
    typeof value.value === "string"
  );
};

export const parsePlacementDraft = (
  value: string | null,
  totalQuestions: number
): PlacementDraft | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PlacementDraft>;

    if (
      parsed.testVersion !== ENGLISH_PLACEMENT_TEST_VERSION ||
      typeof parsed.startedAt !== "string" ||
      Number.isNaN(Date.parse(parsed.startedAt)) ||
      typeof parsed.submissionId !== "string" ||
      !parsed.submissionId ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null
    ) {
      return null;
    }

    const answers = Object.fromEntries(
      Object.entries(parsed.answers).filter((entry): entry is [string, ExerciseAnswer] =>
        typeof entry[0] === "string" && isExerciseAnswer(entry[1])
      )
    );

    const currentQuestionIndex = Math.min(
      Math.max(
        Number.isInteger(parsed.currentQuestionIndex)
          ? (parsed.currentQuestionIndex as number)
          : 0,
        0
      ),
      Math.max(0, totalQuestions - 1)
    );

    return {
      testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
      currentQuestionIndex,
      answers,
      startedAt: parsed.startedAt,
      submissionId: parsed.submissionId,
    };
  } catch {
    return null;
  }
};

export const isPlacementAnswerComplete = (answer: ExerciseAnswer | undefined) => {
  if (!answer) return false;
  if (answer.type === "choice") return Boolean(answer.optionId);
  if (answer.type === "arrange_words") return answer.tokenIds.length > 0;
  return answer.value.trim().length > 0;
};

export const countAnsweredPlacementQuestions = (
  answers: Record<string, ExerciseAnswer>,
  questionIds: string[]
) =>
  questionIds.filter((questionId) =>
    isPlacementAnswerComplete(answers[questionId])
  ).length;
