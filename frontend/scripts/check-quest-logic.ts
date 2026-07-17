import {
  DAILY_PERFECT_CHEST_ID,
  buildQuestTodaySnapshot,
  type QuestTodayStats,
} from "../services/quest-service";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(`Quest logic check failed: ${message}`);
  }
};

const getQuest = (snapshot: ReturnType<typeof buildQuestTodaySnapshot>, questId: string) => {
  const quest = snapshot.quests.find((item) => item.id === questId);

  assert(quest, `Missing quest ${questId}`);

  return quest!;
};

const buildStats = (partial: Partial<QuestTodayStats> = {}): QuestTodayStats => ({
  lessonsCompleted: 0,
  xpEarned: 0,
  minutesLearned: 0,
  bestAccuracy: 0,
  ...partial,
});

const newUser = buildQuestTodaySnapshot({
  stats: buildStats(),
  claimedQuestIds: [],
});

assert(newUser.dailyCompleted === 0, "new user should have 0/3 daily progress");
assert(newUser.dailyTotal === 3, "daily total should be 3");
assert(newUser.chest.status === "locked", "new user chest should be locked");
assert(newUser.chest.canClaim === false, "new user cannot claim chest");
assert(newUser.quests.every((quest) => !quest.canClaim), "new user cannot claim any daily quest");

const dirtyClaimWithoutProgress = buildQuestTodaySnapshot({
  stats: buildStats(),
  claimedQuestIds: [DAILY_PERFECT_CHEST_ID],
});

assert(
  dirtyClaimWithoutProgress.chest.status === "locked",
  "chest must stay locked if daily progress is below 3/3 even when a dirty chest claim exists",
);
assert(
  dirtyClaimWithoutProgress.chest.canClaim === false,
  "dirty chest claim without progress must not be claimable",
);

const oneQuestDone = buildQuestTodaySnapshot({
  stats: buildStats({
    lessonsCompleted: 1,
    xpEarned: 10,
    minutesLearned: 5,
    bestAccuracy: 50,
  }),
  claimedQuestIds: [],
});

assert(oneQuestDone.dailyCompleted === 1, "one lesson should complete exactly 1 daily quest");
assert(oneQuestDone.chest.status === "locked", "1/3 should keep chest locked");
assert(getQuest(oneQuestDone, "daily-lesson-1").status === "completed", "lesson quest should be completed");
assert(getQuest(oneQuestDone, "daily-lesson-1").canClaim === true, "completed unclaimed lesson quest should be claimable");
assert(getQuest(oneQuestDone, "daily-accuracy-1").canClaim === false, "incomplete accuracy quest cannot be claimed");
assert(getQuest(oneQuestDone, "daily-minutes-1").canClaim === false, "incomplete minutes quest cannot be claimed");

const perfectDayReady = buildQuestTodaySnapshot({
  stats: buildStats({
    lessonsCompleted: 1,
    xpEarned: 30,
    minutesLearned: 10,
    bestAccuracy: 85,
  }),
  claimedQuestIds: [],
});

assert(perfectDayReady.dailyCompleted === 3, "perfect day should complete 3/3 daily quests");
assert(perfectDayReady.chest.status === "ready", "3/3 unclaimed chest should be ready");
assert(perfectDayReady.chest.canClaim === true, "ready chest should be claimable");
assert(perfectDayReady.quests.every((quest) => quest.canClaim), "all completed unclaimed daily quests should be claimable");

const claimedLessonAndChest = buildQuestTodaySnapshot({
  stats: buildStats({
    lessonsCompleted: 1,
    xpEarned: 30,
    minutesLearned: 10,
    bestAccuracy: 85,
  }),
  claimedQuestIds: ["daily-lesson-1", DAILY_PERFECT_CHEST_ID],
});

assert(claimedLessonAndChest.dailyCompleted === 3, "claimed daily quests still count toward daily progress");
assert(claimedLessonAndChest.chest.status === "claimed", "claimed perfect chest should be marked claimed after 3/3");
assert(claimedLessonAndChest.chest.canClaim === false, "claimed chest must not be claimable");
assert(getQuest(claimedLessonAndChest, "daily-lesson-1").status === "claimed", "claimed lesson quest should be marked claimed");
assert(getQuest(claimedLessonAndChest, "daily-lesson-1").canClaim === false, "claimed lesson quest must not be claimable again");
assert(getQuest(claimedLessonAndChest, "daily-accuracy-1").canClaim === true, "completed unclaimed accuracy quest remains claimable");

console.log("Quest logic check passed: 4 core cases + dirty chest guard are valid.");
