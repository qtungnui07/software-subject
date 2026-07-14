import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
    getDailyStreakLog,
    getUserStreak,
    upsertDailyStreakLog,
    upsertUserStreak,
} from "@/db/queries";
import {
    calculateNextStreak,
    DEFAULT_STREAK_TIME_ZONE,
    getDateKey,
    normalizeLessonStreakReward,
} from "@/lib/streak";

export const dynamic = "force-dynamic";

const MIN_STREAK_STUDY_MINUTES = 15;

type UpdateStreakRequestBody = {
    lessonId?: unknown;
    earnedXp?: unknown;
    studyMinutes?: unknown;
};

const parseUpdateStreakBody = (body: UpdateStreakRequestBody) => {
    const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";

    if (!lessonId) {
        return {
            error: "lessonId is required",
            lessonId: null,
            earnedXp: 0,
            studyMinutes: 0,
        };
    }

    const earnedXp =
        typeof body.earnedXp === "number" && Number.isFinite(body.earnedXp)
            ? body.earnedXp
            : 10;
    const studyMinutes =
        typeof body.studyMinutes === "number" && Number.isFinite(body.studyMinutes)
            ? Math.max(0, Math.trunc(body.studyMinutes))
            : 0;

    return {
        error: null,
        lessonId,
        earnedXp,
        studyMinutes,
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
        const todayDate = getDateKey(new Date(), DEFAULT_STREAK_TIME_ZONE);
        const previousDailyLog = await getDailyStreakLog(userId, todayDate);
        const previousStudyMinutes = previousDailyLog?.studyMinutes ?? 0;
        const nextStudyMinutes = previousStudyMinutes + parsedBody.studyMinutes;
        const reachedMinimumBefore = previousStudyMinutes >= MIN_STREAK_STUDY_MINUTES;
        const reachedMinimumNow = nextStudyMinutes >= MIN_STREAK_STUDY_MINUTES;
        const currentStreak = await getUserStreak(userId);
        const dailyLog = await upsertDailyStreakLog({
            userId,
            studyDate: todayDate,
            completedLessons: reward.completedLessons,
            earnedXp: reward.earnedXp,
            studyMinutes: parsedBody.studyMinutes,
        });

        if (!reachedMinimumNow) {
            return NextResponse.json({
                lessonId: parsedBody.lessonId,
                status: "already_completed_today",
                message: `Cần học đủ ${MIN_STREAK_STUDY_MINUTES} phút trong ngày để tính streak.`,
                didIncrease: false,
                didReset: false,
                wasProtected: false,
                currentStreak: currentStreak?.currentStreak ?? 0,
                longestStreak: currentStreak?.longestStreak ?? 0,
                streakFreezes: currentStreak?.streakFreezes ?? 0,
                missedDays: 0,
                usedStreakFreezes: 0,
                todayDate,
                lastStudyDate: currentStreak?.lastStudyDate ?? null,
                completedLessonsToday: dailyLog.completedLessons,
                earnedXpToday: dailyLog.earnedXp,
                studyMinutesToday: dailyLog.studyMinutes,
                requiredStudyMinutes: MIN_STREAK_STUDY_MINUTES,
                reward,
            });
        }

        const nextStreak = calculateNextStreak({
            currentStreak: currentStreak?.currentStreak ?? 0,
            longestStreak: currentStreak?.longestStreak ?? 0,
            streakFreezes: currentStreak?.streakFreezes ?? 0,
            lastStudyDate: currentStreak?.lastStudyDate ?? null,
            today: new Date(),
            timeZone: DEFAULT_STREAK_TIME_ZONE,
        });
        const shouldApplyStreak = !reachedMinimumBefore || nextStreak.status === "already_completed_today";
        const streakToPersist = shouldApplyStreak
            ? nextStreak
            : {
                ...nextStreak,
                didIncrease: false,
                didReset: false,
                wasProtected: false,
                nextCurrentStreak: currentStreak?.currentStreak ?? 0,
                nextLongestStreak: currentStreak?.longestStreak ?? 0,
                nextStreakFreezes: currentStreak?.streakFreezes ?? 0,
                nextLastStudyDate: currentStreak?.lastStudyDate
                    ? String(currentStreak.lastStudyDate)
                    : null,
            };

        const updatedStreak = await upsertUserStreak({
            userId,
            currentStreak: streakToPersist.nextCurrentStreak,
            longestStreak: streakToPersist.nextLongestStreak,
            streakFreezes: streakToPersist.nextStreakFreezes,
            lastStudyDate: streakToPersist.nextLastStudyDate,
        });

        return NextResponse.json({
            lessonId: parsedBody.lessonId,
            status: streakToPersist.status,
            message: streakToPersist.message,
            didIncrease: streakToPersist.didIncrease,
            didReset: streakToPersist.didReset,
            wasProtected: streakToPersist.wasProtected,
            currentStreak: updatedStreak.currentStreak,
            longestStreak: updatedStreak.longestStreak,
            streakFreezes: updatedStreak.streakFreezes,
            missedDays: streakToPersist.missedDays,
            usedStreakFreezes: streakToPersist.usedStreakFreezes,
            todayDate: streakToPersist.todayDate,
            lastStudyDate: updatedStreak.lastStudyDate,
            completedLessonsToday: dailyLog.completedLessons,
            earnedXpToday: dailyLog.earnedXp,
            studyMinutesToday: dailyLog.studyMinutes,
            requiredStudyMinutes: MIN_STREAK_STUDY_MINUTES,
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
