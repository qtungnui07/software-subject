import type {
  QuestClaimResponse,
  QuestsPageData,
  UserQuestSnapshot,
} from "@/types/quest";

import { notifyQuestStorageChange } from "./quest-storage";
import { buildQuestSummary } from "./quest-utils";

export const claimQuestReward = async (
  questId: string,
): Promise<QuestClaimResponse> => {
  const response = await fetch("/api/quests/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questId }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Không thể nhận thưởng nhiệm vụ.");
  }
  const result = (await response.json()) as QuestClaimResponse;
  notifyQuestStorageChange();
  return result;
};

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

  const dailyQuests = result.today.quests;
  const bonusQuests = result.today.bonusQuests;
  const weekActivity = currentData.summary.weekActivity;
  return {
    ...currentData,
    dailyQuests,
    bonusQuests,
    summary: buildQuestSummary({ dailyQuests, snapshot, weekActivity }),
    snapshot,
    dataSource: "api",
    lastSyncedAt,
    nextResetAt: result.today.nextResetAt || currentData.nextResetAt,
    syncStatus: {
      ...currentData.syncStatus,
      source: "api",
      label: "Đã đồng bộ",
      message: "Trạng thái nhận thưởng đã được đồng bộ với hệ thống.",
      lastSyncedAt,
    },
  };
};
