import "server-only";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";

import { and, eq, gt } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  chapterOneProgress,
  courses,
  lessonXpClaims,
  placementTestResults,
  userProgress,
  userXpSummary,
} from "@/db/schema";
import {
  completeBasicOnboarding,
  completePlacementOnboarding,
  migrateLegacyOnboardingState,
  normalizeOnboardingState,
  repairSpuriousLegacyCompletion,
  startPlacementOnboarding,
} from "@/lib/onboarding/onboarding-policy";
import {
  getCourseProgressForUser,
  saveCourseProgressForUser,
} from "@/services/course-progress-service";
import type { CourseOnboardingState } from "@/types/onboarding";

const getStateFromProgress = async (userId: string) => {
  const progress = await getCourseProgressForUser(userId, "english");

  return {
    progress,
    onboarding: normalizeOnboardingState({
      courseId: "english",
      status: progress.onboardingStatus,
      choice: progress.onboardingChoice,
      completedAt: progress.onboardingCompletedAt,
    }),
  };
};

const hasLegacyLearningActivity = async (userId: string) => {
  if (!process.env.DATABASE_URL) return false;

  const [chapterProgress, placementResult, lessonClaim, xpSummary] =
    await Promise.all([
      db.query.chapterOneProgress.findFirst({
        where: eq(chapterOneProgress.userId, userId),
      }),
      db.query.placementTestResults.findFirst({
        where: and(
          eq(placementTestResults.userId, userId),
          eq(placementTestResults.courseId, "english"),
        ),
      }),
      db.query.lessonXpClaims.findFirst({
        where: eq(lessonXpClaims.userId, userId),
      }),
      db.query.userXpSummary.findFirst({
        where: and(
          eq(userXpSummary.userId, userId),
          gt(userXpSummary.totalXp, 0),
        ),
      }),
    ]);

  const hasChapterProgress = Boolean(
    chapterProgress &&
      (chapterProgress.completedLessons !== "[]" ||
        chapterProgress.claimedChests !== "[]" ||
        chapterProgress.completedCheckpoint > 0),
  );

  return Boolean(hasChapterProgress || placementResult || lessonClaim || xpSummary);
};

const persistOnboardingState = async (
  userId: string,
  state: CourseOnboardingState,
) => {
  const progress = await getCourseProgressForUser(userId, "english");
  const nextProgress = await saveCourseProgressForUser(userId, {
    ...progress,
    onboardingStatus: state.status,
    onboardingChoice: state.choice,
    onboardingCompletedAt: state.completedAt,
    updatedAt: new Date().toISOString(),
  });

  return normalizeOnboardingState({
    courseId: "english",
    status: nextProgress.onboardingStatus,
    choice: nextProgress.onboardingChoice,
    completedAt: nextProgress.onboardingCompletedAt,
  });
};

export const ensureEnglishActiveCourseForUser = async (userId: string) => {
  if (!process.env.DATABASE_URL) return true;

  const englishCourse = await db.query.courses.findFirst({
    where: eq(courses.title, "Tiếng Anh"),
  });

  if (!englishCourse) return false;

  await db
    .insert(userProgress)
    .values({
      userId,
      activeCourseId: englishCourse.id,
      userName: "User",
      userImageSrc: "/mascot.svg",
    })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: {
        activeCourseId: englishCourse.id,
      },
    });

  return true;
};

export const getOnboardingStateForUser = async (userId: string) => {
  if (isRemoteApiMode()) {
    const response = await remoteApiRequest<{ onboarding: CourseOnboardingState }>(
      "/api/onboarding",
    );
    return response.onboarding;
  }

  const { progress, onboarding } = await getStateFromProgress(userId);

  if (
    onboarding.status !== "pending" &&
    !(onboarding.status === "completed" && onboarding.choice === null)
  ) {
    return onboarding;
  }

  const legacyActivity = await hasLegacyLearningActivity(userId);
  const migrated =
    onboarding.status === "completed"
      ? repairSpuriousLegacyCompletion(onboarding, legacyActivity)
      : migrateLegacyOnboardingState(onboarding, legacyActivity);

  if (migrated.status === onboarding.status) {
    return onboarding;
  }

  await ensureEnglishActiveCourseForUser(userId);
  const nextProgress = await saveCourseProgressForUser(userId, {
    ...progress,
    onboardingStatus: migrated.status,
    onboardingChoice: migrated.choice,
    onboardingCompletedAt: migrated.completedAt,
    updatedAt: new Date().toISOString(),
  });

  return normalizeOnboardingState({
    courseId: "english",
    status: nextProgress.onboardingStatus,
    choice: nextProgress.onboardingChoice,
    completedAt: nextProgress.onboardingCompletedAt,
  });
};

export const chooseBasicOnboardingForUser = async (userId: string) => {
  const current = await getOnboardingStateForUser(userId);

  if (current.status === "completed") {
    return current;
  }

  const next = completeBasicOnboarding(current);
  await ensureEnglishActiveCourseForUser(userId);
  return persistOnboardingState(userId, next);
};

export const startPlacementOnboardingForUser = async (userId: string) => {
  const current = await getOnboardingStateForUser(userId);

  if (current.status === "completed") {
    return current;
  }

  await ensureEnglishActiveCourseForUser(userId);
  return persistOnboardingState(userId, startPlacementOnboarding(current));
};

export const completePlacementOnboardingForUser = async (userId: string) => {
  const current = await getOnboardingStateForUser(userId);

  if (current.status === "completed") {
    return current;
  }

  const next = completePlacementOnboarding(current);
  await ensureEnglishActiveCourseForUser(userId);
  return persistOnboardingState(userId, next);
};
