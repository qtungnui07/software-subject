import { cache } from "react";

import {
    courses,
    dailyStreakLogs,
    userProgress,
    userStreaks,
    type DailyStreakLog,
} from "@/db/schema";

import db from "@/db/drizzle";
import { eq, sql, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";

type RemoteData<T> = { data: T };

export const getUserProgress = cache(async ()=> {
    if (isRemoteApiMode()) {
        return (await remoteApiRequest<RemoteData<any>>(
            "/api/remote/bootstrap?operation=user-progress"
        )).data;
    }

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
    if (isRemoteApiMode()) {
        return (await remoteApiRequest<RemoteData<any[]>>(
            "/api/remote/bootstrap?operation=courses"
        )).data;
    }

    const data = await db.query.courses.findMany();

    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    if (isRemoteApiMode()) {
        return (await remoteApiRequest<RemoteData<any>>(
            `/api/remote/bootstrap?operation=course&courseId=${courseId}`
        )).data;
    }

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
        orderBy: desc(dailyStreakLogs.studyDate),
        limit,
    });

    return data.map((log: DailyStreakLog) => ({
        studyDate: log.studyDate,
        completedLessons: log.completedLessons,
        earnedXp: log.earnedXp,
        studyMinutes: log.studyMinutes ?? 0,
    }));
};

export const getDailyStreakLog = async (userId: string, studyDate: string) => {
    const data = await db.query.dailyStreakLogs.findFirst({
        where: sql`${dailyStreakLogs.userId} = ${userId} and ${dailyStreakLogs.studyDate} = ${studyDate}`,
    });

    return data ?? null;
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
    studyMinutes?: number;
};

export const upsertDailyStreakLog = async ({
    userId,
    studyDate,
    completedLessons,
    earnedXp,
    studyMinutes = 0,
}: UpsertDailyStreakLogInput) => {
    const [data] = await db
        .insert(dailyStreakLogs)
        .values({
            userId,
            studyDate,
            completedLessons,
            earnedXp,
            studyMinutes,
        })
        .onConflictDoUpdate({
            target: [dailyStreakLogs.userId, dailyStreakLogs.studyDate],
            set: {
                completedLessons: sql`${dailyStreakLogs.completedLessons} + ${completedLessons}`,
                earnedXp: sql`${dailyStreakLogs.earnedXp} + ${earnedXp}`,
                studyMinutes: sql`${dailyStreakLogs.studyMinutes} + ${studyMinutes}`,
                updatedAt: new Date(),
            },
        })
        .returning();

    return data;
};
