import "server-only";

import {
  getUserStreak,
  upsertDailyStreakLog,
  upsertUserStreak,
} from "@/db/queries";
import {
  calculateNextStreak,
  DEFAULT_STREAK_TIME_ZONE,
  normalizeLessonStreakReward,
} from "@/lib/streak";

export type RecordLearningStreakInput = {
  userId: string;
  nodeId: string;
  earnedXp: number;
  completedLessons?: number;
};

export type RecordLearningStreakResult = {
  nodeId: string;
  status: ReturnType<typeof calculateNextStreak>["status"];
  message: string;
  didIncrease: boolean;
  didReset: boolean;
  wasProtected: boolean;
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  missedDays: number;
  usedStreakFreezes: number;
  todayDate: string;
  lastStudyDate: string | null;
  completedLessonsToday: number;
  earnedXpToday: number;
};

export const recordLearningStreak = async ({
  userId,
  nodeId,
  earnedXp,
  completedLessons = 1,
}: RecordLearningStreakInput): Promise<RecordLearningStreakResult> => {
  const reward = normalizeLessonStreakReward({
    completedLessons,
    earnedXp,
  });
  const currentStreak = await getUserStreak(userId);
  const nextStreak = calculateNextStreak({
    currentStreak: currentStreak?.currentStreak ?? 0,
    longestStreak: currentStreak?.longestStreak ?? 0,
    streakFreezes: currentStreak?.streakFreezes ?? 0,
    lastStudyDate: currentStreak?.lastStudyDate ?? null,
    today: new Date(),
    timeZone: DEFAULT_STREAK_TIME_ZONE,
  });

  const updatedStreak = await upsertUserStreak({
    userId,
    currentStreak: nextStreak.nextCurrentStreak,
    longestStreak: nextStreak.nextLongestStreak,
    streakFreezes: nextStreak.nextStreakFreezes,
    lastStudyDate: nextStreak.nextLastStudyDate,
  });
  const dailyLog = await upsertDailyStreakLog({
    userId,
    studyDate: nextStreak.todayDate,
    completedLessons: reward.completedLessons,
    earnedXp: reward.earnedXp,
  });

  return {
    nodeId,
    status: nextStreak.status,
    message: nextStreak.message,
    didIncrease: nextStreak.didIncrease,
    didReset: nextStreak.didReset,
    wasProtected: nextStreak.wasProtected,
    currentStreak: updatedStreak.currentStreak,
    longestStreak: updatedStreak.longestStreak,
    streakFreezes: updatedStreak.streakFreezes,
    missedDays: nextStreak.missedDays,
    usedStreakFreezes: nextStreak.usedStreakFreezes,
    todayDate: nextStreak.todayDate,
    lastStudyDate: updatedStreak.lastStudyDate,
    completedLessonsToday: dailyLog.completedLessons,
    earnedXpToday: dailyLog.earnedXp,
  };
};
