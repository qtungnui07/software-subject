import "server-only";

import { auth } from "@/auth";
import {
  defaultQuestSnapshotPreset,
  questSnapshotPresets,
  QUEST_TIMEZONE,
  type QuestSnapshotPresetName,
} from "@/constants/quests";
import { getRecentStreakLogs, getUserStreak } from "@/db/queries";
import { buildQuestsPageData } from "@/lib/quests/quest-adapter";
import { DEFAULT_STREAK_TIME_ZONE, getDateKey, normalizeDateKey } from "@/lib/streak";
import { getQuestTodayState, type QuestTodayStateResult } from "@/services/quest-service";
import { getUserXpSummary, type UserXpProfileSummary } from "@/services/xp-service";
import type {
  QuestDataSource,
  QuestSyncStatus,
  QuestsPageData,
  UserQuestSnapshot,
  WeekActivityDay,
} from "@/types/quest";

type QuestIntegrationUser = {
  id: string;
  isDemoUser: boolean;
};

type RecentStreakLog = {
  studyDate: unknown;
  completedLessons?: unknown;
  earnedXp?: unknown;
};

const SHOULD_LOG_QUEST_INTEGRATION =
  process.env.NEXT_PUBLIC_SHOW_QUEST_DEBUG === "true";

const logQuestIntegrationWarning = (message: string, error: unknown) => {
  if (!SHOULD_LOG_QUEST_INTEGRATION) return;

  console.warn(message, error);
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

const getCurrentQuestUser = async (): Promise<QuestIntegrationUser | null> => {
  try {
    const session = await auth();

    if (session?.user?.id) {
      return {
        id: session.user.id,
        isDemoUser: false,
      };
    }
  } catch (error) {
    logQuestIntegrationWarning(
      "Robogo quests could not read auth session. Falling back safely.",
      error,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      id: "demo-user",
      isDemoUser: true,
    };
  }

  return null;
};

const getFallbackSnapshot = (presetName: QuestSnapshotPresetName): UserQuestSnapshot => {
  return {
    ...questSnapshotPresets[presetName],
    claimedQuestIds: [],
  };
};

const normalizeLogDate = (value: unknown) => {
  try {
    return normalizeDateKey(value as string | Date | null | undefined, DEFAULT_STREAK_TIME_ZONE);
  } catch {
    return null;
  }
};

const getWeekdayLabel = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = date.getUTCDay();

  if (dayIndex === 0) return "CN";

  return `T${dayIndex + 1}`;
};

const shiftDateKey = (dateKey: string, offsetDays: number) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offsetDays));

  return date.toISOString().slice(0, 10);
};

const buildEmptyWeekActivity = (todayKey: string): WeekActivityDay[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = shiftDateKey(todayKey, index - 6);

    return {
      day: getWeekdayLabel(dateKey),
      completed: false,
    };
  });
};

const buildWeekActivityFromLogs = (
  logs: RecentStreakLog[],
  todayKey: string,
): WeekActivityDay[] => {
  if (logs.length === 0) {
    return buildEmptyWeekActivity(todayKey);
  }

  const completedByDate = new Map<string, boolean>();

  logs.forEach((log) => {
    const dateKey = normalizeLogDate(log.studyDate);

    if (!dateKey) return;
    const completedLessons = toSafeNumber(log.completedLessons, 0);

    completedByDate.set(dateKey, completedLessons > 0);
  });

  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = shiftDateKey(todayKey, index - 6);

    return {
      day: getWeekdayLabel(dateKey),
      completed: completedByDate.get(dateKey) ?? false,
    };
  });
};

const getSyncStatus = ({
  source,
  isDemoUser,
  hasXpSummary,
  hasStreak,
  hasQuestService,
}: {
  source: QuestDataSource;
  isDemoUser?: boolean;
  hasXpSummary: boolean;
  hasStreak: boolean;
  hasQuestService: boolean;
}): QuestSyncStatus => {
  const lastSyncedAt = new Date().toISOString();

  if (source === "api") {
    const parts = [
      hasQuestService ? "Quest" : null,
      hasXpSummary ? "XP" : null,
      hasStreak ? "Streak" : null,
    ]
      .filter(Boolean)
      .join("/");

    return {
      source,
      label: isDemoUser ? "Demo API" : "Đã đồng bộ",
      message: parts
        ? `Đang dùng dữ liệu ${parts} từ hệ thống hiện có.`
        : "Đang dùng dữ liệu thật khả dụng từ hệ thống hiện có.",
      lastSyncedAt,
      isDemoUser,
    };
  }

  if (source === "fallback") {
    return {
      source,
      label: "Fallback an toàn",
      message: "Không lấy được Quest/XP/Streak ổn định, UI vẫn chạy bằng dữ liệu tạm.",
      lastSyncedAt,
      isDemoUser,
    };
  }

  return {
    source,
    label: "Demo preset",
    message: "Đang dùng preset mock để test trạng thái nhiệm vụ.",
    lastSyncedAt,
    isDemoUser,
  };
};

export const getIntegratedQuestsPageData = async (
  presetName: QuestSnapshotPresetName = defaultQuestSnapshotPreset,
): Promise<QuestsPageData> => {
  const fallbackSnapshot = getFallbackSnapshot(presetName);
  const user = await getCurrentQuestUser();

  if (!user) {
    return buildQuestsPageData(fallbackSnapshot, {
      dataSource: "fallback",
      syncStatus: getSyncStatus({
        source: "fallback",
        hasXpSummary: false,
        hasStreak: false,
        hasQuestService: false,
      }),
    });
  }

  const todayKey = getDateKey(new Date(), QUEST_TIMEZONE);
  let xpSummary: UserXpProfileSummary | null = null;
  let currentStreak = 0;
  let recentActivity: RecentStreakLog[] = [];
  let questTodayState: QuestTodayStateResult | null = null;

  try {
    xpSummary = await getUserXpSummary({ userId: user.id });
  } catch (error) {
    logQuestIntegrationWarning(
      "Robogo quests could not load XP summary. Falling back where needed.",
      error,
    );
  }

  try {
    const [streak, logs] = await Promise.all([
      getUserStreak(user.id),
      getRecentStreakLogs(user.id, 7),
    ]);

    currentStreak = toSafeNumber(streak?.currentStreak);
    recentActivity = logs;
  } catch (error) {
    logQuestIntegrationWarning(
      "Robogo quests could not load streak data. Falling back where needed.",
      error,
    );
  }

  try {
    questTodayState = await getQuestTodayState({
      userId: user.id,
      currentStreak,
      dateKey: todayKey,
    });
  } catch (error) {
    logQuestIntegrationWarning(
      "Robogo quests could not load quest service state. Falling back where needed.",
      error,
    );
  }

  const hasXpSummary = Boolean(xpSummary);
  const hasStreak = currentStreak > 0 || recentActivity.length > 0;
  const hasQuestService = questTodayState?.source === "db";
  const dataSource: QuestDataSource = hasQuestService || hasXpSummary || hasStreak ? "api" : "fallback";

  const todayLog = recentActivity.find((log) => normalizeLogDate(log.studyDate) === todayKey);
  const isXpForToday = xpSummary?.currentDay === todayKey;
  const dailyXp = isXpForToday ? toSafeNumber(xpSummary?.dailyXp, 0) : 0;
  const lessonsCompletedToday = toSafeNumber(todayLog?.completedLessons, 0);
  const fallbackDataTruthSnapshot: UserQuestSnapshot = {
    lessonsCompletedToday,
    bestAccuracyToday: 0,
    minutesLearnedToday: 0,
    xpEarnedToday: dailyXp,
    currentStreak,
    claimedQuestIds: [],
  };
  const snapshot = (questTodayState && questTodayState.source === "db")
    ? questTodayState.snapshot
    : fallbackDataTruthSnapshot;
  const weekActivity = (questTodayState && questTodayState.source === "db")
    ? questTodayState.weekActivity
    : buildWeekActivityFromLogs(recentActivity, todayKey);

  return buildQuestsPageData(snapshot, {
    dataSource,
    syncStatus: getSyncStatus({
      source: dataSource,
      isDemoUser: user.isDemoUser,
      hasXpSummary,
      hasStreak,
      hasQuestService,
    }),
    weekActivity,
  });
};
