import "server-only";

import { getLearningNodeById } from "@/lib/courses/course-catalog";
import { logger } from "@/lib/observability/logger";
import { calculateLessonXp } from "@/lib/xp";
import { getCompletedStudyMinutes } from "@/lib/study-session-policy";
import {
  createPendingQuestResult,
  createPendingStreakResult,
  createPendingXpResult,
  createSkippedQuestResult,
  createSkippedStreakResult,
  createSkippedXpResult,
} from "@/lib/learning/completion-result";
import { runIdempotentLearningCompletion } from "@/lib/learning/completion-idempotency";
import { getCompletionSyncSummary } from "@/lib/learning/completion-failure-policy";
import { getGamificationSyncPlan } from "@/lib/learning/gamification-sync-policy";
import {
  getLearningCompletionPolicy,
  normalizeCompletionAccuracy,
  normalizeCompletionDurationSeconds,
} from "@/lib/learning/completion-policy";
import {
  completeCourseNodeForUser,
  getCourseNodeAccessForUser,
  recordCheckpointScoreForUser,
} from "@/services/course-progress-service";
import { recordLearningQuestProgress } from "@/services/learning-quest-service";
import { enqueueLearningSyncJobs } from "@/services/learning-sync-recovery-service";
import { recordLearningStreak } from "@/services/streak-service";
import { completeLessonXp } from "@/services/xp-service";
import type { LearningCompletionResult } from "@/types/learning-completion";
import { getContentCourse } from "@/services/content-service";

export type CompleteLearningNodeInput = {
  userId: string;
  userName?: string | null;
  userImageSrc?: string | null;
  nodeId: string;
  accuracy: number;
  durationSeconds?: number;
  afkCount?: number;
  idempotencyKey: string;
};

export class LearningCompletionError extends Error {
  constructor(
    public readonly code:
      | "INVALID_NODE"
      | "INVALID_ACCURACY"
      | "LOCKED_NODE"
      | "PROGRESS_UPDATE_FAILED",
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "LearningCompletionError";
  }
}

const completeLearningNodeOnce = async (
  input: CompleteLearningNodeInput,
): Promise<LearningCompletionResult> => {
  const accuracy = normalizeCompletionAccuracy(input.accuracy);
  if (accuracy === null) {
    throw new LearningCompletionError(
      "INVALID_ACCURACY",
      "accuracy must be a number from 0 to 100",
      400,
    );
  }

  const course = await getContentCourse("english");
  const policy = getLearningCompletionPolicy(input.nodeId, accuracy, course);
  const node = getLearningNodeById(course, input.nodeId);
  if (!policy || !node || node.type === "chest") {
    throw new LearningCompletionError(
      "INVALID_NODE",
      "Learning node was not found or cannot be completed.",
      404,
    );
  }

  const accessState = await getCourseNodeAccessForUser(
    input.userId,
    node.id,
    "english",
  );
  if (!accessState.access.allowed) {
    throw new LearningCompletionError(
      "LOCKED_NODE",
      "Learning node is locked or its prerequisite is incomplete.",
      403,
    );
  }

  const wasCompleted = accessState.progress.completedNodeIds.includes(node.id);
  let progress = accessState.progress;
  let progressUpdated = false;
  let progressReason = policy.passed ? "already-completed" : "not-passed";
  let unlockedSectionId: string | undefined;

  if (policy.nodeType === "checkpoint") {
    const mutation = await recordCheckpointScoreForUser(
      input.userId,
      node.id,
      accuracy,
      accessState.progress.courseId,
    );
    progress = mutation.progress;
    progressUpdated = mutation.changed;
    progressReason = mutation.reason;
    unlockedSectionId = mutation.unlockedSectionId;
  } else if (policy.passed) {
    const mutation = await completeCourseNodeForUser(
      input.userId,
      node.id,
      accessState.progress.courseId,
    );
    progress = mutation.progress;
    progressUpdated = mutation.changed;
    progressReason = mutation.reason;

    if (
      mutation.reason === "locked-node" ||
      mutation.reason === "invalid-node" ||
      mutation.reason === "not-checkpoint"
    ) {
      throw new LearningCompletionError(
        "PROGRESS_UPDATE_FAILED",
        "Course progress could not be updated for this node.",
        409,
      );
    }
  }

  const alreadyCompleted =
    wasCompleted || progressReason === "already-completed";
  const newlyCompleted =
    !wasCompleted && progress.completedNodeIds.includes(node.id);

  if (!policy.passed) {
    const syncSummary = getCompletionSyncSummary({
      passed: false,
      xpPending: false,
      streakPending: false,
      questsPending: false,
    });

    return {
      success: true,
      syncStatus: syncSummary.status,
      pendingSystems: syncSummary.pendingSystems,
      nodeId: node.id,
      nodeType: policy.nodeType,
      accuracy,
      passThreshold: policy.passThreshold,
      passed: false,
      alreadyCompleted,
      progressUpdated,
      progressReason,
      progress,
      unlockedSectionId,
      xp: createSkippedXpResult("Chưa đạt điều kiện nhận XP."),
      streak: createSkippedStreakResult(),
      quests: createSkippedQuestResult("LEARNING_NODE_NOT_PASSED"),
    };
  }

  let xp = createPendingXpResult();
  try {
    const xpResult = await completeLessonXp({
      userId: input.userId,
      userName: input.userName,
      userImageSrc: input.userImageSrc,
      lessonId: node.id,
      accuracy,
    });

    xp = {
      synced: true,
      pending: false,
      earnedXp: xpResult.earnedXp,
      baseXp: xpResult.baseXp,
      accuracyBonus: xpResult.accuracyBonus,
      totalXp: xpResult.totalXp,
      dailyXp: xpResult.dailyXp,
      weeklyXp: xpResult.weeklyXp,
      level: xpResult.level,
      alreadyClaimed: xpResult.alreadyClaimed,
      isPassed: xpResult.isPassed,
      rewardType: xpResult.rewardType,
      currentDay: xpResult.currentDay,
      currentWeekStart: xpResult.currentWeekStart,
      message: xpResult.message,
    };
  } catch (error) {
    logger.warn("learning_completion_xp_pending", {
      userId: input.userId,
      nodeId: node.id,
      error,
    });
  }

  const gamificationPlan = getGamificationSyncPlan({
    newlyCompleted,
    xpSynced: xp.synced,
    earnedXp: xp.earnedXp,
    xpAlreadyClaimed: xp.alreadyClaimed,
  });
  const shouldSyncGamification = gamificationPlan.shouldSync;
  const completedLessonsDelta = gamificationPlan.completedLessonsDelta;

  let quests = shouldSyncGamification
    ? createPendingQuestResult()
    : createSkippedQuestResult(
        xp.alreadyClaimed ? "LEARNING_NODE_ALREADY_REWARDED" : "NO_NEW_ACTIVITY",
      );

  if (shouldSyncGamification) {
    try {
      const questResult = await recordLearningQuestProgress({
        userId: input.userId,
        earnedXp: gamificationPlan.xpDelta,
        completedLessons: completedLessonsDelta,
        accuracy,
        durationSeconds: normalizeCompletionDurationSeconds(
          input.durationSeconds,
        ),
      });

      quests = {
        synced: !questResult.skipped ||
          questResult.code === "QUEST_DATABASE_UNAVAILABLE",
        pending: questResult.code === "QUEST_PROGRESS_RECORD_FAILED",
        skipped: questResult.skipped,
        code: questResult.code ?? null,
      };
    } catch (error) {
      logger.warn("learning_completion_quest_pending", {
        userId: input.userId,
        nodeId: node.id,
        error,
      });
    }
  }

  let streak = shouldSyncGamification
    ? createPendingStreakResult()
    : createSkippedStreakResult();

  if (shouldSyncGamification) {
    try {
      const streakResult = await recordLearningStreak({
        userId: input.userId,
        nodeId: node.id,
        earnedXp: gamificationPlan.xpDelta,
        completedLessons: completedLessonsDelta,
        studyMinutes: getCompletedStudyMinutes(
          normalizeCompletionDurationSeconds(input.durationSeconds),
        ),
        afkCount: input.afkCount,
      });

      streak = {
        synced: true,
        pending: false,
        status: streakResult.status,
        currentStreak: streakResult.currentStreak,
        longestStreak: streakResult.longestStreak,
        streakFreezes: streakResult.streakFreezes,
        missedDays: streakResult.missedDays,
        usedStreakFreezes: streakResult.usedStreakFreezes,
      };
    } catch (error) {
      logger.warn("learning_completion_streak_pending", {
        userId: input.userId,
        nodeId: node.id,
        error,
      });
    }
  }

  const syncSummary = getCompletionSyncSummary({
    passed: true,
    xpPending: xp.pending,
    streakPending: streak.pending,
    questsPending: quests.pending,
  });

  const expectedFirstCompletionXp = calculateLessonXp({
    accuracy,
    isFirstCompletion: true,
  }).earnedXp;
  const recoveryPayload = {
    userName: input.userName,
    userImageSrc: input.userImageSrc,
    accuracy,
    durationSeconds: normalizeCompletionDurationSeconds(input.durationSeconds),
    afkCount: input.afkCount ?? 0,
    completedLessons: newlyCompleted ? 1 : 0,
    earnedXp: xp.synced ? xp.earnedXp : expectedFirstCompletionXp,
  };
  const recoveryJobs = [];

  if (newlyCompleted && xp.pending) {
    recoveryJobs.push({
      userId: input.userId,
      nodeId: node.id,
      system: "xp" as const,
      payload: recoveryPayload,
    });
  } else if (shouldSyncGamification) {
    if (quests.pending) {
      recoveryJobs.push({
        userId: input.userId,
        nodeId: node.id,
        system: "quest" as const,
        payload: recoveryPayload,
      });
    }
    if (streak.pending) {
      recoveryJobs.push({
        userId: input.userId,
        nodeId: node.id,
        system: "streak" as const,
        payload: recoveryPayload,
      });
    }
  }

  const recoveryResults = recoveryJobs.length > 0
    ? await enqueueLearningSyncJobs(recoveryJobs)
    : [];
  const queuedSystems = recoveryJobs
    .filter((_, index) => recoveryResults[index]?.queued)
    .map((job) => job.system);

  if (syncSummary.status === "partial") {
    logger.warn("learning_completion_partial", {
      userId: input.userId,
      nodeId: node.id,
      pendingSystems: syncSummary.pendingSystems,
      queuedSystems,
    });
  }

  return {
    success: true,
    syncStatus: syncSummary.status,
    pendingSystems: syncSummary.pendingSystems,
    recovery: {
      durable: Boolean(process.env.DATABASE_URL),
      queuedSystems,
    },
    nodeId: node.id,
    nodeType: policy.nodeType,
    accuracy,
    passThreshold: policy.passThreshold,
    passed: true,
    alreadyCompleted,
    progressUpdated,
    progressReason,
    progress,
    unlockedSectionId,
    xp,
    streak,
    quests,
  };
};

export const completeLearningNodeForUser = async (
  input: CompleteLearningNodeInput,
) => {
  const idempotencyScope = `${input.userId}:${input.idempotencyKey}`;
  return runIdempotentLearningCompletion(idempotencyScope, () =>
    completeLearningNodeOnce(input),
  );
};
