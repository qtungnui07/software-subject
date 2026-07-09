import assert from "node:assert/strict";

import { migrateChapterOneProgressToCourseProgress } from "@/lib/courses/chapter-one-adapter";
import {
  createDefaultCourseProgress,
  normalizeCourseProgressState,
} from "@/lib/courses/course-progress";

const newUser = createDefaultCourseProgress("english");
assert.equal(newUser.onboardingStatus, "pending");
assert.equal(newUser.onboardingChoice, null);
assert.equal(newUser.onboardingCompletedAt, null);

const legacyUser = normalizeCourseProgressState(
  migrateChapterOneProgressToCourseProgress({
    completedLessons: ["lesson-1"],
    claimedChests: [],
    completedCheckpoint: false,
    updatedAt: "2026-07-09T03:00:00.000Z",
  }),
);
assert.equal(
  legacyUser.onboardingStatus,
  "completed",
  "Legacy Chapter 1 users must not be forced into onboarding.",
);
assert.equal(
  legacyUser.onboardingCompletedAt,
  "2026-07-09T03:00:00.000Z",
);

const placementInProgress = normalizeCourseProgressState({
  ...newUser,
  onboardingStatus: "placement_in_progress",
  onboardingChoice: "placement",
});
assert.equal(placementInProgress.onboardingStatus, "placement_in_progress");
assert.equal(placementInProgress.onboardingChoice, "placement");

const completed = normalizeCourseProgressState({
  ...newUser,
  onboardingStatus: "completed",
  onboardingChoice: "basic",
  onboardingCompletedAt: "2026-07-09T04:00:00.000Z",
});
assert.equal(completed.onboardingStatus, "completed");
assert.equal(completed.onboardingChoice, "basic");
assert.equal(completed.onboardingCompletedAt, "2026-07-09T04:00:00.000Z");

console.log(
  "Onboarding migration check passed: new users remain pending, legacy progress is exempt, and persisted states normalize safely.",
);
