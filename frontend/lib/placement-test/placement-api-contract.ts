import { z } from "zod";

import type {
  PlacementResultResponse,
  PlacementTestGetResponse,
  PlacementTestSubmission,
  PlacementTestStoredResult,
} from "@/types/placement-test";
import {
  ENGLISH_PLACEMENT_TEST_VERSION,
  type PlacementSectionId,
} from "@/types/placement-test";

const choiceAnswerSchema = z.object({
  type: z.literal("choice"),
  optionId: z.string().min(1),
});

const arrangeWordsAnswerSchema = z.object({
  type: z.literal("arrange_words"),
  tokenIds: z.array(z.string().min(1)),
});

const fillBlankAnswerSchema = z.object({
  type: z.literal("fill_blank"),
  value: z.string(),
});

const exerciseAnswerSchema = z.discriminatedUnion("type", [
  choiceAnswerSchema,
  arrangeWordsAnswerSchema,
  fillBlankAnswerSchema,
]);

const placementSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  testVersion: z.literal(ENGLISH_PLACEMENT_TEST_VERSION),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: exerciseAnswerSchema,
    })
  ),
  startedAt: z.string().datetime().optional(),
});

export class PlacementApiContractError extends Error {
  readonly status: 400 | 409;
  readonly issues: string[];

  constructor(status: 400 | 409, issues: string[]) {
    super(issues.join("\n"));
    this.name = "PlacementApiContractError";
    this.status = status;
    this.issues = issues;
  }
}

export const parsePlacementSubmissionRequest = (
  value: unknown
): PlacementTestSubmission => {
  if (
    typeof value === "object" &&
    value !== null &&
    "testVersion" in value &&
    value.testVersion !== ENGLISH_PLACEMENT_TEST_VERSION
  ) {
    throw new PlacementApiContractError(409, [
      "Bộ câu hỏi đã được cập nhật. Vui lòng bắt đầu lại bài kiểm tra.",
    ]);
  }

  const result = placementSubmissionSchema.safeParse(value);

  if (!result.success) {
    throw new PlacementApiContractError(
      400,
      result.error.issues.map((issue) => issue.message)
    );
  }

  return result.data;
};

const toResultSummary = (result: PlacementTestStoredResult) => ({
  totalCorrect: result.totalCorrect,
  totalQuestions: result.totalQuestions,
  bandScores: result.bandScores,
  latestAssignedSectionId: result.latestAssignedSectionId,
  highestAssignedSectionId: result.highestAssignedSectionId,
  attemptCount: result.attemptCount,
  completedAt: result.completedAt,
  durationSeconds: result.durationSeconds,
});

export const toPlacementGetResponse = ({
  questions,
  previousResult,
}: Pick<PlacementTestGetResponse, "questions"> & {
  previousResult: PlacementTestStoredResult | null;
}): PlacementTestGetResponse => ({
  testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
  totalQuestions: 12,
  questions,
  previousResult: previousResult ? toResultSummary(previousResult) : null,
});

export const toPlacementResultResponse = (
  result: PlacementTestStoredResult
): PlacementResultResponse => ({
  success: true,
  result: toResultSummary(result),
});

export const isPlacementSectionId = (
  value: unknown
): value is PlacementSectionId =>
  value === "english-section-1" ||
  value === "english-section-2" ||
  value === "english-section-3";
