import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
    getUserStreak,
    upsertDailyStreakLog,
    upsertUserStreak,
} from "@/db/queries";
import {
    calculateNextStreak,
    DEFAULT_STREAK_TIME_ZONE,
    normalizeLessonStreakReward,
} from "@/lib/streak";

export const dynamic = "force-dynamic";

type UpdateStreakRequestBody = {
    lessonId?: unknown;
    earnedXp?: unknown;
};

const parseUpdateStreakBody = (body: UpdateStreakRequestBody) => {
    const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";

    if (!lessonId) {
        return {
            error: "lessonId is required",
            lessonId: null,
            earnedXp: 0,
        };
    }

    const earnedXp =
        typeof body.earnedXp === "number" && Number.isFinite(body.earnedXp)
            ? body.earnedXp
            : 10;

    return {
        error: null,
        lessonId,
        earnedXp,
    };
};

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = (await request.json().catch(() => ({}))) as UpdateStreakRequestBody;
        const parsedBody = parseUpdateStreakBody(body);

        if (parsedBody.error || !parsedBody.lessonId) {
            return NextResponse.json(
                { error: parsedBody.error },
                { status: 400 }
            );
        }

        const reward = normalizeLessonStreakReward({
            completedLessons: 1,
            earnedXp: parsedBody.earnedXp,
        });
        const currentStreak = await getUserStreak(userId);
        const nextStreak = calculateNextStreak({
            currentStreak: currentStreak?.currentStreak ?? 0,
            longestStreak: currentStreak?.longestStreak ?? 0,
            streakFreezes: currentStreak?.streakFreezes ?? 0,
            lastStudyDate: currentStreak?.lastStudyDate ?? null,
            today: new Date(),
            timeZone: DEFAULT_STREAK_TIME_ZONE,
        });

        const updatedStreak = await upsertUserStreak({
            userId,
            currentStreak: nextStreak.nextCurrentStreak,
            longestStreak: nextStreak.nextLongestStreak,
            streakFreezes: nextStreak.nextStreakFreezes,
            lastStudyDate: nextStreak.nextLastStudyDate,
        });
        const dailyLog = await upsertDailyStreakLog({
            userId,
            studyDate: nextStreak.todayDate,
            completedLessons: reward.completedLessons,
            earnedXp: reward.earnedXp,
        });

        return NextResponse.json({
            lessonId: parsedBody.lessonId,
            status: nextStreak.status,
            message: nextStreak.message,
            didIncrease: nextStreak.didIncrease,
            didReset: nextStreak.didReset,
            wasProtected: nextStreak.wasProtected,
            currentStreak: updatedStreak.currentStreak,
            longestStreak: updatedStreak.longestStreak,
            streakFreezes: updatedStreak.streakFreezes,
            missedDays: nextStreak.missedDays,
            usedStreakFreezes: nextStreak.usedStreakFreezes,
            todayDate: nextStreak.todayDate,
            lastStudyDate: updatedStreak.lastStudyDate,
            completedLessonsToday: dailyLog.completedLessons,
            earnedXpToday: dailyLog.earnedXp,
            reward,
        });
    } catch (error) {
        console.error("Failed to update streak", error);

        return NextResponse.json(
            { error: "Failed to update streak" },
            { status: 500 }
        );
    }
}
