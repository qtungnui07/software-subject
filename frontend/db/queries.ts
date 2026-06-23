import { cache } from "react";

import { courses, dailyStreakLogs, userProgress, userStreaks } from "@/db/schema";

import db from "@/db/drizzle";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";

export const getUserProgress = cache(async ()=> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return null;
    }

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: {
            activeCourse: true,
        },
    });
    return data;
})

export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany();

    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    return data;
});

export const getUserStreak = async (userId: string) => {
    const data = await db.query.userStreaks.findFirst({
        where: eq(userStreaks.userId, userId),
    });

    return data ?? null;
};

export const getRecentStreakLogs = async (userId: string, limit = 7) => {
    const data = await db.query.dailyStreakLogs.findMany({
        where: eq(dailyStreakLogs.userId, userId),
        orderBy: (logs, { desc }) => [desc(logs.studyDate)],
        limit,
    });

    return data.map((log) => ({
        studyDate: log.studyDate,
        completedLessons: log.completedLessons,
        earnedXp: log.earnedXp,
    }));
};

export type UpdateUserStreakInput = {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    lastStudyDate: string | null;
};

export const upsertUserStreak = async ({
    userId,
    currentStreak,
    longestStreak,
    streakFreezes,
    lastStudyDate,
}: UpdateUserStreakInput) => {
    const [data] = await db
        .insert(userStreaks)
        .values({
            userId,
            currentStreak,
            longestStreak,
            streakFreezes,
            lastStudyDate,
        })
        .onConflictDoUpdate({
            target: userStreaks.userId,
            set: {
                currentStreak,
                longestStreak,
                streakFreezes,
                lastStudyDate,
                updatedAt: new Date(),
            },
        })
        .returning();

    return data;
};

export type UpsertDailyStreakLogInput = {
    userId: string;
    studyDate: string;
    completedLessons: number;
    earnedXp: number;
};

export const upsertDailyStreakLog = async ({
    userId,
    studyDate,
    completedLessons,
    earnedXp,
}: UpsertDailyStreakLogInput) => {
    const [data] = await db
        .insert(dailyStreakLogs)
        .values({
            userId,
            studyDate,
            completedLessons,
            earnedXp,
        })
        .onConflictDoUpdate({
            target: [dailyStreakLogs.userId, dailyStreakLogs.studyDate],
            set: {
                completedLessons: sql`${dailyStreakLogs.completedLessons} + ${completedLessons}`,
                earnedXp: sql`${dailyStreakLogs.earnedXp} + ${earnedXp}`,
                updatedAt: new Date(),
            },
        })
        .returning();

    return data;
};
