import { englishCourse } from "@/data/courses/english-course";
import assert from "node:assert/strict";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { applyPlacementUnlock, completeCourseNode, recordCheckpointScore, selectCourseSection, } from "@/lib/courses/course-unlock-policy";
const initial = createDefaultCourseProgress(englishCourse);
assert.deepEqual(initial.unlockedSectionIds, ["english-section-1"]);
const placementTwo = applyPlacementUnlock(initial, "english-section-2", englishCourse);
assert.deepEqual(placementTwo.unlockedSectionIds, [
    "english-section-1",
    "english-section-2",
]);
assert.equal(placementTwo.currentSectionId, "english-section-2", "A fresh user should start at the assigned section.");
const placementThree = applyPlacementUnlock(placementTwo, "english-section-3", englishCourse);
assert.deepEqual(placementThree.unlockedSectionIds, [
    "english-section-1",
    "english-section-2",
    "english-section-3",
]);
const lowerRetake = applyPlacementUnlock(placementThree, "english-section-1", englishCourse);
assert.deepEqual(lowerRetake.unlockedSectionIds, placementThree.unlockedSectionIds, "A lower retake must never lock an opened section.");
const lockedSelection = selectCourseSection(initial, "english-section-2", englishCourse);
assert.equal(lockedSelection.reason, "locked-section");
let sectionOneProgress = initial;
for (const lessonId of [
    "lesson-1",
    "lesson-2",
    "lesson-3",
    "lesson-4",
    "lesson-5",
    "lesson-6",
]) {
    const result = completeCourseNode(sectionOneProgress, lessonId, englishCourse);
    assert.equal(result.reason, "updated", `${lessonId} should complete in order without requiring the optional chest.`);
    sectionOneProgress = result.progress;
}
const score69 = recordCheckpointScore(sectionOneProgress, "chapter-1-test", 69, englishCourse);
assert.equal(score69.progress.unlockedSectionIds.includes("english-section-2"), false, "69% must not unlock Section 2.");
assert.equal(score69.progress.checkpointScores["chapter-1-test"], 69);
const score70 = recordCheckpointScore(score69.progress, "chapter-1-test", 70, englishCourse);
assert.equal(score70.progress.unlockedSectionIds.includes("english-section-2"), true, "70% must unlock Section 2.");
assert.equal(score70.unlockedSectionId, "english-section-2");
const lowerCheckpointRetake = recordCheckpointScore(score70.progress, "chapter-1-test", 60, englishCourse);
assert.equal(lowerCheckpointRetake.progress.checkpointScores["chapter-1-test"], 70, "Checkpoint must retain the best score.");
assert.equal(lowerCheckpointRetake.progress.unlockedSectionIds.includes("english-section-2"), true);
console.log("Section unlock check passed: placement unlocks contiguously, lower retakes never relock, checkpoint 69/70 boundaries are correct, and best scores are preserved.");
