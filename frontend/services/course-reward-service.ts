import "server-only";

import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  chapterOneProgress,
  courseProgress as courseProgressTable,
  userStreaks,
} from "@/db/schema";
import { projectCourseProgressToChapterOne } from "@/lib/courses/chapter-one-adapter";
import { claimCourseReward } from "@/lib/courses/course-reward-claim";
import {
  normalizeCourseProgressState,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";
import {
  getCourseProgressForUser,
  saveCourseProgressForUser,
} from "@/services/course-progress-service";
import { getContentCourse } from "@/services/content-service";
import { getUserStreak } from "@/db/queries";
import type { CourseId, CourseRewardDefinition } from "@/types/course";

export type ClaimCourseRewardInput = {
  userId: string;
  nodeId: string;
  courseId?: CourseId;
};

export type ClaimCourseRewardResult = {
  success: true;
  nodeId: string;
  reward: CourseRewardDefinition;
  rewardDelta: number;
  streakFreezes: number;
  progress: CourseProgressState;
  changed: boolean;
  alreadyClaimed: boolean;
  reason: "updated" | "already-claimed";
};

export type CourseRewardClaimErrorCode =
  | "INVALID_NODE"
  | "NOT_CHEST"
  | "NODE_LOCKED"
  | "MISSING_REWARD"
  | "UNSUPPORTED_REWARD";

export class CourseRewardClaimError extends Error {
  constructor(
    public readonly code: CourseRewardClaimErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CourseRewardClaimError";
  }
}

const offlineStreakFreezeStore = new Map<string, number>();

const cloneState = (state: CourseProgressState) =>
  JSON.parse(JSON.stringify(state)) as CourseProgressState;

const getOfflineStreakFreezesForUser = async (userId: string) => {
  if (offlineStreakFreezeStore.has(userId)) {
    return offlineStreakFreezeStore.get(userId) ?? 0;
  }

  const currentStreak = await getUserStreak(userId);
  const freezes = Math.max(0, Math.trunc(currentStreak?.streakFreezes ?? 0));
  offlineStreakFreezeStore.set(userId, freezes);

  return freezes;
};

const addOfflineStreakFreezesForUser = async (
  userId: string,
  amount: number,
) => {
  const currentFreezes = await getOfflineStreakFreezesForUser(userId);
  const nextFreezes = currentFreezes + amount;
  offlineStreakFreezeStore.set(userId, nextFreezes);

  return nextFreezes;
};

const getCurrentStreakFreezesForUser = async (userId: string) => {
  if (!process.env.DATABASE_URL) {
    return getOfflineStreakFreezesForUser(userId);
  }

  const currentStreak = await getUserStreak(userId);
  return Math.max(0, Math.trunc(currentStreak?.streakFreezes ?? 0));
};

const persistCourseProgressAndReward = async ({
  userId,
  progress,
  reward,
  course,
}: {
  userId: string;
  progress: CourseProgressState;
  reward: CourseRewardDefinition;
  course: Awaited<ReturnType<typeof getContentCourse>>;
}) => {
  const nextState = normalizeCourseProgressState(
    {
      ...progress,
      updatedAt: new Date().toISOString(),
    },
    course,
  );

  if (!process.env.DATABASE_URL) {
    const savedProgress = await saveCourseProgressForUser(userId, nextState);
    const streakFreezes = await addOfflineStreakFreezesForUser(
      userId,
      reward.amount,
    );

    return {
      progress: savedProgress,
      streakFreezes,
    };
  }

  const updatedStreak = await db.transaction(async (tx: typeof db) => {
    await tx
      .insert(courseProgressTable)
      .values({
        userId,
        courseId: nextState.courseId,
        currentSectionId: nextState.currentSectionId,
        unlockedSectionIds: JSON.stringify(nextState.unlockedSectionIds),
        completedNodeIds: JSON.stringify(nextState.completedNodeIds),
        claimedRewardNodeIds: JSON.stringify(nextState.claimedRewardNodeIds),
        checkpointScores: JSON.stringify(nextState.checkpointScores),
        onboardingStatus: nextState.onboardingStatus,
        onboardingChoice: nextState.onboardingChoice,
        onboardingCompletedAt: nextState.onboardingCompletedAt
          ? new Date(nextState.onboardingCompletedAt)
          : null,
        updatedAt: new Date(nextState.updatedAt),
      })
      .onConflictDoUpdate({
        target: [courseProgressTable.userId, courseProgressTable.courseId],
        set: {
          currentSectionId: nextState.currentSectionId,
          unlockedSectionIds: JSON.stringify(nextState.unlockedSectionIds),
          completedNodeIds: JSON.stringify(nextState.completedNodeIds),
          claimedRewardNodeIds: JSON.stringify(nextState.claimedRewardNodeIds),
          checkpointScores: JSON.stringify(nextState.checkpointScores),
          onboardingStatus: nextState.onboardingStatus,
          onboardingChoice: nextState.onboardingChoice,
          onboardingCompletedAt: nextState.onboardingCompletedAt
            ? new Date(nextState.onboardingCompletedAt)
            : null,
          updatedAt: new Date(nextState.updatedAt),
        },
      });

    if (nextState.courseId === "english") {
      const legacyState = projectCourseProgressToChapterOne(
        nextState,
        course,
      );

      await tx
        .insert(chapterOneProgress)
        .values({
          userId,
          completedLessons: JSON.stringify(legacyState.completedLessons),
          claimedChests: JSON.stringify(legacyState.claimedChests),
          completedCheckpoint: legacyState.completedCheckpoint ? 1 : 0,
          updatedAt: new Date(legacyState.updatedAt),
        })
        .onConflictDoUpdate({
          target: chapterOneProgress.userId,
          set: {
            completedLessons: JSON.stringify(legacyState.completedLessons),
            claimedChests: JSON.stringify(legacyState.claimedChests),
            completedCheckpoint: legacyState.completedCheckpoint ? 1 : 0,
            updatedAt: new Date(legacyState.updatedAt),
          },
        });
    }

    const [streak] = await tx
      .insert(userStreaks)
      .values({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        streakFreezes: reward.amount,
        lastStudyDate: null,
      })
      .onConflictDoUpdate({
        target: userStreaks.userId,
        set: {
          streakFreezes: sql`${userStreaks.streakFreezes} + ${reward.amount}`,
          updatedAt: new Date(),
        },
      })
      .returning({ streakFreezes: userStreaks.streakFreezes });

    return streak;
  });

  return {
    progress: nextState,
    streakFreezes: Math.max(0, Math.trunc(updatedStreak?.streakFreezes ?? 0)),
  };
};

const toClaimError = (reason: string, nodeId: string) => {
  switch (reason) {
    case "invalid-node":
      return new CourseRewardClaimError(
        "INVALID_NODE",
        "Rương thưởng không tồn tại.",
        404,
      );
    case "not-chest":
      return new CourseRewardClaimError(
        "NOT_CHEST",
        "Node này không phải rương thưởng.",
        400,
      );
    case "locked-section":
    case "locked-node":
      return new CourseRewardClaimError(
        "NODE_LOCKED",
        "Rương thưởng này chưa được mở khóa.",
        403,
      );
    case "missing-reward":
      return new CourseRewardClaimError(
        "MISSING_REWARD",
        "Rương thưởng này chưa có phần thưởng hợp lệ.",
        400,
      );
    case "unsupported-reward":
      return new CourseRewardClaimError(
        "UNSUPPORTED_REWARD",
        "Loại phần thưởng của rương này chưa được hỗ trợ.",
        400,
      );
    default:
      return new CourseRewardClaimError(
        "INVALID_NODE",
        `Không thể nhận phần thưởng cho node ${nodeId}.`,
        400,
      );
  }
};

export const claimCourseRewardForUser = async ({
  userId,
  nodeId,
  courseId = "english",
}: ClaimCourseRewardInput): Promise<ClaimCourseRewardResult> => {
  if (isRemoteApiMode()) {
    return remoteApiRequest<ClaimCourseRewardResult>(
      "/api/progress/course/claim-reward",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nodeId }),
      },
    );
  }

  const [progress, course] = await Promise.all([
    getCourseProgressForUser(userId, courseId),
    getContentCourse(courseId),
  ]);
  const claim = claimCourseReward(progress, nodeId, course);

  if (!claim.reward) {
    throw toClaimError(claim.reason, nodeId);
  }

  if (claim.reason === "already-claimed") {
    return {
      success: true,
      nodeId: claim.nodeId,
      reward: claim.reward,
      rewardDelta: 0,
      streakFreezes: await getCurrentStreakFreezesForUser(userId),
      progress: cloneState(claim.progress),
      changed: false,
      alreadyClaimed: true,
      reason: "already-claimed",
    };
  }

  if (claim.reason !== "updated") {
    throw toClaimError(claim.reason, nodeId);
  }

  const persisted = await persistCourseProgressAndReward({
    userId,
    progress: claim.progress,
    reward: claim.reward,
    course,
  });

  return {
    success: true,
    nodeId: claim.nodeId,
    reward: claim.reward,
    rewardDelta: claim.reward.amount,
    streakFreezes: persisted.streakFreezes,
    progress: cloneState(persisted.progress),
    changed: true,
    alreadyClaimed: false,
    reason: "updated",
  };
};

export const resetOfflineCourseRewardStore = () => {
  offlineStreakFreezeStore.clear();
};
