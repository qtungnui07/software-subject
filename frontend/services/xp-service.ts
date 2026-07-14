import "server-only";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";

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
  currentUserId?: string | null;
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
      isCurrentUser: Boolean(currentUserId && summary.userId === currentUserId),
    };
  });

  const hasCurrentUser = Boolean(
    currentUserId && rows.some((user) => user.userId === currentUserId)
  );

  if (currentUserId && !hasCurrentUser) {
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
  return getXpLeaderboardInDatabase(input);
};

export const getUserXpSummary = async (
  input: GetUserXpSummaryInput
): Promise<UserXpProfileSummary> => {
  if (isRemoteApiMode()) {
    return remoteApiRequest<UserXpProfileSummary>("/api/xp/summary");
  }

  return getUserXpSummaryInDatabase(input);
};

export const completeLessonXp = async (
  input: CompleteLessonXpInput
): Promise<CompleteLessonXpResult> => {
  return completeLessonXpInDatabase(input);
};
