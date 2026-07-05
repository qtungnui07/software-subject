import type {
  QuestClaimResponse,
  QuestsPageData,
  UserQuestSnapshot,
} from "@/types/quest";

import { buildQuestsPageData } from "./quest-adapter";

const toSafeXp = (value: unknown) => {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
};

const getClaimedQuestIds = (
  currentData: QuestsPageData,
  result: QuestClaimResponse,
) => {
  return Array.from(
    new Set([
      ...currentData.snapshot.claimedQuestIds,
      ...result.today.snapshot.claimedQuestIds,
      ...result.today.claimedQuestIds,
      result.questId,
    ]),
  );
};

export const applyQuestClaimResultToPageData = (
  currentData: QuestsPageData,
  result: QuestClaimResponse,
): QuestsPageData => {
  const claimedQuestIds = getClaimedQuestIds(currentData, result);
  const snapshot: UserQuestSnapshot = {
    ...currentData.snapshot,
    ...result.today.snapshot,
    currentStreak: result.today.currentStreak,
    xpEarnedToday: Math.max(
      toSafeXp(currentData.snapshot.xpEarnedToday),
      toSafeXp(result.today.snapshot.xpEarnedToday),
      toSafeXp(result.dailyXp),
    ),
    claimedQuestIds,
  };
  const lastSyncedAt = new Date().toISOString();

  return buildQuestsPageData(snapshot, {
    dataSource: "api",
    syncStatus: {
      ...currentData.syncStatus,
      source: "api",
      label: "Đã đồng bộ",
      message: "Trạng thái nhận thưởng đã được đồng bộ với hệ thống.",
      lastSyncedAt,
    },
    weekActivity: currentData.summary.weekActivity,
    nextResetAt: result.today.nextResetAt || currentData.nextResetAt,
  });
};
