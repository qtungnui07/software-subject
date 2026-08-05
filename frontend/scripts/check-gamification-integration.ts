import { englishCourse } from "../data/courses/english-course";
import { createDefaultCourseProgress } from "../lib/courses/course-progress";
import { getGamificationSyncPlan } from "../lib/learning/gamification-sync-policy";
import { getLearningProfileStats } from "../lib/learning/profile-stats";
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
    if (!condition)
        throw new Error(message);
};
const firstCompletion = getGamificationSyncPlan({
    newlyCompleted: true,
    xpSynced: true,
    earnedXp: 20,
    xpAlreadyClaimed: false,
});
assert(firstCompletion.shouldSync, "First completion must sync gamification.");
assert(firstCompletion.completedLessonsDelta === 1, "First completion must count one lesson.");
assert(firstCompletion.xpDelta === 20, "First completion must count earned XP.");
const progressOnly = getGamificationSyncPlan({
    newlyCompleted: true,
    xpSynced: false,
    earnedXp: 0,
    xpAlreadyClaimed: false,
});
assert(progressOnly.shouldSync, "Progress completion must still sync streak and lesson quest.");
assert(progressOnly.completedLessonsDelta === 1, "Progress-only completion must count one lesson.");
assert(progressOnly.xpDelta === 0, "Failed XP sync must not invent quest XP.");
const xpRetry = getGamificationSyncPlan({
    newlyCompleted: false,
    xpSynced: true,
    earnedXp: 20,
    xpAlreadyClaimed: false,
});
assert(xpRetry.shouldSync, "A later successful XP retry must sync XP gamification.");
assert(xpRetry.completedLessonsDelta === 0, "XP retry must not count the lesson twice.");
assert(xpRetry.xpDelta === 20, "XP retry must carry only newly earned XP.");
const duplicate = getGamificationSyncPlan({
    newlyCompleted: false,
    xpSynced: true,
    earnedXp: 0,
    xpAlreadyClaimed: true,
});
assert(!duplicate.shouldSync, "Already rewarded completion must not sync again.");
const allPlayableIds = englishCourse.sections.flatMap((section) => section.chapter.nodes
    .filter((node) => node.type !== "chest")
    .map((node) => node.id));
const profileProgress = {
    ...createDefaultCourseProgress(englishCourse),
    currentSectionId: "english-section-3",
    unlockedSectionIds: [
        "english-section-1",
        "english-section-2",
        "english-section-3",
    ],
    completedNodeIds: [
        "lesson-1",
        "en-s2-c1-lesson-1",
        "en-s3-c1-checkpoint",
    ],
};
const stats = getLearningProfileStats(profileProgress, englishCourse);
assert(stats.totalLearningNodes === allPlayableIds.length, "Profile must count all Section 1-3 learning nodes.");
assert(stats.completedLearningNodes === 3, "Profile must count completed nodes across all sections.");
assert(stats.currentSectionId === "english-section-3", "Profile must expose current section.");
console.log("Gamification integration check passed: first completions, partial XP recovery, duplicate guards, and Section 1-3 profile stats are valid.");
