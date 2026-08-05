import "server-only";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";

import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  chapterOneProgress,
  courseProgress as courseProgressTable,
} from "@/db/schema";
import {
  migrateChapterOneProgressToCourseProgress,
  projectCourseProgressToChapterOne,
} from "@/lib/courses/chapter-one-adapter";
import { getCourseNodeAccess } from "@/lib/courses/course-access";
import {
  createDefaultCourseProgress,
  normalizeCourseProgressState,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import {
  applyPlacementUnlock,
  completeCourseNode,
  recordCheckpointScore,
  selectCourseSection,
  type CourseProgressMutationResult,
} from "@/lib/courses/course-unlock-policy";
import { getContentCourse } from "@/services/content-service";
import type { CourseDefinition, CourseId } from "@/types/course";

const offlineProgressStore = new Map<string, CourseProgressState>();

const cloneState = (state: CourseProgressState) =>
  JSON.parse(JSON.stringify(state)) as CourseProgressState;

const getOfflineKey = (userId: string, courseId: CourseId) =>
  `${userId}:${courseId}`;

type StoredCourseProgress = {
  currentSectionId?: string;
  unlockedSectionIds?: string;
  completedNodeIds?: string;
  claimedRewardNodeIds?: string;
  checkpointScores?: string;
  onboardingStatus?: string | null;
  onboardingChoice?: string | null;
  onboardingCompletedAt?: Date | null;
  updatedAt?: Date;
};

type StoredChapterOneProgress = {
  completedLessons?: string;
  claimedChests?: string;
  completedCheckpoint?: number;
  updatedAt?: Date;
};

const parseJsonArray = (value: unknown) => {
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseJsonObject = (value: unknown) => {
  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const toCourseProgressState = (
  row: StoredCourseProgress,
  course: CourseDefinition,
): CourseProgressState => {
  return normalizeCourseProgressState(
    {
      courseId: course.id,
      currentSectionId: row.currentSectionId,
      unlockedSectionIds: parseJsonArray(row.unlockedSectionIds),
      completedNodeIds: parseJsonArray(row.completedNodeIds),
      claimedRewardNodeIds: parseJsonArray(row.claimedRewardNodeIds),
      checkpointScores: parseJsonObject(row.checkpointScores),
      onboardingStatus:
        row.onboardingStatus === "placement_in_progress" ||
        row.onboardingStatus === "completed"
          ? row.onboardingStatus
          : row.onboardingStatus === null
            ? "completed"
            : "pending",
      onboardingChoice:
        row.onboardingChoice === "basic" || row.onboardingChoice === "placement"
          ? row.onboardingChoice
          : null,
      onboardingCompletedAt:
        row.onboardingCompletedAt instanceof Date
          ? row.onboardingCompletedAt.toISOString()
          : row.onboardingStatus === null
            ? row.updatedAt instanceof Date
              ? row.updatedAt.toISOString()
              : new Date().toISOString()
            : null,
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date().toISOString(),
    },
    course,
  );
};

const hasSameProgressData = (
  left: CourseProgressState,
  right: CourseProgressState
) => {
  return (
    left.courseId === right.courseId &&
    left.currentSectionId === right.currentSectionId &&
    JSON.stringify(left.unlockedSectionIds) ===
      JSON.stringify(right.unlockedSectionIds) &&
    JSON.stringify(left.completedNodeIds) ===
      JSON.stringify(right.completedNodeIds) &&
    JSON.stringify(left.claimedRewardNodeIds) ===
      JSON.stringify(right.claimedRewardNodeIds) &&
    JSON.stringify(left.checkpointScores) ===
      JSON.stringify(right.checkpointScores) &&
    left.onboardingStatus === right.onboardingStatus &&
    left.onboardingChoice === right.onboardingChoice &&
    left.onboardingCompletedAt === right.onboardingCompletedAt
  );
};

const persistCourseProgress = async (
  userId: string,
  state: CourseProgressState,
  course: CourseDefinition,
) => {
  const nextState = normalizeCourseProgressState(
    {
      ...state,
      updatedAt: new Date().toISOString(),
    },
    course,
  );

  if (!process.env.DATABASE_URL) {
    offlineProgressStore.set(
      getOfflineKey(userId, nextState.courseId),
      cloneState(nextState)
    );
    return cloneState(nextState);
  }

  await db
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

  return nextState;
};

const getLegacyChapterOneProgress = async (userId: string) => {
  if (!process.env.DATABASE_URL) return null;

  const row = (await db.query.chapterOneProgress.findFirst({
    where: eq(chapterOneProgress.userId, userId),
  })) as StoredChapterOneProgress | undefined;

  if (!row) return null;

  return {
    completedLessons: parseJsonArray(row.completedLessons),
    claimedChests: parseJsonArray(row.claimedChests),
    completedCheckpoint: Boolean(row.completedCheckpoint),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : new Date().toISOString(),
  };
};

const syncChapterOneProgress = async (
  userId: string,
  state: CourseProgressState,
  course: CourseDefinition,
) => {
  if (!process.env.DATABASE_URL) return;

  const legacyState = projectCourseProgressToChapterOne(state, course);

  await db
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
};

export const getCourseProgressForUser = async (
  userId: string,
  courseId: CourseId = "english"
) => {
  if (isRemoteApiMode()) {
    const response = await remoteApiRequest<{ progress: CourseProgressState }>(
      "/api/progress/course",
    );
    return response.progress;
  }

  const course = await getContentCourse(courseId);

  if (!process.env.DATABASE_URL) {
    return cloneState(
      offlineProgressStore.get(getOfflineKey(userId, courseId)) ??
        createDefaultCourseProgress(course)
    );
  }

  const row = (await db.query.courseProgress.findFirst({
    where: and(
      eq(courseProgressTable.userId, userId),
      eq(courseProgressTable.courseId, courseId)
    ),
  })) as StoredCourseProgress | undefined;
  const existingState = row ? toCourseProgressState(row, course) : null;
  const shouldRepairCurrentSection = Boolean(
    row &&
      existingState &&
      row.currentSectionId !== existingState.currentSectionId,
  );

  if (courseId !== "english") {
    if (existingState && shouldRepairCurrentSection) {
      return persistCourseProgress(userId, existingState, course);
    }

    return existingState ?? createDefaultCourseProgress(course);
  }

  const legacyProgress = await getLegacyChapterOneProgress(userId);
  const hasLegacyProgress = Boolean(
    legacyProgress &&
      (legacyProgress.completedLessons.length > 0 ||
        legacyProgress.claimedChests.length > 0 ||
        legacyProgress.completedCheckpoint),
  );

  if (!legacyProgress || !hasLegacyProgress) {
    if (existingState && shouldRepairCurrentSection) {
      return persistCourseProgress(userId, existingState, course);
    }

    return existingState ?? createDefaultCourseProgress(course);
  }

  const mergedState = normalizeCourseProgressState(
    migrateChapterOneProgressToCourseProgress(
      legacyProgress,
      course,
      existingState ?? undefined,
    ),
    course,
  );

  if (
    !existingState ||
    shouldRepairCurrentSection ||
    !hasSameProgressData(existingState, mergedState)
  ) {
    return persistCourseProgress(userId, mergedState, course);
  }

  return existingState;
};

export const saveCourseProgressForUser = async (
  userId: string,
  state: CourseProgressState
) => {
  const course = await getContentCourse(state.courseId);
  const nextState = await persistCourseProgress(userId, state, course);

  if (nextState.courseId === "english") {
    await syncChapterOneProgress(userId, nextState, course);
  }

  return nextState;
};

const persistMutation = async (
  userId: string,
  result: CourseProgressMutationResult
) => {
  if (!result.changed) return result;

  return {
    ...result,
    progress: await saveCourseProgressForUser(userId, result.progress),
  };
};

export const selectCurrentSectionForUser = async (
  userId: string,
  sectionId: string,
  courseId: CourseId = "english"
) => {
  const [progress, course] = await Promise.all([
    getCourseProgressForUser(userId, courseId),
    getContentCourse(courseId),
  ]);
  return persistMutation(
    userId,
    selectCourseSection(progress, sectionId, course),
  );
};

export const completeCourseNodeForUser = async (
  userId: string,
  nodeId: string,
  courseId: CourseId = "english"
) => {
  const [progress, course] = await Promise.all([
    getCourseProgressForUser(userId, courseId),
    getContentCourse(courseId),
  ]);
  return persistMutation(userId, completeCourseNode(progress, nodeId, course));
};

export const recordCheckpointScoreForUser = async (
  userId: string,
  checkpointId: string,
  score: number,
  courseId: CourseId = "english"
) => {
  const [progress, course] = await Promise.all([
    getCourseProgressForUser(userId, courseId),
    getContentCourse(courseId),
  ]);
  return persistMutation(
    userId,
    recordCheckpointScore(progress, checkpointId, score, course),
  );
};

export const applyPlacementUnlockForUser = async (
  userId: string,
  assignedSectionId: string,
  courseId: CourseId = "english"
) => {
  const [progress, course] = await Promise.all([
    getCourseProgressForUser(userId, courseId),
    getContentCourse(courseId),
  ]);
  const nextProgress = applyPlacementUnlock(
    progress,
    assignedSectionId,
    course,
  );

  if (hasSameProgressData(progress, nextProgress)) return progress;
  return saveCourseProgressForUser(userId, nextProgress);
};

export const getCourseNodeAccessForUser = async (
  userId: string,
  nodeId: string,
  courseId: CourseId = "english"
) => {
  const [progress, course] = await Promise.all([
    getCourseProgressForUser(userId, courseId),
    getContentCourse(courseId),
  ]);
  return {
    progress,
    access: getCourseNodeAccess(progress, nodeId, course),
  };
};

export const resetOfflineCourseProgressStore = () => {
  offlineProgressStore.clear();
};
