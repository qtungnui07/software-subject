import {
  bonusQuestDefinitions,
  dailyQuestDefinitions,
  defaultQuestSnapshotPreset,
  defaultWeekActivity,
  questSnapshotPresets,
  QUEST_RESET_TIME_LABEL,
  QUEST_TIMEZONE,
  type QuestSnapshotPresetName,
} from "@/constants/quests";
import type {
  QuestDataSource,
  QuestSyncStatus,
  QuestClaimResponse,
  QuestsPageData,
  UserQuestSnapshot,
  WeekActivityDay,
} from "@/types/quest";

import { getClaimedQuestIds } from "./quest-storage";
import { getNextQuestResetAt } from "./quest-time";
import {
  buildQuestSummary,
  resolveBonusQuests,
  resolveDailyQuests,
} from "./quest-utils";

const getDefaultSyncStatus = (source: QuestDataSource): QuestSyncStatus => {
  const lastSyncedAt = new Date().toISOString();

  if (source === "api") {
    return {
      source,
      label: "Đã đồng bộ",
      message: "XP/Streak hôm nay đang lấy từ hệ thống hiện có.",
      lastSyncedAt,
    };
  }

  if (source === "fallback") {
    return {
      source,
      label: "Dữ liệu tạm",
      message: "API chưa sẵn sàng hoặc trả lỗi, Robogo đang giữ UI bằng dữ liệu fallback.",
      lastSyncedAt,
    };
  }

  return {
    source,
    label: "Demo",
    message: "Đang dùng preset mock để test nhanh các trạng thái nhiệm vụ.",
    lastSyncedAt,
  };
};

export const getMockUserQuestSnapshot = (
  presetName: QuestSnapshotPresetName = defaultQuestSnapshotPreset,
): UserQuestSnapshot => {
  const preset = questSnapshotPresets[presetName];

  return {
    ...preset,
    claimedQuestIds: getClaimedQuestIds(),
  };
};

export const buildQuestsPageData = (
  snapshot: UserQuestSnapshot,
  options?: {
    dataSource?: QuestDataSource;
    syncStatus?: QuestSyncStatus;
    weekActivity?: WeekActivityDay[];
    nextResetAt?: string;
  },
): QuestsPageData => {
  const dataSource = options?.dataSource ?? "mock";
  const syncStatus = options?.syncStatus ?? getDefaultSyncStatus(dataSource);
  const dailyQuests = resolveDailyQuests(dailyQuestDefinitions, snapshot);
  const bonusQuests = resolveBonusQuests(bonusQuestDefinitions, snapshot, dailyQuests);
  const summary = buildQuestSummary({
    dailyQuests,
    snapshot,
    weekActivity: options?.weekActivity ?? defaultWeekActivity,
  });

  return {
    dailyQuests,
    bonusQuests,
    summary,
    snapshot,
    timezone: QUEST_TIMEZONE,
    nextResetAt: options?.nextResetAt ?? getNextQuestResetAt(),
    resetTimeLabel: QUEST_RESET_TIME_LABEL,
    dataSource,
    lastSyncedAt: syncStatus.lastSyncedAt,
    syncStatus,
  };
};

export const getQuestsPageDataFromSnapshotSync = (
  snapshot: UserQuestSnapshot,
  options?: {
    dataSource?: QuestDataSource;
    syncStatus?: QuestSyncStatus;
    weekActivity?: WeekActivityDay[];
    nextResetAt?: string;
  },
): QuestsPageData => {
  const dataSource = options?.dataSource ?? "mock";
  const claimedQuestIds = dataSource === "api"
    ? snapshot.claimedQuestIds
    : getClaimedQuestIds();

  return buildQuestsPageData(
    {
      ...snapshot,
      claimedQuestIds,
    },
    options,
  );
};

export const getQuestsPageDataSync = (
  presetName: QuestSnapshotPresetName = defaultQuestSnapshotPreset,
): QuestsPageData => {
  return buildQuestsPageData(getMockUserQuestSnapshot(presetName), {
    dataSource: "mock",
  });
};

export const getQuestsPageData = async (
  presetName: QuestSnapshotPresetName = defaultQuestSnapshotPreset,
): Promise<QuestsPageData> => {
  return getQuestsPageDataSync(presetName);
};

export const claimQuestReward = async (questId: string): Promise<QuestClaimResponse> => {
  const response = await fetch("/api/quests/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questId }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Không thể nhận thưởng nhiệm vụ.");
  }

  return (await response.json()) as QuestClaimResponse;
};
