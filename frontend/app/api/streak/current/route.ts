import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getRecentStreakLogs, getUserStreak } from "@/db/queries";
import {
    DEFAULT_STREAK_TIME_ZONE,
    getDateDifferenceInDays,
    getDateKey,
    normalizeDateKey,
} from "@/lib/streak";

export const dynamic = "force-dynamic";

type CurrentStreakStatus = "not_started" | "active_today" | "active" | "missed";

const getDefaultStreakResponse = (todayDate: string) => ({
    currentStreak: 0,
    longestStreak: 0,
    streakFreezes: 0,
    lastStudyDate: null,
    hasStudiedToday: false,
    canIncreaseToday: true,
    missedDays: 0,
    status: "not_started" as CurrentStreakStatus,
    todayDate,
    recentActivity: [],
});

const getCurrentStreakStatus = (lastStudyDate: string | null, todayDate: string) => {
    if (!lastStudyDate) {
        return {
            hasStudiedToday: false,
            canIncreaseToday: true,
            missedDays: 0,
            status: "not_started" as CurrentStreakStatus,
            dayDifference: null,
        };
    }

    const dayDifference = getDateDifferenceInDays(lastStudyDate, todayDate);

    if (dayDifference <= 0) {
        return {
            hasStudiedToday: true,
            canIncreaseToday: false,
            missedDays: 0,
            status: "active_today" as CurrentStreakStatus,
            dayDifference,
        };
    }

    if (dayDifference === 1) {
        return {
            hasStudiedToday: false,
            canIncreaseToday: true,
            missedDays: 0,
            status: "active" as CurrentStreakStatus,
            dayDifference,
        };
    }

    return {
        hasStudiedToday: false,
        canIncreaseToday: true,
        missedDays: dayDifference - 1,
        status: "missed" as CurrentStreakStatus,
        dayDifference,
    };
};

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const todayDate = getDateKey(new Date(), DEFAULT_STREAK_TIME_ZONE);
        const streak = await getUserStreak(userId);
        const recentActivity = await getRecentStreakLogs(userId, 7);

        if (!streak) {
            return NextResponse.json({
                ...getDefaultStreakResponse(todayDate),
                recentActivity,
            });
        }

        const lastStudyDate = normalizeDateKey(
            streak.lastStudyDate,
            DEFAULT_STREAK_TIME_ZONE
        );
        const streakStatus = getCurrentStreakStatus(lastStudyDate, todayDate);

        return NextResponse.json({
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            streakFreezes: streak.streakFreezes,
            lastStudyDate,
            hasStudiedToday: streakStatus.hasStudiedToday,
            canIncreaseToday: streakStatus.canIncreaseToday,
            missedDays: streakStatus.missedDays,
            status: streakStatus.status,
            todayDate,
            recentActivity,
        });
    } catch (error) {
        console.error("Failed to get current streak", error);

        return NextResponse.json(
            { error: "Failed to get current streak" },
            { status: 500 }
        );
    }
}
