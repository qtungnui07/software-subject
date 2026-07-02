import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { bonusQuestDefinitions, dailyQuestDefinitions } from "@/constants/quests";
import db from "@/db/drizzle";
import {
  questDailyStats,
  questRewardClaims,
  userProgress,
  userXpSummary,
  xpEvents,
} from "@/db/schema";
import {
  getCompletedQuestCount,
  resolveBonusQuests,
  resolveDailyQuests,
} from "@/lib/quests/quest-utils";
import type {
  ResolvedQuest,
  UserQuestSnapshot,
  WeekActivityDay,
} from "@/types/quest";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DAILY_PERFECT_CHEST_ID = "daily-perfect-chest";
export const DAILY_PERFECT_CHEST_REWARD_XP = 30;
export const DAILY_QUEST_REWARD_XP = 10;

const SHOULD_LOG_QUEST_SERVICE =
  process.env.NEXT_PUBLIC_SHOW_QUEST_DEBUG === "true";

const logQuestServiceWarning = (message: string, error: unknown) => {
  if (!SHOULD_LOG_QUEST_SERVICE) return;

  console.warn(message, error);
};

export type QuestTodayStats = {
  lessonsCompleted: number;
  xpEarned: number;
  minutesLearned: number;
  bestAccuracy: number;
};

export type QuestChestStatus = {
  id: typeof DAILY_PERFECT_CHEST_ID;
  status: "locked" | "ready" | "claimed";
  rewardXp: number;
  canClaim: boolean;
};

export type QuestTodaySnapshot = {
  date: string;
  dailyCompleted: number;
  dailyTotal: number;
  stats: QuestTodayStats;
  quests: ResolvedQuest[];
  bonusQuests: ResolvedQuest[];
  chest: QuestChestStatus;
  currentStreak: number;
  nextResetAt: string;
  snapshot: UserQuestSnapshot;
  claimedQuestIds: string[];
};

export type QuestServiceSource = "db" | "unavailable";

export type QuestTodayStateResult = {
  source: QuestServiceSource;
  date: string;
  stats: QuestTodayStats;
  claimedQuestIds: string[];
  weekActivity: WeekActivityDay[];
  today: QuestTodaySnapshot;
  snapshot: UserQuestSnapshot;
  hasPersistedStats: boolean;
  hasPersistedClaims: boolean;
};

type GetTodayQuestStatsInput = {
  userId: string;
  dateKey?: string;
};

type GetTodayRewardClaimsInput = {
  userId: string;
  dateKey?: string;
};

type GetRecentQuestWeekActivityInput = {
  userId: string;
  todayKey?: string;
  limit?: number;
};

type GetQuestTodayStateInput = {
  userId: string;
  currentStreak?: number;
  dateKey?: string;
};

export type QuestRewardClaimKind = "quest" | "chest";

export type ClaimQuestRewardInput = {
  userId: string;
  userName?: string | null;
  userImageSrc?: string | null;
  questId: string;
  dateKey?: string;
};

export type ClaimChestRewardInput = {
  userId: string;
  userName?: string | null;
  userImageSrc?: string | null;
  dateKey?: string;
};

export type RecordQuestLessonProgressInput = {
  userId: string;
  earnedXp: number;
  accuracy?: number | null;
  durationSeconds?: number | null;
  dateKey?: string;
};

export type RecordQuestLessonProgressResult = {
  success: true;
  skipped: boolean;
  code?: string;
  date: string;
  stats: QuestTodayStats;
};

type QuestRewardXpState = {
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  currentDay: string | null;
  currentWeekStart: string | null;
};

export type ClaimQuestRewardResult = {
  success: true;
  alreadyClaimed: boolean;
  questId: string;
  rewardType: QuestRewardClaimKind;
  rewardXp: number;
  reward: {
    xp: number;
  };
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  currentDay: string;
  currentWeekStart: string;
  today: QuestTodaySnapshot;
};

export class QuestServiceError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "QuestServiceError";
    this.code = code;
    this.status = status;
  }
}

export const isQuestServiceError = (error: unknown): error is QuestServiceError => {
  return error instanceof QuestServiceError;
};

const emptyQuestTodayStats: QuestTodayStats = {
  lessonsCompleted: 0,
  xpEarned: 0,
  minutesLearned: 0,
  bestAccuracy: 0,
};

const toSafeNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.trunc(parsed));
    }
  }

  return fallback;
};

const formatDateInTimeZone = (date: Date, timeZone: string) => {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format quest date key.");
  }

  return `${year}-${month}-${day}`;
};

const parseDateKeyParts = (dateKey: string) => {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}. Expected YYYY-MM-DD.`);
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return { year, month, day };
};

const dateKeyToVietnamMidnightUtc = (dateKey: string) => {
  const { year, month, day } = parseDateKeyParts(dateKey);
  const utcMidnight = Date.UTC(year, month - 1, day);
  const offsetMs = VIETNAM_UTC_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMidnight - offsetMs);
};

export const getVietnamDateKey = (date = new Date()) => {
  return formatDateInTimeZone(date, VIETNAM_TIME_ZONE);
};

export const shiftDateKey = (dateKey: string, offsetDays: number) => {
  const { year, month, day } = parseDateKeyParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + offsetDays));

  return date.toISOString().slice(0, 10);
};

export const getNextVietnamMidnight = (date = new Date()) => {
  const todayKey = getVietnamDateKey(date);
  const nextDateKey = shiftDateKey(todayKey, 1);

  return dateKeyToVietnamMidnightUtc(nextDateKey);
};

export const getVietnamWeekStartKey = (date = new Date()) => {
  const todayKey = getVietnamDateKey(date);
  const { year, month, day } = parseDateKeyParts(todayKey);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = utcDate.getUTCDay();
  const distanceFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;

  utcDate.setUTCDate(utcDate.getUTCDate() - distanceFromMonday);

  return utcDate.toISOString().slice(0, 10);
};

const normalizeDateKey = (value: unknown) => {
  if (typeof value === "string") {
    const dateKey = value.slice(0, 10);

    return DATE_KEY_PATTERN.test(dateKey) ? dateKey : null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return null;
};

const getWeekdayLabel = (dateKey: string) => {
  const { year, month, day } = parseDateKeyParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = date.getUTCDay();

  if (dayIndex === 0) return "CN";

  return `T${dayIndex + 1}`;
};

export const buildEmptyWeekActivity = (todayKey = getVietnamDateKey()): WeekActivityDay[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = shiftDateKey(todayKey, index - 6);

    return {
      day: getWeekdayLabel(dateKey),
      completed: false,
    };
  });
};

const toQuestTodayStats = (row: any | null | undefined): QuestTodayStats => {
  if (!row) {
    return { ...emptyQuestTodayStats };
  }

  return {
    lessonsCompleted: toSafeNumber(row.lessonsCompleted, 0),
    xpEarned: toSafeNumber(row.xpEarned, 0),
    minutesLearned: toSafeNumber(row.minutesLearned, 0),
    bestAccuracy: Math.min(toSafeNumber(row.bestAccuracy, 0), 100),
  };
};

const canReadQuestDailyStats = () => {
  return Boolean(process.env.DATABASE_URL);
};

const canReadQuestDailyStatsList = () => {
  return Boolean(process.env.DATABASE_URL);
};

const canReadQuestRewardClaims = () => {
  return Boolean(process.env.DATABASE_URL);
};

const canReadQuestRewardClaim = () => {
  return Boolean(process.env.DATABASE_URL);
};

export const isQuestPersistenceAvailable = () => {
  return Boolean(process.env.DATABASE_URL);
};

export const isQuestProgressWriteAvailable = () => {
  return Boolean(process.env.DATABASE_URL);
};

export const getTodayQuestStats = async ({
  userId,
  dateKey = getVietnamDateKey(),
}: GetTodayQuestStatsInput): Promise<{
  source: QuestServiceSource;
  stats: QuestTodayStats;
  exists: boolean;
}> => {
  if (!canReadQuestDailyStats()) {
    return {
      source: "unavailable",
      stats: { ...emptyQuestTodayStats },
      exists: false,
    };
  }

  try {
    const row = await db.query.questDailyStats.findFirst({
      where: and(
        eq(questDailyStats.userId, userId),
        eq(questDailyStats.statDate, dateKey),
      ),
    });

    return {
      source: "db",
      stats: toQuestTodayStats(row),
      exists: Boolean(row),
    };
  } catch (error) {
    logQuestServiceWarning(
      "Robogo quests could not load quest daily stats. Using empty stats safely.",
      error,
    );

    return {
      source: "unavailable",
      stats: { ...emptyQuestTodayStats },
      exists: false,
    };
  }
};

export const getTodayRewardClaims = async ({
  userId,
  dateKey = getVietnamDateKey(),
}: GetTodayRewardClaimsInput): Promise<{
  source: QuestServiceSource;
  claimedQuestIds: string[];
}> => {
  if (!canReadQuestRewardClaims()) {
    return {
      source: "unavailable",
      claimedQuestIds: [],
    };
  }

  try {
    const rows = await db.query.questRewardClaims.findMany({
      where: and(
        eq(questRewardClaims.userId, userId),
        eq(questRewardClaims.claimDate, dateKey),
      ),
    });

    return {
      source: "db",
      claimedQuestIds: rows
        .map((row: any) => (typeof row.questId === "string" ? row.questId : ""))
        .filter(Boolean),
    };
  } catch (error) {
    logQuestServiceWarning(
      "Robogo quests could not load quest reward claims. Using empty claims safely.",
      error,
    );

    return {
      source: "unavailable",
      claimedQuestIds: [],
    };
  }
};

export const getRecentQuestWeekActivity = async ({
  userId,
  todayKey = getVietnamDateKey(),
  limit = 7,
}: GetRecentQuestWeekActivityInput): Promise<{
  source: QuestServiceSource;
  weekActivity: WeekActivityDay[];
  hasActivity: boolean;
}> => {
  if (!canReadQuestDailyStatsList()) {
    return {
      source: "unavailable",
      weekActivity: buildEmptyWeekActivity(todayKey),
      hasActivity: false,
    };
  }

  try {
    const rows = await db.query.questDailyStats.findMany({
      where: eq(questDailyStats.userId, userId),
      orderBy: desc(questDailyStats.statDate),
      limit,
    });

    const completedByDate = new Map<string, boolean>();

    rows.forEach((row: any) => {
      const dateKey = normalizeDateKey(row.statDate);

      if (!dateKey) return;

      completedByDate.set(dateKey, toSafeNumber(row.lessonsCompleted, 0) > 0);
    });

    const weekActivity = Array.from({ length: 7 }, (_, index) => {
      const dateKey = shiftDateKey(todayKey, index - 6);

      return {
        day: getWeekdayLabel(dateKey),
        completed: completedByDate.get(dateKey) ?? false,
      };
    });

    return {
      source: "db",
      weekActivity,
      hasActivity: weekActivity.some((day) => day.completed),
    };
  } catch (error) {
    logQuestServiceWarning(
      "Robogo quests could not load quest week activity. Using empty week safely.",
      error,
    );

    return {
      source: "unavailable",
      weekActivity: buildEmptyWeekActivity(todayKey),
      hasActivity: false,
    };
  }
};

const normalizeClaimedQuestIds = (claimedQuestIds: string[]) => {
  return Array.from(
    new Set(
      claimedQuestIds
        .map((questId) => questId.trim())
        .filter(Boolean),
    ),
  );
};

const normalizeQuestClaimState = (quest: ResolvedQuest): ResolvedQuest => {
  return {
    ...quest,
    canClaim: quest.status === "completed",
  };
};

export const getChestStatus = ({
  dailyCompleted,
  dailyTotal,
  claimedQuestIds,
}: {
  dailyCompleted: number;
  dailyTotal: number;
  claimedQuestIds: string[];
}): QuestChestStatus => {
  const chestClaimed = claimedQuestIds.includes(DAILY_PERFECT_CHEST_ID);
  const perfectDayCompleted = dailyTotal > 0 && dailyCompleted >= dailyTotal;
  const status: QuestChestStatus["status"] = !perfectDayCompleted
    ? "locked"
    : chestClaimed
      ? "claimed"
      : "ready";

  return {
    id: DAILY_PERFECT_CHEST_ID,
    status,
    rewardXp: DAILY_PERFECT_CHEST_REWARD_XP,
    canClaim: status === "ready",
  };
};

export const buildQuestTodaySnapshot = ({
  date = getVietnamDateKey(),
  stats = emptyQuestTodayStats,
  claimedQuestIds = [],
  currentStreak = 0,
}: {
  date?: string;
  stats?: QuestTodayStats;
  claimedQuestIds?: string[];
  currentStreak?: number;
}): QuestTodaySnapshot => {
  const normalizedClaimedQuestIds = normalizeClaimedQuestIds(claimedQuestIds);
  const normalizedStats: QuestTodayStats = {
    lessonsCompleted: toSafeNumber(stats.lessonsCompleted, 0),
    xpEarned: toSafeNumber(stats.xpEarned, 0),
    minutesLearned: toSafeNumber(stats.minutesLearned, 0),
    bestAccuracy: Math.min(toSafeNumber(stats.bestAccuracy, 0), 100),
  };
  const snapshot: UserQuestSnapshot = {
    lessonsCompletedToday: normalizedStats.lessonsCompleted,
    bestAccuracyToday: normalizedStats.bestAccuracy,
    minutesLearnedToday: normalizedStats.minutesLearned,
    xpEarnedToday: normalizedStats.xpEarned,
    currentStreak: toSafeNumber(currentStreak, 0),
    claimedQuestIds: normalizedClaimedQuestIds,
  };

  const quests = resolveDailyQuests(dailyQuestDefinitions, snapshot).map(
    normalizeQuestClaimState,
  );
  const bonusQuests = resolveBonusQuests(
    bonusQuestDefinitions,
    snapshot,
    quests,
  ).map(normalizeQuestClaimState);
  const dailyCompleted = getCompletedQuestCount(quests);
  const dailyTotal = quests.length;
  const chest = getChestStatus({
    dailyCompleted,
    dailyTotal,
    claimedQuestIds: normalizedClaimedQuestIds,
  });

  return {
    date,
    dailyCompleted,
    dailyTotal,
    stats: normalizedStats,
    quests,
    bonusQuests,
    chest,
    currentStreak: snapshot.currentStreak,
    nextResetAt: getNextVietnamMidnight().toISOString(),
    snapshot,
    claimedQuestIds: normalizedClaimedQuestIds,
  };
};


const secondsToWholeMinutes = (durationSeconds: unknown) => {
  const seconds = toSafeNumber(durationSeconds, 0);

  if (seconds <= 0) {
    return 0;
  }

  return Math.floor(seconds / 60);
};

export const recordQuestLessonProgress = async ({
  userId,
  earnedXp,
  accuracy = 0,
  durationSeconds = 0,
  dateKey = getVietnamDateKey(),
}: RecordQuestLessonProgressInput): Promise<RecordQuestLessonProgressResult> => {
  if (!isQuestProgressWriteAvailable()) {
    return {
      success: true,
      skipped: true,
      code: "QUEST_DATABASE_UNAVAILABLE",
      date: dateKey,
      stats: { ...emptyQuestTodayStats },
    };
  }

  const normalizedEarnedXp = toSafeNumber(earnedXp, 0);
  const normalizedAccuracy = Math.min(toSafeNumber(accuracy, 0), 100);
  const minutesLearned = secondsToWholeMinutes(durationSeconds);

  try {
    await db
      .insert(questDailyStats)
      .values({
        userId,
        statDate: dateKey,
        lessonsCompleted: 1,
        xpEarned: normalizedEarnedXp,
        minutesLearned,
        bestAccuracy: normalizedAccuracy,
      })
      .onConflictDoUpdate({
        target: [questDailyStats.userId, questDailyStats.statDate],
        set: {
          lessonsCompleted: sql`${questDailyStats.lessonsCompleted} + 1`,
          xpEarned: sql`${questDailyStats.xpEarned} + ${normalizedEarnedXp}`,
          minutesLearned: sql`${questDailyStats.minutesLearned} + ${minutesLearned}`,
          bestAccuracy: sql`GREATEST(${questDailyStats.bestAccuracy}, ${normalizedAccuracy})`,
          updatedAt: new Date(),
        },
      });

    const statsResult = await getTodayQuestStats({
      userId,
      dateKey,
    });

    return {
      success: true,
      skipped: false,
      date: dateKey,
      stats: statsResult.stats,
    };
  } catch (error) {
    logQuestServiceWarning(
      "Robogo quests could not record lesson progress. Lesson completion remains valid.",
      error,
    );

    return {
      success: true,
      skipped: true,
      code: "QUEST_PROGRESS_RECORD_FAILED",
      date: dateKey,
      stats: { ...emptyQuestTodayStats },
    };
  }
};


const getRewardXp = (value: unknown) => {
  return toSafeNumber(value, 0);
};

const insertQuestRewardClaimAtomically = async ({
  tx,
  input,
  questId,
  rewardType,
  rewardXp,
  todayKey,
}: {
  tx: any;
  input: Pick<ClaimQuestRewardInput, "userId">;
  questId: string;
  rewardType: QuestRewardClaimKind;
  rewardXp: number;
  todayKey: string;
}) => {
  const insertedRows = await tx
    .insert(questRewardClaims)
    .values({
      userId: input.userId,
      questId,
      claimDate: todayKey,
      rewardType,
      rewardXp,
    })
    .onConflictDoNothing({
      target: [
        questRewardClaims.userId,
        questRewardClaims.questId,
        questRewardClaims.claimDate,
      ],
    })
    .returning({ id: questRewardClaims.id });

  return insertedRows.length > 0;
};

const buildRewardXpState = ({
  currentState,
  rewardXp,
  todayKey,
  weekStartKey,
}: {
  currentState: QuestRewardXpState;
  rewardXp: number;
  todayKey: string;
  weekStartKey: string;
}): QuestRewardXpState => {
  const shouldResetDaily = currentState.currentDay !== todayKey;
  const shouldResetWeekly = currentState.currentWeekStart !== weekStartKey;

  return {
    totalXp: toSafeNumber(currentState.totalXp, 0) + rewardXp,
    dailyXp: (shouldResetDaily ? 0 : toSafeNumber(currentState.dailyXp, 0)) + rewardXp,
    weeklyXp: (shouldResetWeekly ? 0 : toSafeNumber(currentState.weeklyXp, 0)) + rewardXp,
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
  };
};

const getCurrentQuestRewardXpState = async ({
  tx,
  userId,
  todayKey,
  weekStartKey,
}: {
  tx: any;
  userId: string;
  todayKey: string;
  weekStartKey: string;
}): Promise<QuestRewardXpState> => {
  const [summary, progress] = await Promise.all([
    tx.query.userXpSummary.findFirst({
      where: eq(userXpSummary.userId, userId),
    }),
    tx.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    }),
  ]);

  const summaryDay = normalizeDateKey(summary?.currentDay);
  const summaryWeekStart = normalizeDateKey(summary?.currentWeekStart);

  return {
    totalXp: toSafeNumber(summary?.totalXp ?? progress?.points ?? 0, 0),
    dailyXp: summaryDay === todayKey ? toSafeNumber(summary?.dailyXp, 0) : 0,
    weeklyXp: summaryWeekStart === weekStartKey ? toSafeNumber(summary?.weeklyXp, 0) : 0,
    currentDay: summaryDay,
    currentWeekStart: summaryWeekStart,
  };
};

const upsertQuestRewardXpSummary = async ({
  tx,
  userId,
  nextState,
}: {
  tx: any;
  userId: string;
  nextState: QuestRewardXpState;
}) => {
  await tx
    .insert(userXpSummary)
    .values({
      userId,
      totalXp: nextState.totalXp,
      dailyXp: nextState.dailyXp,
      weeklyXp: nextState.weeklyXp,
      currentDay: nextState.currentDay,
      currentWeekStart: nextState.currentWeekStart,
    })
    .onConflictDoUpdate({
      target: userXpSummary.userId,
      set: {
        totalXp: nextState.totalXp,
        dailyXp: nextState.dailyXp,
        weeklyXp: nextState.weeklyXp,
        currentDay: nextState.currentDay,
        currentWeekStart: nextState.currentWeekStart,
        updatedAt: new Date(),
      },
    });
};

const upsertQuestRewardUserProgress = async ({
  tx,
  userId,
  userName,
  userImageSrc,
  nextTotalXp,
}: {
  tx: any;
  userId: string;
  userName?: string | null;
  userImageSrc?: string | null;
  nextTotalXp: number;
}) => {
  await tx
    .insert(userProgress)
    .values({
      userId,
      userName: userName?.trim() || "User",
      userImageSrc: userImageSrc?.trim() || "/mascot.svg",
      points: nextTotalXp,
    })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: {
        points: nextTotalXp,
        userName: userName?.trim() || "User",
        userImageSrc: userImageSrc?.trim() || "/mascot.svg",
      },
    });
};

const insertQuestRewardXpEvent = async ({
  tx,
  userId,
  questId,
  rewardXp,
  rewardType,
  todayKey,
  weekStartKey,
}: {
  tx: any;
  userId: string;
  questId: string;
  rewardXp: number;
  rewardType: "quest_reward" | "quest_chest";
  todayKey: string;
  weekStartKey: string;
}) => {
  await tx.insert(xpEvents).values({
    userId,
    lessonId: `quest:${questId}`,
    earnedXp: rewardXp,
    baseXp: rewardXp,
    accuracyBonus: 0,
    accuracy: 0,
    rewardType,
    eventDate: todayKey,
    weekStart: weekStartKey,
  });
};

const getClaimedQuestIdsInTransaction = async ({
  tx,
  userId,
  dateKey,
}: {
  tx: any;
  userId: string;
  dateKey: string;
}) => {
  const rows = await tx.query.questRewardClaims.findMany({
    where: and(
      eq(questRewardClaims.userId, userId),
      eq(questRewardClaims.claimDate, dateKey),
    ),
  });

  return rows
    .map((row: any) => (typeof row.questId === "string" ? row.questId : ""))
    .filter(Boolean);
};

const getQuestStatsInTransaction = async ({
  tx,
  userId,
  dateKey,
}: {
  tx: any;
  userId: string;
  dateKey: string;
}) => {
  const row = await tx.query.questDailyStats.findFirst({
    where: and(
      eq(questDailyStats.userId, userId),
      eq(questDailyStats.statDate, dateKey),
    ),
  });

  return toQuestTodayStats(row);
};

const buildAlreadyClaimedResponse = async ({
  tx,
  input,
  questId,
  rewardType,
  todayKey,
  weekStartKey,
  today,
}: {
  tx: any;
  input: Pick<ClaimQuestRewardInput, "userId">;
  questId: string;
  rewardType: QuestRewardClaimKind;
  todayKey: string;
  weekStartKey: string;
  today: QuestTodaySnapshot;
}): Promise<ClaimQuestRewardResult> => {
  const currentState = await getCurrentQuestRewardXpState({
    tx,
    userId: input.userId,
    todayKey,
    weekStartKey,
  });

  return {
    success: true,
    alreadyClaimed: true,
    questId,
    rewardType,
    rewardXp: 0,
    reward: { xp: 0 },
    totalXp: currentState.totalXp,
    dailyXp: currentState.dailyXp,
    weeklyXp: currentState.weeklyXp,
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
    today,
  };
};

const persistQuestRewardClaim = async ({
  tx,
  input,
  questId,
  rewardType,
  rewardXp,
  todayKey,
  weekStartKey,
  xpRewardType,
  today,
}: {
  tx: any;
  input: Pick<ClaimQuestRewardInput, "userId" | "userName" | "userImageSrc">;
  questId: string;
  rewardType: QuestRewardClaimKind;
  rewardXp: number;
  todayKey: string;
  weekStartKey: string;
  xpRewardType: "quest_reward" | "quest_chest";
  today: QuestTodaySnapshot;
}): Promise<ClaimQuestRewardResult> => {
  const currentState = await getCurrentQuestRewardXpState({
    tx,
    userId: input.userId,
    todayKey,
    weekStartKey,
  });
  const nextState = buildRewardXpState({
    currentState,
    rewardXp,
    todayKey,
    weekStartKey,
  });

  const insertedClaim = await insertQuestRewardClaimAtomically({
    tx,
    input,
    questId,
    rewardType,
    rewardXp,
    todayKey,
  });

  if (!insertedClaim) {
    return buildAlreadyClaimedResponse({
      tx,
      input,
      questId,
      rewardType,
      todayKey,
      weekStartKey,
      today,
    });
  }

  await upsertQuestRewardXpSummary({
    tx,
    userId: input.userId,
    nextState,
  });
  await upsertQuestRewardUserProgress({
    tx,
    userId: input.userId,
    userName: input.userName,
    userImageSrc: input.userImageSrc,
    nextTotalXp: nextState.totalXp,
  });
  await insertQuestRewardXpEvent({
    tx,
    userId: input.userId,
    questId,
    rewardXp,
    rewardType: xpRewardType,
    todayKey,
    weekStartKey,
  });

  const updatedToday = buildQuestTodaySnapshot({
    date: today.date,
    stats: today.stats,
    claimedQuestIds: [...today.claimedQuestIds, questId],
    currentStreak: today.currentStreak,
  });

  return {
    success: true,
    alreadyClaimed: false,
    questId,
    rewardType,
    rewardXp,
    reward: { xp: rewardXp },
    totalXp: nextState.totalXp,
    dailyXp: nextState.dailyXp,
    weeklyXp: nextState.weeklyXp,
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
    today: updatedToday,
  };
};

export const claimDailyQuestReward = async ({
  dateKey = getVietnamDateKey(),
  ...input
}: ClaimQuestRewardInput): Promise<ClaimQuestRewardResult> => {
  if (!isQuestPersistenceAvailable()) {
    throw new QuestServiceError(
      "QUEST_DATABASE_UNAVAILABLE",
      "Quest database is not available. Reward claim requires a real database.",
      503,
    );
  }

  const questId = input.questId.trim();

  if (!questId) {
    throw new QuestServiceError("QUEST_ID_REQUIRED", "questId is required", 400);
  }

  const weekStartKey = getVietnamWeekStartKey(dateKeyToVietnamMidnightUtc(dateKey));

  return db.transaction(async (tx: any) => {
    const [stats, claimedQuestIds] = await Promise.all([
      getQuestStatsInTransaction({ tx, userId: input.userId, dateKey }),
      getClaimedQuestIdsInTransaction({ tx, userId: input.userId, dateKey }),
    ]);
    const today = buildQuestTodaySnapshot({
      date: dateKey,
      stats,
      claimedQuestIds,
    });
    const quest = today.quests.find((item) => item.id === questId);

    if (!quest) {
      throw new QuestServiceError("QUEST_NOT_FOUND", "Quest does not exist.", 404);
    }

    if (quest.status === "claimed" || claimedQuestIds.includes(questId)) {
      return buildAlreadyClaimedResponse({
        tx,
        input,
        questId,
        rewardType: "quest",
        todayKey: dateKey,
        weekStartKey,
        today,
      });
    }

    if (quest.status !== "completed") {
      throw new QuestServiceError(
        "QUEST_NOT_COMPLETED",
        "Quest is not completed yet.",
        403,
      );
    }

    const rewardXp = getRewardXp(quest.reward.xpAmount ?? DAILY_QUEST_REWARD_XP);

    if (rewardXp <= 0) {
      throw new QuestServiceError("QUEST_REWARD_INVALID", "Quest reward is invalid.", 400);
    }

    return persistQuestRewardClaim({
      tx,
      input,
      questId,
      rewardType: "quest",
      rewardXp,
      todayKey: dateKey,
      weekStartKey,
      xpRewardType: "quest_reward",
      today,
    });
  });
};

export const claimDailyChestReward = async ({
  dateKey = getVietnamDateKey(),
  ...input
}: ClaimChestRewardInput): Promise<ClaimQuestRewardResult> => {
  if (!isQuestPersistenceAvailable()) {
    throw new QuestServiceError(
      "QUEST_DATABASE_UNAVAILABLE",
      "Quest database is not available. Chest claim requires a real database.",
      503,
    );
  }

  const weekStartKey = getVietnamWeekStartKey(dateKeyToVietnamMidnightUtc(dateKey));

  return db.transaction(async (tx: any) => {
    const [stats, claimedQuestIds] = await Promise.all([
      getQuestStatsInTransaction({ tx, userId: input.userId, dateKey }),
      getClaimedQuestIdsInTransaction({ tx, userId: input.userId, dateKey }),
    ]);
    const today = buildQuestTodaySnapshot({
      date: dateKey,
      stats,
      claimedQuestIds,
    });

    if (today.chest.status === "claimed") {
      return buildAlreadyClaimedResponse({
        tx,
        input,
        questId: DAILY_PERFECT_CHEST_ID,
        rewardType: "chest",
        todayKey: dateKey,
        weekStartKey,
        today,
      });
    }

    if (today.chest.status !== "ready") {
      throw new QuestServiceError("CHEST_NOT_READY", "Chest is not ready yet.", 403);
    }

    return persistQuestRewardClaim({
      tx,
      input,
      questId: DAILY_PERFECT_CHEST_ID,
      rewardType: "chest",
      rewardXp: DAILY_PERFECT_CHEST_REWARD_XP,
      todayKey: dateKey,
      weekStartKey,
      xpRewardType: "quest_chest",
      today,
    });
  });
};

export const getQuestTodayState = async ({
  userId,
  currentStreak = 0,
  dateKey = getVietnamDateKey(),
}: GetQuestTodayStateInput): Promise<QuestTodayStateResult> => {
  const [statsResult, claimsResult, weekResult] = await Promise.all([
    getTodayQuestStats({ userId, dateKey }),
    getTodayRewardClaims({ userId, dateKey }),
    getRecentQuestWeekActivity({ userId, todayKey: dateKey }),
  ]);

  const today = buildQuestTodaySnapshot({
    date: dateKey,
    stats: statsResult.stats,
    claimedQuestIds: claimsResult.claimedQuestIds,
    currentStreak,
  });

  const hasDbSource = [statsResult.source, claimsResult.source, weekResult.source].includes("db");

  return {
    source: hasDbSource ? "db" : "unavailable",
    date: dateKey,
    stats: statsResult.stats,
    claimedQuestIds: claimsResult.claimedQuestIds,
    weekActivity: weekResult.weekActivity,
    today,
    snapshot: today.snapshot,
    hasPersistedStats: statsResult.exists,
    hasPersistedClaims: claimsResult.claimedQuestIds.length > 0,
  };
};
