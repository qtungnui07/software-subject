import assert from "node:assert/strict";

import {
  migrateChapterOneProgressToCourseProgress,
  projectCourseProgressToChapterOne,
} from "@/lib/courses/chapter-one-adapter";
import { normalizeCourseProgressState } from "@/lib/courses/course-progress";

const legacyUpdatedAt = "2026-07-08T10:00:00.000Z";
const legacy = {
  completedLessons: ["lesson-1", "lesson-2"],
  claimedChests: ["chest-1"],
  completedCheckpoint: true,
  updatedAt: legacyUpdatedAt,
};

const existing = normalizeCourseProgressState({
  courseId: "english",
  currentSectionId: "english-section-2",
  unlockedSectionIds: ["english-section-1", "english-section-2"],
  completedNodeIds: ["en-s2-c1-lesson-1"],
  checkpointScores: { "en-s2-c1-checkpoint": 80 },
  onboardingStatus: "completed",
  onboardingChoice: "placement",
  onboardingCompletedAt: "2026-07-09T10:00:00.000Z",
});

const migrated = normalizeCourseProgressState(
  migrateChapterOneProgressToCourseProgress(legacy, existing),
);
assert.equal(migrated.currentSectionId, "english-section-2");
assert.equal(migrated.unlockedSectionIds.includes("english-section-2"), true);
assert.equal(migrated.completedNodeIds.includes("lesson-1"), true);
assert.equal(migrated.completedNodeIds.includes("lesson-2"), true);
assert.equal(migrated.completedNodeIds.includes("chapter-1-test"), true);
assert.equal(migrated.completedNodeIds.includes("en-s2-c1-lesson-1"), true);
assert.equal(migrated.claimedRewardNodeIds.includes("chest-1"), true);
assert.equal(migrated.checkpointScores["chapter-1-test"], 100);
assert.equal(migrated.checkpointScores["en-s2-c1-checkpoint"], 80);
assert.equal(migrated.onboardingStatus, "completed");
assert.equal(migrated.onboardingChoice, "placement");

const projected = projectCourseProgressToChapterOne(migrated);
assert.deepEqual(projected.completedLessons, ["lesson-1", "lesson-2"]);
assert.deepEqual(projected.claimedChests, ["chest-1"]);
assert.equal(projected.completedCheckpoint, true);

const dirty = normalizeCourseProgressState({
  ...migrated,
  unlockedSectionIds: ["english-section-3"],
  completedNodeIds: [...migrated.completedNodeIds, "unknown-node"],
});
assert.deepEqual(dirty.unlockedSectionIds, [
  "english-section-1",
  "english-section-2",
  "english-section-3",
]);
assert.equal(dirty.completedNodeIds.includes("unknown-node"), false);

console.log(
  "Legacy user migration check passed: Chapter 1 progress merges without data loss, onboarding stays completed, reverse projection remains valid, and dirty IDs normalize safely.",
);
