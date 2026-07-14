import "server-only";

import { and, asc, eq, inArray, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { learningSyncJobs } from "@/db/schema";
import {
  getLearningSyncRetryDecision,
  MAX_LEARNING_SYNC_ATTEMPTS,
} from "@/lib/learning/sync-retry-policy";
import { logger } from "@/lib/observability/logger";
import {
  getCompletedStudyMinutes,
  normalizeAfkCount,
} from "@/lib/study-session-policy";
import { recordLearningQuestProgress } from "@/services/learning-quest-service";
import { recordLearningStreak } from "@/services/streak-service";
import { completeLessonXp } from "@/services/xp-service";
import type {
  LearningSyncJobPayload,
  LearningSyncJobRecord,
  LearningSyncSystem,
} from "@/types/learning-sync-job";

const PROCESSING_LEASE_MS = 15 * 60_000;

export type EnqueueLearningSyncJobInput = {
  userId: string;
  nodeId: string;
  system: LearningSyncSystem;
  payload: LearningSyncJobPayload;
};

export type ProcessLearningSyncJobsInput = {
  limit?: number;
  userId?: string;
  now?: Date;
};

export type ProcessLearningSyncJobsResult = {
  processed: number;
  completed: number;
  failed: number;
  deferred: number;
  skipped: boolean;
};

const serializePayload = (payload: LearningSyncJobPayload) =>
  JSON.stringify({
    userName: payload.userName ?? null,
    userImageSrc: payload.userImageSrc ?? null,
    accuracy: Math.max(0, Math.min(100, Math.trunc(payload.accuracy))),
    durationSeconds: Math.max(0, Math.trunc(payload.durationSeconds)),
    afkCount: normalizeAfkCount(payload.afkCount),
    completedLessons: Math.max(
      0,
      Math.min(1, Math.trunc(payload.completedLessons)),
    ),
    earnedXp: Math.max(0, Math.trunc(payload.earnedXp)),
  });

const parsePayload = (value: string): LearningSyncJobPayload => {
  const parsed = JSON.parse(value) as Partial<LearningSyncJobPayload>;
  return {
    userName: typeof parsed.userName === "string" ? parsed.userName : null,
    userImageSrc:
      typeof parsed.userImageSrc === "string" ? parsed.userImageSrc : null,
    accuracy: Math.max(
      0,
      Math.min(100, Math.trunc(Number(parsed.accuracy) || 0)),
    ),
    durationSeconds: Math.max(
      0,
      Math.trunc(Number(parsed.durationSeconds) || 0),
    ),
    afkCount: normalizeAfkCount(parsed.afkCount),
    completedLessons: Math.max(
      0,
      Math.min(1, Math.trunc(Number(parsed.completedLessons) || 0)),
    ),
    earnedXp: Math.max(0, Math.trunc(Number(parsed.earnedXp) || 0)),
  };
};

export const enqueueLearningSyncJob = async (
  input: EnqueueLearningSyncJobInput,
) => {
  if (!process.env.DATABASE_URL) {
    return { queued: false, reason: "DATABASE_UNAVAILABLE" as const };
  }

  const now = new Date();
  const [created] = await db
    .insert(learningSyncJobs)
    .values({
      userId: input.userId,
      nodeId: input.nodeId,
      system: input.system,
      status: "pending",
      attempts: 0,
      nextRetryAt: now,
      payloadJson: serializePayload(input.payload),
      lastErrorCode: null,
      completedAt: null,
      updatedAt: now,
    })
    .onConflictDoNothing({
      target: [
        learningSyncJobs.userId,
        learningSyncJobs.nodeId,
        learningSyncJobs.system,
      ],
    })
    .returning({ id: learningSyncJobs.id });

  return {
    queued: Boolean(created),
    reason: created ? null : ("ALREADY_QUEUED" as const),
  };
};

export const enqueueLearningSyncJobs = async (
  jobs: EnqueueLearningSyncJobInput[],
) => {
  const results = [];
  for (const job of jobs) {
    try {
      results.push(await enqueueLearningSyncJob(job));
    } catch (error) {
      logger.error("learning_sync_enqueue_failed", {
        userId: job.userId,
        nodeId: job.nodeId,
        system: job.system,
        error,
      });
      results.push({ queued: false, reason: "ENQUEUE_FAILED" as const });
    }
  }
  return results;
};

const recoverStaleProcessingJobs = async (now: Date) => {
  const staleBefore = new Date(now.getTime() - PROCESSING_LEASE_MS);
  await db
    .update(learningSyncJobs)
    .set({
      status: "pending",
      nextRetryAt: now,
      lastErrorCode: "PROCESSING_LEASE_EXPIRED",
      updatedAt: now,
    })
    .where(
      and(
        eq(learningSyncJobs.status, "processing"),
        lte(learningSyncJobs.updatedAt, staleBefore),
      ),
    );
};

const claimJob = async (jobId: number, now: Date) => {
  const [claimed] = await db
    .update(learningSyncJobs)
    .set({ status: "processing", updatedAt: now })
    .where(
      and(
        eq(learningSyncJobs.id, jobId),
        eq(learningSyncJobs.status, "pending"),
      ),
    )
    .returning();

  return claimed as LearningSyncJobRecord | undefined;
};

const markCompleted = async (jobId: number, now: Date) => {
  await db
    .update(learningSyncJobs)
    .set({
      status: "completed",
      completedAt: now,
      lastErrorCode: null,
      updatedAt: now,
    })
    .where(eq(learningSyncJobs.id, jobId));
};

const markFailedAttempt = async (
  job: LearningSyncJobRecord,
  errorCode: string,
  now: Date,
) => {
  const attempts = Math.max(0, job.attempts) + 1;
  const decision = getLearningSyncRetryDecision(attempts, now);

  await db
    .update(learningSyncJobs)
    .set({
      status: decision.status,
      attempts,
      nextRetryAt: decision.nextRetryAt ?? now,
      lastErrorCode: errorCode,
      updatedAt: now,
    })
    .where(eq(learningSyncJobs.id, job.id));

  return decision;
};

const processJob = async (job: LearningSyncJobRecord) => {
  const payload = parsePayload(job.payloadJson);

  if (job.system === "xp") {
    await completeLessonXp({
      userId: job.userId,
      userName: payload.userName,
      userImageSrc: payload.userImageSrc,
      lessonId: job.nodeId,
      accuracy: payload.accuracy,
    });

    await enqueueLearningSyncJobs([
      {
        userId: job.userId,
        nodeId: job.nodeId,
        system: "quest",
        payload,
      },
      {
        userId: job.userId,
        nodeId: job.nodeId,
        system: "streak",
        payload,
      },
    ]);
    return;
  }

  if (job.system === "quest") {
    const result = await recordLearningQuestProgress({
      userId: job.userId,
      earnedXp: payload.earnedXp,
      completedLessons: payload.completedLessons,
      accuracy: payload.accuracy,
      durationSeconds: payload.durationSeconds,
    });

    if (result.skipped) {
      throw new Error(result.code ?? "QUEST_SYNC_SKIPPED");
    }
    return;
  }

  await recordLearningStreak({
    userId: job.userId,
    nodeId: job.nodeId,
    earnedXp: payload.earnedXp,
    completedLessons: payload.completedLessons,
    studyMinutes: getCompletedStudyMinutes(payload.durationSeconds),
    afkCount: payload.afkCount,
  });
};

export const processPendingLearningSyncJobs = async ({
  limit = 20,
  userId,
  now = new Date(),
}: ProcessLearningSyncJobsInput = {}): Promise<ProcessLearningSyncJobsResult> => {
  if (!process.env.DATABASE_URL) {
    return {
      processed: 0,
      completed: 0,
      failed: 0,
      deferred: 0,
      skipped: true,
    };
  }

  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  await recoverStaleProcessingJobs(now);

  const filters = [
    eq(learningSyncJobs.status, "pending"),
    lte(learningSyncJobs.nextRetryAt, now),
  ];
  if (userId) filters.push(eq(learningSyncJobs.userId, userId));

  const jobs = await db.query.learningSyncJobs.findMany({
    where: and(...filters),
    orderBy: [asc(learningSyncJobs.nextRetryAt), asc(learningSyncJobs.id)],
    limit: safeLimit,
  });

  let processed = 0;
  let completed = 0;
  let failed = 0;
  let deferred = 0;

  for (const candidate of jobs as LearningSyncJobRecord[]) {
    const job = await claimJob(candidate.id, now);
    if (!job) continue;

    processed += 1;
    try {
      await processJob(job);
      await markCompleted(job.id, new Date());
      completed += 1;
      logger.info("learning_sync_retry_success", {
        userId: job.userId,
        nodeId: job.nodeId,
        system: job.system,
        attempts: job.attempts,
      });
    } catch (error) {
      const code =
        error instanceof Error ? error.name || "SYNC_FAILED" : "SYNC_FAILED";
      const decision = await markFailedAttempt(job, code, new Date());
      if (decision.exhausted) failed += 1;
      else deferred += 1;
      logger.error("learning_sync_retry_failed", {
        userId: job.userId,
        nodeId: job.nodeId,
        system: job.system,
        attempts: job.attempts + 1,
        maxAttempts: MAX_LEARNING_SYNC_ATTEMPTS,
        exhausted: decision.exhausted,
        error,
      });
    }
  }

  return { processed, completed, failed, deferred, skipped: false };
};

export const getLearningSyncJobSummary = async () => {
  if (!process.env.DATABASE_URL) {
    return { pending: 0, processing: 0, failed: 0, completed: 0 };
  }

  const jobs = await db.query.learningSyncJobs.findMany({
    where: inArray(learningSyncJobs.status, [
      "pending",
      "processing",
      "failed",
      "completed",
    ]),
  });

  return jobs.reduce(
    (summary: Record<string, number>, job: { status: string }) => {
      if (job.status in summary) summary[job.status] += 1;
      return summary;
    },
    { pending: 0, processing: 0, failed: 0, completed: 0 },
  );
};
