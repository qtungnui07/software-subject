import { englishCourse } from "@/data/courses/english-course";
import { resetLearningCompletionIdempotencyStore, runIdempotentLearningCompletion, } from "../lib/learning/completion-idempotency";
import { createDefaultCourseProgress } from "../lib/courses/course-progress";
import type { LearningCompletionResult } from "../types/learning-completion";
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
    if (!condition)
        throw new Error(message);
};
const buildResult = (): LearningCompletionResult => ({
    success: true,
    syncStatus: "complete",
    pendingSystems: [],
    nodeId: "lesson-1",
    nodeType: "lesson",
    accuracy: 100,
    passThreshold: 60,
    passed: true,
    alreadyCompleted: false,
    progressUpdated: true,
    progressReason: "updated",
    progress: createDefaultCourseProgress(englishCourse),
    xp: {
        synced: true,
        pending: false,
        earnedXp: 10,
        baseXp: 10,
        accuracyBonus: 0,
        totalXp: 10,
        dailyXp: 10,
        weeklyXp: 10,
        level: 1,
        alreadyClaimed: false,
        isPassed: true,
        rewardType: "lesson",
        currentDay: "2026-07-09",
        currentWeekStart: "2026-07-06",
        message: "ok",
    },
    streak: {
        synced: true,
        pending: false,
        status: "streak_started",
        currentStreak: 1,
        longestStreak: 1,
        streakFreezes: 0,
        missedDays: 0,
        usedStreakFreezes: 0,
    },
    quests: {
        synced: true,
        pending: false,
        skipped: false,
        code: null,
    },
});
const main = async () => {
    resetLearningCompletionIdempotencyStore();
    let calls = 0;
    const task = async () => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 5));
        return buildResult();
    };
    const [first, second] = await Promise.all([
        runIdempotentLearningCompletion("user:key", task),
        runIdempotentLearningCompletion("user:key", task),
    ]);
    const third = await runIdempotentLearningCompletion("user:key", task);
    assert(calls === 1, "Same idempotency key must execute completion only once.");
    assert(first.xp.earnedXp === 10, "First result must preserve XP.");
    assert(second.xp.earnedXp === 10, "Concurrent retry must reuse result.");
    assert(third.xp.earnedXp === 10, "Later retry must reuse completed result.");
    first.progress.completedNodeIds.push("tampered");
    assert(!third.progress.completedNodeIds.includes("tampered"), "Cached results must be cloned before returning.");
    console.log("Learning idempotency check passed: concurrent and later retries reuse one completion result without shared mutation.");
};
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
