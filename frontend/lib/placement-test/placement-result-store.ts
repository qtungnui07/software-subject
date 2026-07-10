import { getHigherPlacementSection } from "@/lib/placement-test/placement-scoring";
import type {
  PlacementTestScore,
  PlacementTestStoredResult,
} from "@/types/placement-test";

export type SavePlacementAttemptInput = {
  userId: string;
  courseId: "english";
  score: PlacementTestScore;
  startedAt?: string;
  completedAt?: string;
  submissionId?: string;
};

const getDurationSeconds = (
  startedAt: string | undefined,
  completedAt: string
) => {
  if (!startedAt) return null;

  const startedAtMs = Date.parse(startedAt);
  const completedAtMs = Date.parse(completedAt);

  if (
    Number.isNaN(startedAtMs) ||
    Number.isNaN(completedAtMs) ||
    completedAtMs < startedAtMs
  ) {
    return null;
  }

  return Math.floor((completedAtMs - startedAtMs) / 1000);
};

const cloneResult = (
  result: PlacementTestStoredResult
): PlacementTestStoredResult => {
  return JSON.parse(JSON.stringify(result)) as PlacementTestStoredResult;
};

export class PlacementMemoryResultStore {
  private readonly results = new Map<string, PlacementTestStoredResult>();

  private getKey(userId: string, courseId: "english") {
    return `${userId}:${courseId}`;
  }

  get(userId: string, courseId: "english" = "english") {
    const result = this.results.get(this.getKey(userId, courseId));
    return result ? cloneResult(result) : null;
  }

  saveAttempt(input: SavePlacementAttemptInput) {
    const existingResult = this.get(input.userId, input.courseId);
    if (
      input.submissionId &&
      existingResult?.lastSubmissionId === input.submissionId
    ) {
      return existingResult;
    }

    const completedAt = input.completedAt ?? new Date().toISOString();
    const previous = existingResult;
    const highestAssignedSectionId = previous
      ? getHigherPlacementSection(
          previous.highestAssignedSectionId,
          input.score.assignedSectionId
        )
      : input.score.assignedSectionId;

    const result: PlacementTestStoredResult = {
      ...input.score,
      userId: input.userId,
      courseId: input.courseId,
      latestAssignedSectionId: input.score.assignedSectionId,
      highestAssignedSectionId,
      attemptCount: (previous?.attemptCount ?? 0) + 1,
      startedAt: input.startedAt ?? null,
      completedAt,
      durationSeconds: getDurationSeconds(input.startedAt, completedAt),
      lastSubmissionId: input.submissionId ?? null,
    };

    this.results.set(this.getKey(input.userId, input.courseId), result);
    return cloneResult(result);
  }

  clear() {
    this.results.clear();
  }
}
