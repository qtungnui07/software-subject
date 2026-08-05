import { englishCourse } from "@/data/courses/english-course";
import { migrateChapterOneProgressToCourseProgress, projectCourseProgressToChapterOne, } from "@/lib/courses/chapter-one-adapter";
import { createDefaultCourseProgress, getCurrentNodeIdForSection, normalizeCourseProgressState, unlockCourseSection, } from "@/lib/courses/course-progress";
function assert(condition: unknown, message: string): asserts condition {
    if (!condition)
        throw new Error(message);
}
const defaultProgress = createDefaultCourseProgress(englishCourse);
assert(defaultProgress.currentSectionId === "english-section-1", "Default section must be Section 1.");
assert(defaultProgress.unlockedSectionIds.length === 1, "Only Section 1 should be unlocked by default.");
assert(getCurrentNodeIdForSection(defaultProgress, "english-section-1", englishCourse) === "lesson-1", "New users must start at lesson-1.");
const migrated = normalizeCourseProgressState(migrateChapterOneProgressToCourseProgress({
    completedLessons: ["lesson-1", "lesson-2", "invalid-lesson", "lesson-2"],
    currentNodeId: "lesson-3",
    claimedChests: ["chest-1"],
    completedCheckpoint: true,
    updatedAt: "2026-07-09T00:00:00.000Z",
}, englishCourse), englishCourse);
assert(migrated.completedNodeIds.includes("lesson-1"), "lesson-1 was lost during migration.");
assert(migrated.completedNodeIds.includes("lesson-2"), "lesson-2 was lost during migration.");
assert(!migrated.completedNodeIds.includes("invalid-lesson"), "Invalid legacy ids must be removed.");
assert(migrated.claimedRewardNodeIds.includes("chest-1"), "Claimed chest was lost during migration.");
assert(migrated.completedNodeIds.includes("chapter-1-test"), "Completed checkpoint was not migrated.");
assert(migrated.checkpointScores["chapter-1-test"] === 100, "Legacy checkpoint needs a safe passing score.");
const projectedLegacy = projectCourseProgressToChapterOne(migrated, englishCourse);
assert(projectedLegacy.completedCheckpoint, "Course progress must project back to completed legacy checkpoint.");
assert(projectedLegacy.completedLessons.length === 2, "Legacy projection changed completed lesson count.");
const unlocked = unlockCourseSection(migrated, "english-section-2", englishCourse);
assert(unlocked.currentSectionId === "english-section-2", "Unlocking Section 2 must make it current.");
assert(unlocked.unlockedSectionIds.includes("english-section-1"), "Unlocking Section 2 must keep Section 1.");
assert(unlocked.unlockedSectionIds.includes("english-section-2"), "Section 2 unlock was not saved.");
assert(!unlocked.unlockedSectionIds.includes("english-section-3"), "Section 3 must remain locked.");
console.log("Course progress migration check passed: default unlock, legacy preservation, reverse projection and Section 2 unlock are valid.");
