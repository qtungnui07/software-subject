import assert from "node:assert/strict";

import {
  applyQuestClaimResultToPageData,
  buildQuestsPageData,
  getQuestsPageDataFromSnapshotSync,
} from "../lib/quests";
import type { QuestClaimResponse, UserQuestSnapshot } from "../types/quest";

const initialSnapshot: UserQuestSnapshot = {
  lessonsCompletedToday: 1,
  bestAccuracyToday: 85,
  minutesLearnedToday: 10,
  xpEarnedToday: 18,
  currentStreak: 3,
  claimedQuestIds: [],
};

const initialData = buildQuestsPageData(initialSnapshot, {
  dataSource: "api",
  nextResetAt: "2026-07-06T17:00:00.000Z",
});

const buildClaimResponse = (alreadyClaimed = false): QuestClaimResponse => ({
  success: true,
  alreadyClaimed,
  questId: "daily-lesson-1",
  rewardType: "quest",
  rewardXp: alreadyClaimed ? 0 : 10,
  reward: { xp: alreadyClaimed ? 0 : 10 },
  totalXp: 128,
  dailyXp: 28,
  weeklyXp: 48,
  currentDay: "2026-07-06",
  currentWeekStart: "2026-07-06",
  today: {
    date: "2026-07-06",
    dailyCompleted: 3,
    dailyTotal: 3,
    stats: {
      lessonsCompleted: 1,
      xpEarned: 18,
      minutesLearned: 10,
      bestAccuracy: 85,
    },
    quests: [],
    bonusQuests: [],
    chest: {
      id: "daily-perfect-chest",
      status: "ready",
      rewardXp: 30,
      canClaim: true,
    },
    currentStreak: 3,
    nextResetAt: "2026-07-07T17:00:00.000Z",
    snapshot: {
      ...initialSnapshot,
      claimedQuestIds: ["daily-lesson-1"],
    },
    claimedQuestIds: ["daily-lesson-1"],
  },
});

const claimedData = applyQuestClaimResultToPageData(
  initialData,
  buildClaimResponse(),
);
const claimedQuest = claimedData.dailyQuests.find(
  (quest) => quest.id === "daily-lesson-1",
);
const untouchedQuest = claimedData.dailyQuests.find(
  (quest) => quest.id === "daily-accuracy-1",
);

assert.equal(claimedQuest?.status, "claimed");
assert.equal(claimedQuest?.canClaim, false);
assert.equal(untouchedQuest?.status, "completed");
assert.equal(claimedData.summary.todayXp, 28);
assert.equal(claimedData.dataSource, "api");
assert.equal(claimedData.nextResetAt, "2026-07-07T17:00:00.000Z");
assert.deepEqual(claimedData.snapshot.claimedQuestIds, ["daily-lesson-1"]);

const alreadyClaimedData = applyQuestClaimResultToPageData(
  initialData,
  buildClaimResponse(true),
);
assert.equal(
  alreadyClaimedData.dailyQuests.find((quest) => quest.id === "daily-lesson-1")?.status,
  "claimed",
);

const hydratedApiData = getQuestsPageDataFromSnapshotSync(
  {
    ...initialSnapshot,
    claimedQuestIds: ["daily-lesson-1"],
  },
  { dataSource: "api" },
);
assert.equal(
  hydratedApiData.dailyQuests.find((quest) => quest.id === "daily-lesson-1")?.status,
  "claimed",
);

console.log(
  "Quest claim state check passed: loading-safe transition, claimed UI, XP sync, and server claim precedence are valid.",
);
