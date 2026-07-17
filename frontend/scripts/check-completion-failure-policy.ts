import assert from "node:assert/strict";

import { getCompletionSyncSummary } from "@/lib/learning/completion-failure-policy";
import { getGamificationSyncPlan } from "@/lib/learning/gamification-sync-policy";

assert.deepEqual(
  getCompletionSyncSummary({
    passed: false,
    xpPending: false,
    streakPending: false,
    questsPending: false,
  }),
  { status: "skipped", pendingSystems: [] },
);

assert.deepEqual(
  getCompletionSyncSummary({
    passed: true,
    xpPending: false,
    streakPending: false,
    questsPending: false,
  }),
  { status: "complete", pendingSystems: [] },
);

assert.deepEqual(
  getCompletionSyncSummary({
    passed: true,
    xpPending: true,
    streakPending: false,
    questsPending: true,
  }),
  { status: "partial", pendingSystems: ["xp", "quests"] },
);

const progressOnly = getGamificationSyncPlan({
  newlyCompleted: true,
  xpSynced: false,
  earnedXp: 0,
  xpAlreadyClaimed: false,
});
assert.equal(progressOnly.shouldSync, true);
assert.equal(progressOnly.completedLessonsDelta, 1);
assert.equal(progressOnly.xpDelta, 0);

const xpRecovery = getGamificationSyncPlan({
  newlyCompleted: false,
  xpSynced: true,
  earnedXp: 20,
  xpAlreadyClaimed: false,
});
assert.equal(xpRecovery.shouldSync, true);
assert.equal(xpRecovery.completedLessonsDelta, 0);
assert.equal(xpRecovery.xpDelta, 20);

const duplicate = getGamificationSyncPlan({
  newlyCompleted: false,
  xpSynced: true,
  earnedXp: 0,
  xpAlreadyClaimed: true,
});
assert.equal(duplicate.shouldSync, false);

console.log(
  "Completion failure policy check passed: progress survives partial gamification failures, pending systems are explicit, and recovery never duplicates lesson progress.",
);
