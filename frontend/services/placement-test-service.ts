import "server-only";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";

import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { placementTestResults } from "@/db/schema";
import { PlacementMemoryResultStore } from "@/lib/placement-test/placement-result-store";
import { getHigherPlacementSection } from "@/lib/placement-test/placement-scoring";
import { applyPlacementUnlockForUser } from "@/services/course-progress-service";
import { completePlacementOnboardingForUser } from "@/services/onboarding-service";
import { gradeContentPlacementTest } from "@/services/content-service";
import type {
  PlacementScoredAnswer,
  PlacementSectionId,
  PlacementTestStoredResult,
  PlacementTestSubmission,
} from "@/types/placement-test";

const offlineStore = new PlacementMemoryResultStore();

const isPlacementSectionId = (
  value: unknown
): value is PlacementSectionId => {
  return (
    value === "english-section-1" ||
    value === "english-section-2" ||
    value === "english-section-3"
  );
};

const parseScoredAnswers = (value: unknown): PlacementScoredAnswer[] => {
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PlacementScoredAnswer[]) : [];
  } catch {
    return [];
  }
};

const toIsoString = (value: unknown) => {
  return value instanceof Date ? value.toISOString() : null;
};

type StoredPlacementRow = {
  userId: string;
  courseId: string;
  testVersion: string;
  totalCorrect: number;
  basicScore: number;
  intermediateScore: number;
  advancedScore: number;
  latestAssignedSectionId: string;
  highestAssignedSectionId: string;
  answersJson: string;
  attemptCount: number;
  durationSeconds: number | null;
  startedAt: Date | null;
  completedAt: Date;
  lastSubmissionId: string | null;
};

const toStoredResult = (
  row: StoredPlacementRow
): PlacementTestStoredResult | null => {
  if (
    row.courseId !== "english" ||
    row.testVersion !== "english-placement-v1" ||
    !isPlacementSectionId(row.latestAssignedSectionId) ||
    !isPlacementSectionId(row.highestAssignedSectionId)
  ) {
    return null;
  }

  return {
    userId: row.userId,
    courseId: "english",
    testVersion: "english-placement-v1",
    totalQuestions: 12,
    totalCorrect: row.totalCorrect,
    bandScores: {
      basic: row.basicScore,
      intermediate: row.intermediateScore,
      advanced: row.advancedScore,
    },
    assignedSectionId: row.latestAssignedSectionId,
    latestAssignedSectionId: row.latestAssignedSectionId,
    highestAssignedSectionId: row.highestAssignedSectionId,
    scoredAnswers: parseScoredAnswers(row.answersJson),
    attemptCount: row.attemptCount,
    durationSeconds: row.durationSeconds,
    lastSubmissionId: row.lastSubmissionId,
    startedAt: toIsoString(row.startedAt),
    completedAt: row.completedAt.toISOString(),
  };
};

const getDurationSeconds = (
  startedAt: string | undefined,
  completedAt: string
) => {
  if (!startedAt) return null;

  const startMs = Date.parse(startedAt);
  const endMs = Date.parse(completedAt);

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return null;
  }

  return Math.floor((endMs - startMs) / 1000);
};

export const getPlacementTestResultForUser = async (userId: string) => {
  if (isRemoteApiMode()) {
    const response = await remoteApiRequest<{
      previousResult: PlacementTestStoredResult | null;
    }>("/api/placement-test");
    return response.previousResult;
  }

  if (!process.env.DATABASE_URL) {
    return offlineStore.get(userId);
  }

  const row = (await db.query.placementTestResults.findFirst({
    where: and(
      eq(placementTestResults.userId, userId),
      eq(placementTestResults.courseId, "english")
    ),
  })) as StoredPlacementRow | undefined;

  return row ? toStoredResult(row) : null;
};

export const submitPlacementTestForUser = async (
  userId: string,
  submission: PlacementTestSubmission
) => {
  const score = await gradeContentPlacementTest(submission);
  const completedAt = new Date().toISOString();

  if (!process.env.DATABASE_URL) {
    const result = offlineStore.saveAttempt({
      userId,
      courseId: "english",
      score,
      startedAt: submission.startedAt,
      completedAt,
      submissionId: submission.submissionId,
    });
    await applyPlacementUnlockForUser(
      userId,
      result.highestAssignedSectionId
    );
    await completePlacementOnboardingForUser(userId);
    return result;
  }

  const existing = await getPlacementTestResultForUser(userId);

  if (
    submission.submissionId &&
    existing?.lastSubmissionId === submission.submissionId
  ) {
    await applyPlacementUnlockForUser(
      userId,
      existing.highestAssignedSectionId,
    );
    await completePlacementOnboardingForUser(userId);
    return existing;
  }

  const attemptCount = (existing?.attemptCount ?? 0) + 1;
  const highestAssignedSectionId = existing
    ? getHigherPlacementSection(
        existing.highestAssignedSectionId,
        score.assignedSectionId
      )
    : score.assignedSectionId;
  const durationSeconds = getDurationSeconds(
    submission.startedAt,
    completedAt
  );

  await db
    .insert(placementTestResults)
    .values({
      userId,
      courseId: "english",
      testVersion: score.testVersion,
      totalCorrect: score.totalCorrect,
      basicScore: score.bandScores.basic,
      intermediateScore: score.bandScores.intermediate,
      advancedScore: score.bandScores.advanced,
      latestAssignedSectionId: score.assignedSectionId,
      highestAssignedSectionId,
      answersJson: JSON.stringify(score.scoredAnswers),
      attemptCount,
      durationSeconds,
      startedAt: submission.startedAt
        ? new Date(submission.startedAt)
        : null,
      completedAt: new Date(completedAt),
      lastSubmissionId: submission.submissionId ?? null,
      updatedAt: new Date(completedAt),
    })
    .onConflictDoUpdate({
      target: [placementTestResults.userId, placementTestResults.courseId],
      set: {
        testVersion: score.testVersion,
        totalCorrect: score.totalCorrect,
        basicScore: score.bandScores.basic,
        intermediateScore: score.bandScores.intermediate,
        advancedScore: score.bandScores.advanced,
        latestAssignedSectionId: score.assignedSectionId,
        highestAssignedSectionId,
        answersJson: JSON.stringify(score.scoredAnswers),
        attemptCount,
        durationSeconds,
        startedAt: submission.startedAt
          ? new Date(submission.startedAt)
          : null,
        completedAt: new Date(completedAt),
        lastSubmissionId: submission.submissionId ?? null,
        updatedAt: new Date(completedAt),
      },
    });

  const result = {
    ...score,
    userId,
    courseId: "english" as const,
    latestAssignedSectionId: score.assignedSectionId,
    highestAssignedSectionId,
    attemptCount,
    startedAt: submission.startedAt ?? null,
    completedAt,
    durationSeconds,
    lastSubmissionId: submission.submissionId ?? null,
  } satisfies PlacementTestStoredResult;

  await applyPlacementUnlockForUser(userId, highestAssignedSectionId);
  await completePlacementOnboardingForUser(userId);
  return result;
};
