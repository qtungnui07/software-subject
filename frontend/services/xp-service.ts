import "server-only";

import { and, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  lessonXpClaims,
  userProgress,
  userXpSummary,
  xpEvents,
  type UserXpSummary,
} from "@/db/schema";
import {
  calculateLessonXp,
  calculateLevelFromXp,
  getLevelProgress,
  type XpRewardType,
} from "@/lib/xp";

const XP_TIME_ZONE = "Asia/Ho_Chi_Minh";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type CompleteLessonXpInput = {
  userId: string;
  userName?: string | null;
  userImageSrc?: string | null;
  lessonId: string;
  accuracy: number;
};

type GetUserXpSummaryInput = {
  userId: string;
};

type GetXpLeaderboardInput = {
  currentUserId: string;
  currentUserName?: string | null;
  currentUserImageSrc?: string | null;
};

export type XpLeaderboardUser = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string;
  level: number;
  weeklyXp: number;
  totalXp: number;
  isCurrentUser: boolean;
};

export type XpLeaderboardResult = {
  success: true;
  users: XpLeaderboardUser[];
  currentDay: string;
  currentWeekStart: string;
};

export type UserXpProfileSummary = {
  success: true;
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  level: number;
  currentLevelStartXp: number;
  nextLevelXp: number;
  xpIntoCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  currentDay: string;
  currentWeekStart: string;
};

export type CompleteLessonXpResult = {
  success: true;
  lessonId: string;
  earnedXp: number;
  baseXp: number;
  accuracyBonus: number;
  accuracy: number;
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  level: number;
  alreadyClaimed: boolean;
  isPassed: boolean;
  rewardType: XpRewardType;
  message: string;
  currentDay: string;
  currentWeekStart: string;
};

type XpState = {
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  currentDay: string | null;
  currentWeekStart: string | null;
};

type InMemoryXpClaim = {
  userId: string;
  lessonId: string;
  earnedXp: number;
  accuracy: number;
  firstCompletedAt: Date;
  updatedAt: Date;
};

const inMemoryXpSummaries = new Map<string, XpState>();
const inMemoryXpClaims = new Map<string, InMemoryXpClaim>();
const inMemoryUserProgressPoints = new Map<string, number>();
const inMemoryXpEvents: Array<{
  userId: string;
  lessonId: string;
  earnedXp: number;
  baseXp: number;
  accuracyBonus: number;
  accuracy: number;
  rewardType: XpRewardType;
  eventDate: string;
  weekStart: string;
  createdAt: Date;
}> = [];

const useInMemoryXpStore = !process.env.DATABASE_URL;

const DEMO_LEADERBOARD_USERS = [
  { userId: "demo-linh", name: "Linh", avatarUrl: "/mascot.svg", weeklyXp: 72, totalXp: 310 },
  { userId: "demo-minh", name: "Minh", avatarUrl: "/mascot.svg", weeklyXp: 54, totalXp: 240 },
  { userId: "demo-an", name: "An", avatarUrl: "/mascot.svg", weeklyXp: 42, totalXp: 180 },
  { userId: "demo-yuki", name: "Yuki", avatarUrl: "/mascot.svg", weeklyXp: 36, totalXp: 160 },
  { userId: "demo-hana", name: "Hana", avatarUrl: "/mascot.svg", weeklyXp: 30, totalXp: 140 },
  { userId: "demo-bao", name: "Bảo", avatarUrl: "/mascot.svg", weeklyXp: 26, totalXp: 120 },
  { userId: "demo-khoa", name: "Khoa", avatarUrl: "/mascot.svg", weeklyXp: 22, totalXp: 105 },
  { userId: "demo-sophia", name: "Sophia", avatarUrl: "/mascot.svg", weeklyXp: 18, totalXp: 96 },
  { userId: "demo-nam", name: "Nam", avatarUrl: "/mascot.svg", weeklyXp: 15, totalXp: 82 },
  { userId: "demo-emily", name: "Emily", avatarUrl: "/mascot.svg", weeklyXp: 12, totalXp: 70 },
  { userId: "demo-tuan", name: "Tuấn", avatarUrl: "/mascot.svg", weeklyXp: 10, totalXp: 60 },
  { userId: "demo-sarah", name: "Sarah", avatarUrl: "/mascot.svg", weeklyXp: 8, totalXp: 50 },
  { userId: "demo-vy", name: "Vy", avatarUrl: "/mascot.svg", weeklyXp: 6, totalXp: 40 },
  { userId: "demo-david", name: "David", avatarUrl: "/mascot.svg", weeklyXp: 5, totalXp: 34 },
  { userId: "demo-trang", name: "Trang", avatarUrl: "/mascot.svg", weeklyXp: 4, totalXp: 30 },
  { userId: "demo-hai", name: "Hải", avatarUrl: "/mascot.svg", weeklyXp: 3, totalXp: 22 },
  { userId: "demo-alex", name: "Alex", avatarUrl: "/mascot.svg", weeklyXp: 2, totalXp: 18 },
  { userId: "demo-mai", name: "Mai", avatarUrl: "/mascot.svg", weeklyXp: 1, totalXp: 12 },
  { userId: "demo-jun", name: "Jun", avatarUrl: "/mascot.svg", weeklyXp: 0, totalXp: 8 },
  { userId: "demo-anh", name: "Anh", avatarUrl: "/mascot.svg", weeklyXp: 0, totalXp: 4 },
];

const toSafeXp = (value: number | null | undefined) => {
  if (!Number.isFinite(value ?? 0)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value ?? 0));
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
    throw new Error("Failed to format XP date key.");
  }

  return `${year}-${month}-${day}`;
};

const parseDateKeyToUtcDate = (dateKey: string) => {
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}. Expected YYYY-MM-DD.`);
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

export const getXpDateKey = (date = new Date(), timeZone = XP_TIME_ZONE) =>
  formatDateInTimeZone(date, timeZone);

export const getXpWeekStartKey = (date = new Date(), timeZone = XP_TIME_ZONE) => {
  const dateKey = getXpDateKey(date, timeZone);
  const utcDate = parseDateKeyToUtcDate(dateKey);
  const day = utcDate.getUTCDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;

  utcDate.setUTCDate(utcDate.getUTCDate() - distanceFromMonday);

  return formatDateInTimeZone(utcDate, "UTC");
};

const claimKey = (userId: string, lessonId: string) => `${userId}::${lessonId}`;

const buildStateAfterXp = ({
  currentState,
  earnedXp,
  todayKey,
  weekStartKey,
}: {
  currentState: XpState;
  earnedXp: number;
  todayKey: string;
  weekStartKey: string;
}): XpState => {
  const shouldResetDaily = currentState.currentDay !== todayKey;
  const shouldResetWeekly = currentState.currentWeekStart !== weekStartKey;

  return {
    totalXp: toSafeXp(currentState.totalXp) + earnedXp,
    dailyXp: (shouldResetDaily ? 0 : toSafeXp(currentState.dailyXp)) + earnedXp,
    weeklyXp: (shouldResetWeekly ? 0 : toSafeXp(currentState.weeklyXp)) + earnedXp,
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
  };
};

const toResponse = ({
  lessonId,
  xpResult,
  state,
  alreadyClaimed,
  todayKey,
  weekStartKey,
}: {
  lessonId: string;
  xpResult: ReturnType<typeof calculateLessonXp>;
  state: XpState;
  alreadyClaimed: boolean;
  todayKey: string;
  weekStartKey: string;
}): CompleteLessonXpResult => ({
  success: true,
  lessonId,
  earnedXp: xpResult.earnedXp,
  baseXp: xpResult.baseXp,
  accuracyBonus: xpResult.accuracyBonus,
  accuracy: xpResult.accuracy,
  totalXp: toSafeXp(state.totalXp),
  dailyXp: toSafeXp(state.dailyXp),
  weeklyXp: toSafeXp(state.weeklyXp),
  level: calculateLevelFromXp(state.totalXp),
  alreadyClaimed,
  isPassed: xpResult.isPassed,
  rewardType: xpResult.rewardType,
  message: xpResult.message,
  currentDay: todayKey,
  currentWeekStart: weekStartKey,
});

const logInMemoryXpEvent = ({
  input,
  xpResult,
  todayKey,
  weekStartKey,
}: {
  input: CompleteLessonXpInput;
  xpResult: ReturnType<typeof calculateLessonXp>;
  todayKey: string;
  weekStartKey: string;
}) => {
  inMemoryXpEvents.push({
    userId: input.userId,
    lessonId: input.lessonId,
    earnedXp: xpResult.earnedXp,
    baseXp: xpResult.baseXp,
    accuracyBonus: xpResult.accuracyBonus,
    accuracy: xpResult.accuracy,
    rewardType: xpResult.rewardType,
    eventDate: todayKey,
    weekStart: weekStartKey,
    createdAt: new Date(),
  });
};

const completeLessonXpInMemory = async (
  input: CompleteLessonXpInput
): Promise<CompleteLessonXpResult> => {
  const todayKey = getXpDateKey();
  const weekStartKey = getXpWeekStartKey();
  const key = claimKey(input.userId, input.lessonId);
  const existingClaim = inMemoryXpClaims.get(key);
  const existingSummary = inMemoryXpSummaries.get(input.userId);
  const progressPoints = inMemoryUserProgressPoints.get(input.userId) ?? 0;
  const currentState: XpState = existingSummary ?? {
    totalXp: progressPoints,
    dailyXp: 0,
    weeklyXp: 0,
    currentDay: null,
    currentWeekStart: null,
  };

  if (existingClaim) {
    const xpResult = calculateLessonXp({
      accuracy: input.accuracy,
      isFirstCompletion: false,
      isDuplicateRequest: true,
    });
    const nextState = buildStateAfterXp({
      currentState,
      earnedXp: 0,
      todayKey,
      weekStartKey,
    });

    inMemoryXpSummaries.set(input.userId, nextState);
    logInMemoryXpEvent({ input, xpResult, todayKey, weekStartKey });

    return toResponse({
      lessonId: input.lessonId,
      xpResult,
      state: nextState,
      alreadyClaimed: true,
      todayKey,
      weekStartKey,
    });
  }

  const xpResult = calculateLessonXp({
    accuracy: input.accuracy,
    isFirstCompletion: true,
  });
  const nextState = buildStateAfterXp({
    currentState,
    earnedXp: xpResult.earnedXp,
    todayKey,
    weekStartKey,
  });

  inMemoryXpSummaries.set(input.userId, nextState);
  logInMemoryXpEvent({ input, xpResult, todayKey, weekStartKey });

  if (xpResult.isPassed) {
    inMemoryXpClaims.set(key, {
      userId: input.userId,
      lessonId: input.lessonId,
      earnedXp: xpResult.earnedXp,
      accuracy: xpResult.accuracy,
      firstCompletedAt: new Date(),
      updatedAt: new Date(),
    });
    inMemoryUserProgressPoints.set(input.userId, nextState.totalXp);
  }

  return toResponse({
    lessonId: input.lessonId,
    xpResult,
    state: nextState,
    alreadyClaimed: false,
    todayKey,
    weekStartKey,
  });
};

const getCurrentDbState = async (
  tx: any,
  userId: string,
  todayKey: string,
  weekStartKey: string
): Promise<XpState> => {
  const [summary, progress] = await Promise.all([
    tx.query.userXpSummary.findFirst({
      where: eq(userXpSummary.userId, userId),
    }),
    tx.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    }),
  ]);

  const totalXp = toSafeXp(summary?.totalXp ?? progress?.points ?? 0);
  const dailyXp = summary?.currentDay === todayKey ? toSafeXp(summary?.dailyXp) : 0;
  const weeklyXp =
    summary?.currentWeekStart === weekStartKey ? toSafeXp(summary?.weeklyXp) : 0;

  return {
    totalXp,
    dailyXp,
    weeklyXp,
    currentDay: summary?.currentDay ?? null,
    currentWeekStart: summary?.currentWeekStart ?? null,
  };
};

const upsertDbSummary = async (tx: any, userId: string, state: XpState) => {
  const [summary] = await tx
    .insert(userXpSummary)
    .values({
      userId,
      totalXp: state.totalXp,
      dailyXp: state.dailyXp,
      weeklyXp: state.weeklyXp,
      currentDay: state.currentDay,
      currentWeekStart: state.currentWeekStart,
    })
    .onConflictDoUpdate({
      target: userXpSummary.userId,
      set: {
        totalXp: state.totalXp,
        dailyXp: state.dailyXp,
        weeklyXp: state.weeklyXp,
        currentDay: state.currentDay,
        currentWeekStart: state.currentWeekStart,
        updatedAt: new Date(),
      },
    })
    .returning();

  return summary as UserXpSummary;
};

const insertDbXpEvent = async ({
  tx,
  input,
  xpResult,
  todayKey,
  weekStartKey,
}: {
  tx: any;
  input: CompleteLessonXpInput;
  xpResult: ReturnType<typeof calculateLessonXp>;
  todayKey: string;
  weekStartKey: string;
}) => {
  await tx.insert(xpEvents).values({
    userId: input.userId,
    lessonId: input.lessonId,
    earnedXp: xpResult.earnedXp,
    baseXp: xpResult.baseXp,
    accuracyBonus: xpResult.accuracyBonus,
    accuracy: xpResult.accuracy,
    rewardType: xpResult.rewardType,
    eventDate: todayKey,
    weekStart: weekStartKey,
  });
};

const upsertDbUserProgressPoints = async ({
  tx,
  input,
  nextTotalXp,
  earnedXp,
}: {
  tx: any;
  input: CompleteLessonXpInput;
  nextTotalXp: number;
  earnedXp: number;
}) => {
  await tx
    .insert(userProgress)
    .values({
      userId: input.userId,
      userName: input.userName?.trim() || "User",
      userImageSrc: input.userImageSrc?.trim() || "/mascot.svg",
      points: nextTotalXp,
    })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: {
        points: nextTotalXp,
        userName: input.userName?.trim() || "User",
        userImageSrc: input.userImageSrc?.trim() || "/mascot.svg",
      },
    });
};

const completeLessonXpInDatabase = async (
  input: CompleteLessonXpInput
): Promise<CompleteLessonXpResult> => {
  const todayKey = getXpDateKey();
  const weekStartKey = getXpWeekStartKey();

  return db.transaction(async (tx: any) => {
    const existingClaim = await tx.query.lessonXpClaims.findFirst({
      where: and(
        eq(lessonXpClaims.userId, input.userId),
        eq(lessonXpClaims.lessonId, input.lessonId)
      ),
    });
    const currentState = await getCurrentDbState(
      tx,
      input.userId,
      todayKey,
      weekStartKey
    );

    if (existingClaim) {
      const xpResult = calculateLessonXp({
        accuracy: input.accuracy,
        isFirstCompletion: false,
        isDuplicateRequest: true,
      });
      const nextState = buildStateAfterXp({
        currentState,
        earnedXp: 0,
        todayKey,
        weekStartKey,
      });

      await upsertDbSummary(tx, input.userId, nextState);
      await insertDbXpEvent({ tx, input, xpResult, todayKey, weekStartKey });

      return toResponse({
        lessonId: input.lessonId,
        xpResult,
        state: nextState,
        alreadyClaimed: true,
        todayKey,
        weekStartKey,
      });
    }

    const xpResult = calculateLessonXp({
      accuracy: input.accuracy,
      isFirstCompletion: true,
    });
    const nextState = buildStateAfterXp({
      currentState,
      earnedXp: xpResult.earnedXp,
      todayKey,
      weekStartKey,
    });

    await upsertDbSummary(tx, input.userId, nextState);
    await insertDbXpEvent({ tx, input, xpResult, todayKey, weekStartKey });

    if (xpResult.isPassed) {
      await tx.insert(lessonXpClaims).values({
        userId: input.userId,
        lessonId: input.lessonId,
        earnedXp: xpResult.earnedXp,
        accuracy: xpResult.accuracy,
      });
      await upsertDbUserProgressPoints({
        tx,
        input,
        nextTotalXp: nextState.totalXp,
        earnedXp: xpResult.earnedXp,
      });
    }

    return toResponse({
      lessonId: input.lessonId,
      xpResult,
      state: nextState,
      alreadyClaimed: false,
      todayKey,
      weekStartKey,
    });
  });
};

const toProfileSummaryResponse = ({
  state,
  todayKey,
  weekStartKey,
}: {
  state: XpState;
  todayKey: string;
  weekStartKey: string;
}): UserXpProfileSummary => {
  const levelProgress = getLevelProgress(state.totalXp);

  return {
    success: true,
    totalXp: toSafeXp(state.totalXp),
    dailyXp: toSafeXp(state.dailyXp),
    weeklyXp: toSafeXp(state.weeklyXp),
    level: levelProgress.level,
    currentLevelStartXp: levelProgress.currentLevelStartXp,
    nextLevelXp: levelProgress.nextLevelXp,
    xpIntoCurrentLevel: levelProgress.xpIntoCurrentLevel,
    xpNeededForNextLevel: levelProgress.xpNeededForNextLevel,
    progressPercent: levelProgress.progressPercent,
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
  };
};

const getUserXpSummaryInMemory = async ({
  userId,
}: GetUserXpSummaryInput): Promise<UserXpProfileSummary> => {
  const todayKey = getXpDateKey();
  const weekStartKey = getXpWeekStartKey();
  const existingSummary = inMemoryXpSummaries.get(userId);
  const progressPoints = inMemoryUserProgressPoints.get(userId) ?? 0;
  const currentState: XpState = existingSummary ?? {
    totalXp: progressPoints,
    dailyXp: 0,
    weeklyXp: 0,
    currentDay: null,
    currentWeekStart: null,
  };
  const normalizedState = buildStateAfterXp({
    currentState,
    earnedXp: 0,
    todayKey,
    weekStartKey,
  });

  inMemoryXpSummaries.set(userId, normalizedState);

  return toProfileSummaryResponse({
    state: normalizedState,
    todayKey,
    weekStartKey,
  });
};

const getUserXpSummaryInDatabase = async ({
  userId,
}: GetUserXpSummaryInput): Promise<UserXpProfileSummary> => {
  const todayKey = getXpDateKey();
  const weekStartKey = getXpWeekStartKey();
  const state = await db.transaction(async (tx: any) =>
    getCurrentDbState(tx, userId, todayKey, weekStartKey)
  );

  return toProfileSummaryResponse({
    state,
    todayKey,
    weekStartKey,
  });
};

const rankLeaderboardUsers = (users: Omit<XpLeaderboardUser, "rank">[]) =>
  users
    .sort((a, b) => {
      if (b.weeklyXp !== a.weeklyXp) {
        return b.weeklyXp - a.weeklyXp;
      }

      return b.totalXp - a.totalXp;
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

const getXpLeaderboardInMemory = async ({
  currentUserId,
  currentUserName,
  currentUserImageSrc,
}: GetXpLeaderboardInput): Promise<XpLeaderboardResult> => {
  const currentUserSummary = await getUserXpSummaryInMemory({ userId: currentUserId });
  const todayKey = currentUserSummary.currentDay;
  const weekStartKey = currentUserSummary.currentWeekStart;

  const currentUserRow: Omit<XpLeaderboardUser, "rank"> = {
    userId: currentUserId,
    name: currentUserName?.trim() || "Bạn",
    avatarUrl: currentUserImageSrc?.trim() || "/mascot.svg",
    level: currentUserSummary.level,
    weeklyXp: currentUserSummary.weeklyXp,
    totalXp: currentUserSummary.totalXp,
    isCurrentUser: true,
  };

  return {
    success: true,
    users: rankLeaderboardUsers([currentUserRow]),
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
  };
};

const getXpLeaderboardInDatabase = async ({
  currentUserId,
  currentUserName,
  currentUserImageSrc,
}: GetXpLeaderboardInput): Promise<XpLeaderboardResult> => {
  const todayKey = getXpDateKey();
  const weekStartKey = getXpWeekStartKey();

  const summaries = await db.query.userXpSummary.findMany({
    with: {
      userProgress: true,
    },
    limit: 100,
  });

  const rows: Omit<XpLeaderboardUser, "rank">[] = summaries.map((summary: any) => {
    const totalXp = toSafeXp(summary.totalXp ?? summary.userProgress?.points ?? 0);
    const weeklyXp = summary.currentWeekStart === weekStartKey ? toSafeXp(summary.weeklyXp) : 0;

    return {
      userId: summary.userId,
      name:
        summary.userProgress?.userName ||
        (summary.userId === currentUserId ? currentUserName?.trim() : null) ||
        "User",
      avatarUrl:
        summary.userProgress?.userImageSrc ||
        (summary.userId === currentUserId ? currentUserImageSrc?.trim() : null) ||
        "/mascot.svg",
      level: calculateLevelFromXp(totalXp),
      weeklyXp,
      totalXp,
      isCurrentUser: summary.userId === currentUserId,
    };
  });

  const hasCurrentUser = rows.some((user) => user.userId === currentUserId);

  if (!hasCurrentUser) {
    const currentUserSummary = await getUserXpSummaryInDatabase({ userId: currentUserId });

    rows.push({
      userId: currentUserId,
      name: currentUserName?.trim() || "Bạn",
      avatarUrl: currentUserImageSrc?.trim() || "/mascot.svg",
      level: currentUserSummary.level,
      weeklyXp: currentUserSummary.weeklyXp,
      totalXp: currentUserSummary.totalXp,
      isCurrentUser: true,
    });
  }

  return {
    success: true,
    users: rankLeaderboardUsers(rows).slice(0, 30),
    currentDay: todayKey,
    currentWeekStart: weekStartKey,
  };
};

export const getXpLeaderboard = async (
  input: GetXpLeaderboardInput
): Promise<XpLeaderboardResult> => {
  if (useInMemoryXpStore) {
    return getXpLeaderboardInMemory(input);
  }

  return getXpLeaderboardInDatabase(input);
};

export const getUserXpSummary = async (
  input: GetUserXpSummaryInput
): Promise<UserXpProfileSummary> => {
  if (useInMemoryXpStore) {
    return getUserXpSummaryInMemory(input);
  }

  return getUserXpSummaryInDatabase(input);
};

export const completeLessonXp = async (
  input: CompleteLessonXpInput
): Promise<CompleteLessonXpResult> => {
  if (useInMemoryXpStore) {
    return completeLessonXpInMemory(input);
  }

  return completeLessonXpInDatabase(input);
};
