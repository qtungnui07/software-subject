import "server-only";

import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { questDailyStats } from "@/db/schema";


const getVietnamDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not resolve Vietnam quest date.");
  }

  return `${year}-${month}-${day}`;
};

export type RecordLearningQuestProgressInput = {
  userId: string;
  earnedXp: number;
  completedLessons: number;
  accuracy: number;
  durationSeconds: number;
  dateKey?: string;
};

export type RecordLearningQuestProgressResult = {
  success: true;
  skipped: boolean;
  code?: "QUEST_DATABASE_UNAVAILABLE" | "QUEST_PROGRESS_RECORD_FAILED";
};

const toSafeInteger = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.trunc(numeric));
};

export const recordLearningQuestProgress = async ({
  userId,
  earnedXp,
  completedLessons,
  accuracy,
  durationSeconds,
  dateKey = getVietnamDateKey(),
}: RecordLearningQuestProgressInput): Promise<RecordLearningQuestProgressResult> => {
  if (!process.env.DATABASE_URL) {
    return {
      success: true,
      skipped: true,
      code: "QUEST_DATABASE_UNAVAILABLE",
    };
  }

  const lessonDelta = Math.min(toSafeInteger(completedLessons), 1);
  const xpDelta = toSafeInteger(earnedXp);
  const minutesDelta = Math.floor(toSafeInteger(durationSeconds) / 60);
  const safeAccuracy = Math.min(toSafeInteger(accuracy), 100);

  try {
    await db
      .insert(questDailyStats)
      .values({
        userId,
        statDate: dateKey,
        lessonsCompleted: lessonDelta,
        xpEarned: xpDelta,
        minutesLearned: minutesDelta,
        bestAccuracy: safeAccuracy,
      })
      .onConflictDoUpdate({
        target: [questDailyStats.userId, questDailyStats.statDate],
        set: {
          lessonsCompleted: sql`${questDailyStats.lessonsCompleted} + ${lessonDelta}`,
          xpEarned: sql`${questDailyStats.xpEarned} + ${xpDelta}`,
          minutesLearned: sql`${questDailyStats.minutesLearned} + ${minutesDelta}`,
          bestAccuracy: sql`GREATEST(${questDailyStats.bestAccuracy}, ${safeAccuracy})`,
          updatedAt: new Date(),
        },
      });

    return { success: true, skipped: false };
  } catch (error) {
    console.warn(
      "Learning completion could not record quest progress. Progress remains valid.",
      error,
    );
    return {
      success: true,
      skipped: true,
      code: "QUEST_PROGRESS_RECORD_FAILED",
    };
  }
};
