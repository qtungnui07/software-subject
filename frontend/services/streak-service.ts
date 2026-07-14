import "server-only";

import {
  getDailyStreakLog,
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
  studyMinutes?: number;
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
  studyMinutesToday: number;
  requiredStudyMinutes: number;
};

const MIN_STREAK_STUDY_MINUTES = 15;

export const recordLearningStreak = async ({
  userId,
  nodeId,
  earnedXp,
  completedLessons = 1,
  studyMinutes = 0,
}: RecordLearningStreakInput): Promise<RecordLearningStreakResult> => {
  const reward = normalizeLessonStreakReward({
    completedLessons,
    earnedXp,
  });
  const currentStreak = await getUserStreak(userId);
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_STREAK_TIME_ZONE,
  }).format(new Date());
  const previousDailyLog = await getDailyStreakLog(userId, todayDate);
  const previousStudyMinutes = previousDailyLog?.studyMinutes ?? 0;
  const normalizedStudyMinutes = Math.max(0, Math.trunc(studyMinutes));
  const dailyLog = await upsertDailyStreakLog({
    userId,
    studyDate: todayDate,
    completedLessons: reward.completedLessons,
    earnedXp: reward.earnedXp,
    studyMinutes: normalizedStudyMinutes,
  });

  if (dailyLog.studyMinutes < MIN_STREAK_STUDY_MINUTES) {
    return {
      nodeId,
      status: "already_completed_today",
      message: `Cần học đủ ${MIN_STREAK_STUDY_MINUTES} phút trong ngày để tính streak.`,
      didIncrease: false,
      didReset: false,
      wasProtected: false,
      currentStreak: currentStreak?.currentStreak ?? 0,
      longestStreak: currentStreak?.longestStreak ?? 0,
      streakFreezes: currentStreak?.streakFreezes ?? 0,
      missedDays: 0,
      usedStreakFreezes: 0,
      todayDate,
      lastStudyDate: currentStreak?.lastStudyDate ?? null,
      completedLessonsToday: dailyLog.completedLessons,
      earnedXpToday: dailyLog.earnedXp,
      studyMinutesToday: dailyLog.studyMinutes,
      requiredStudyMinutes: MIN_STREAK_STUDY_MINUTES,
    };
  }

  if (previousStudyMinutes >= MIN_STREAK_STUDY_MINUTES) {
    return {
      nodeId,
      status: "already_completed_today",
      message: "Bạn đã duy trì streak hôm nay.",
      didIncrease: false,
      didReset: false,
      wasProtected: false,
      currentStreak: currentStreak?.currentStreak ?? 0,
      longestStreak: currentStreak?.longestStreak ?? 0,
      streakFreezes: currentStreak?.streakFreezes ?? 0,
      missedDays: 0,
      usedStreakFreezes: 0,
      todayDate,
      lastStudyDate: currentStreak?.lastStudyDate ?? null,
      completedLessonsToday: dailyLog.completedLessons,
      earnedXpToday: dailyLog.earnedXp,
      studyMinutesToday: dailyLog.studyMinutes,
      requiredStudyMinutes: MIN_STREAK_STUDY_MINUTES,
    };
  }

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
    studyMinutesToday: dailyLog.studyMinutes,
    requiredStudyMinutes: MIN_STREAK_STUDY_MINUTES,
  };
};
