import type {
  LearningCompletionQuestResult,
  LearningCompletionStreakResult,
  LearningCompletionXpResult,
} from "@/types/learning-completion";

export const createPendingXpResult = (
  message = "XP đang chờ đồng bộ.",
): LearningCompletionXpResult => ({
  synced: false,
  pending: true,
  earnedXp: 0,
  baseXp: 0,
  accuracyBonus: 0,
  totalXp: null,
  dailyXp: null,
  weeklyXp: null,
  level: null,
  alreadyClaimed: false,
  isPassed: false,
  rewardType: null,
  currentDay: null,
  currentWeekStart: null,
  message,
});

export const createSkippedXpResult = (
  message: string | null = null,
): LearningCompletionXpResult => ({
  synced: true,
  pending: false,
  earnedXp: 0,
  baseXp: 0,
  accuracyBonus: 0,
  totalXp: null,
  dailyXp: null,
  weeklyXp: null,
  level: null,
  alreadyClaimed: false,
  isPassed: false,
  rewardType: null,
  currentDay: null,
  currentWeekStart: null,
  message,
});

export const createPendingStreakResult = (): LearningCompletionStreakResult => ({
  synced: false,
  pending: true,
  status: null,
  currentStreak: null,
  longestStreak: null,
  streakFreezes: null,
  missedDays: 0,
  usedStreakFreezes: 0,
});

export const createSkippedStreakResult = (): LearningCompletionStreakResult => ({
  synced: true,
  pending: false,
  status: null,
  currentStreak: null,
  longestStreak: null,
  streakFreezes: null,
  missedDays: 0,
  usedStreakFreezes: 0,
});

export const createPendingQuestResult = (): LearningCompletionQuestResult => ({
  synced: false,
  pending: true,
  skipped: false,
  code: "QUEST_PROGRESS_RECORD_FAILED",
});

export const createSkippedQuestResult = (
  code: string | null,
): LearningCompletionQuestResult => ({
  synced: true,
  pending: false,
  skipped: true,
  code,
});
