import type { CourseProgressState } from "@/lib/courses/course-progress";

export type LearningCompletionRequest = {
  nodeId: string;
  accuracy: number;
  durationSeconds: number;
  afkCount: number;
  idempotencyKey: string;
};

export type LearningCompletionXpResult = {
  synced: boolean;
  pending: boolean;
  earnedXp: number;
  baseXp: number;
  accuracyBonus: number;
  totalXp: number | null;
  dailyXp: number | null;
  weeklyXp: number | null;
  level: number | null;
  alreadyClaimed: boolean;
  isPassed: boolean;
  rewardType: string | null;
  currentDay: string | null;
  currentWeekStart: string | null;
  message: string | null;
};

export type LearningCompletionStreakResult = {
  synced: boolean;
  pending: boolean;
  status: string | null;
  currentStreak: number | null;
  longestStreak: number | null;
  streakFreezes: number | null;
  missedDays: number;
  usedStreakFreezes: number;
};

export type LearningCompletionQuestResult = {
  synced: boolean;
  pending: boolean;
  skipped: boolean;
  code: string | null;
};

export type LearningCompletionResult = {
  success: true;
  syncStatus: "complete" | "partial" | "skipped";
  pendingSystems: Array<"xp" | "streak" | "quests">;
  recovery?: {
    durable: boolean;
    queuedSystems: Array<"xp" | "quest" | "streak">;
  };
  nodeId: string;
  nodeType: "lesson" | "checkpoint";
  accuracy: number;
  passThreshold: number;
  passed: boolean;
  alreadyCompleted: boolean;
  progressUpdated: boolean;
  progressReason: string;
  progress: CourseProgressState;
  unlockedSectionId?: string;
  xp: LearningCompletionXpResult;
  streak: LearningCompletionStreakResult;
  quests: LearningCompletionQuestResult;
};
