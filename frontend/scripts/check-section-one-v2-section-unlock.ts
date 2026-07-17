import assert from "node:assert/strict";

import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import {
  applyPlacementUnlock,
  canAttemptCheckpoint,
  completeCourseNode,
  recordCheckpointScore,
} from "@/lib/courses/course-unlock-policy";

const initial = createDefaultCourseProgress("english");
const inconsistentLegacy = {
  ...initial,
  completedNodeIds: ["lesson-6"],
};
assert.equal(
  canAttemptCheckpoint(inconsistentLegacy, "chapter-1-test"),
  false,
  "A new/legacy user with missing earlier lessons must not enter the checkpoint.",
);

let ready = initial;
for (const lessonId of [
  "lesson-1",
  "lesson-2",
  "lesson-3",
  "lesson-4",
  "lesson-5",
  "lesson-6",
]) {
  ready = completeCourseNode(ready, lessonId).progress;
}
assert.equal(canAttemptCheckpoint(ready, "chapter-1-test"), true);

const score6999 = recordCheckpointScore(ready, "chapter-1-test", 69.99);
assert.equal(score6999.progress.checkpointScores["chapter-1-test"], 69.99);
assert.equal(
  score6999.progress.unlockedSectionIds.includes("english-section-2"),
  false,
  "69.99% must not unlock Section 2.",
);

const score70 = recordCheckpointScore(
  score6999.progress,
  "chapter-1-test",
  70,
);
assert.equal(score70.unlockedSectionId, "english-section-2");
assert.equal(
  score70.progress.unlockedSectionIds.includes("english-section-2"),
  true,
);

const lowerRetake = recordCheckpointScore(
  score70.progress,
  "chapter-1-test",
  55,
);
assert.equal(lowerRetake.progress.checkpointScores["chapter-1-test"], 70);
assert.equal(
  lowerRetake.progress.unlockedSectionIds.includes("english-section-2"),
  true,
);

const placementUser = applyPlacementUnlock(initial, "english-section-2");
assert.equal(
  canAttemptCheckpoint(placementUser, "chapter-1-test"),
  true,
  "Placement/legacy users who already own Section 2 may take the checkpoint optionally.",
);
const placementLowScore = recordCheckpointScore(
  placementUser,
  "chapter-1-test",
  20,
);
assert.equal(
  placementLowScore.progress.unlockedSectionIds.includes("english-section-2"),
  true,
  "An optional low retake must never relock Section 2.",
);

console.log(
  "Section 1 V2 unlock check passed: all six lessons are required for new users, 69.99/70 boundaries are exact, placement users remain compatible and no retake can relock Section 2.",
);
