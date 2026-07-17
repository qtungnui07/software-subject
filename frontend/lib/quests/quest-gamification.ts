import type { ChestTier, QuestsPageData, ResolvedQuest } from "@/types/quest";

export type ChestStatus = "locked" | "available" | "opened";
export type PerfectDayStage = "fresh" | "started" | "close" | "unlocked";
export type LongTermQuestKind = "weekly" | "monthly";

export type ChestView = {
  title: string;
  label: string;
  description: string;
  status: ChestStatus;
  tier: ChestTier;
  tone: "blue" | "silver" | "gold";
};

export type PerfectDayView = {
  stage: PerfectDayStage;
  title: string;
  subtitle: string;
  chestLabel: string;
  robotLine: string;
  statusLabel: string;
};

export type LongTermQuestView = {
  kind: LongTermQuestKind;
  eyebrow: string;
  deadline: string;
  badgeLabel: string;
  milestoneLabel: string;
  nextMilestone: number;
  tone: "weekly" | "monthly";
};

const getRemainingDailyQuests = (data: QuestsPageData) => {
  return Math.max(data.summary.dailyTotal - data.summary.dailyCompleted, 0);
};

export const getPerfectDayStage = (data: QuestsPageData): PerfectDayStage => {
  const completed = data.summary.dailyCompleted;
  const total = data.summary.dailyTotal;

  if (completed >= total) return "unlocked";
  if (completed === total - 1) return "close";
  if (completed > 0) return "started";

  return "fresh";
};

export const getPerfectDayView = (data: QuestsPageData): PerfectDayView => {
  const remaining = getRemainingDailyQuests(data);
  const stage = getPerfectDayStage(data);

  switch (stage) {
    case "unlocked":
      return {
        stage,
        title: "Ngày hoàn hảo đã mở",
        subtitle: "Bạn đã hoàn thành trọn bộ nhiệm vụ hôm nay. Rương bạc đã sẵn sàng để mở ở bước gamification tiếp theo.",
        chestLabel: "Rương bạc sẵn sàng",
        robotLine: "Robo đang ăn mừng ngày học hoàn hảo của bạn.",
        statusLabel: "3/3 hoàn tất",
      };
    case "close":
      return {
        stage,
        title: "Gần chạm Ngày hoàn hảo",
        subtitle: `Còn ${remaining} nhiệm vụ nữa để mở rương bạc và đánh dấu một ngày học hoàn hảo.`,
        chestLabel: "Rương bạc sắp mở",
        robotLine: "Robo đang chờ cú nước rút cuối cùng.",
        statusLabel: "Sắp mở khóa",
      };
    case "started":
      return {
        stage,
        title: "Đã khởi động nhịp học",
        subtitle: `Bạn đã hoàn thành ${data.summary.dailyCompleted}/${data.summary.dailyTotal} nhiệm vụ. Tiếp tục để tiến gần rương bạc.`,
        chestLabel: "Rương bạc đang khóa",
        robotLine: "Robo đã tỉnh dậy và bắt đầu theo dõi tiến độ.",
        statusLabel: "Đang tiến triển",
      };
    default:
      return {
        stage,
        title: "Ngày mới bắt đầu",
        subtitle: "Hoàn thành nhiệm vụ đầu tiên để kích hoạt chuỗi thưởng trong ngày.",
        chestLabel: "Rương bạc đang khóa",
        robotLine: "Robo vẫn đang chờ bạn bắt đầu.",
        statusLabel: "Chưa bắt đầu",
      };
  }
};

export const getTodayChestView = (data: QuestsPageData): ChestView => {
  const perfectDayUnlocked = data.summary.perfectDayUnlocked;
  const smallChestClaimed = data.dailyQuests.some(
    (quest) => quest.reward.type === "chest" && quest.reward.chestTier === "small" && quest.status === "claimed",
  );

  if (perfectDayUnlocked) {
    return {
      title: "Rương Ngày hoàn hảo",
      label: "Rương bạc",
      description: "Bạn đã đủ điều kiện mở rương bạc. Phase 4/5 sẽ xử lý hiệu ứng mở rương và phần thưởng thật.",
      status: "available",
      tier: "silver",
      tone: "silver",
    };
  }

  if (smallChestClaimed) {
    return {
      title: "Rương nhỏ đã nhận",
      label: "Rương nhỏ",
      description: "Bạn đã nhận rương nhỏ từ nhiệm vụ giữ nhịp. Hoàn thành 3/3 để nâng lên rương bạc.",
      status: "opened",
      tier: "small",
      tone: "blue",
    };
  }

  return {
    title: "Rương hôm nay",
    label: "Rương bạc",
    description: `Cần hoàn thành đủ ${data.summary.dailyTotal}/${data.summary.dailyTotal} nhiệm vụ để mở rương bạc Ngày hoàn hảo.`,
    status: "locked",
    tier: "silver",
    tone: "silver",
  };
};

export const getChestStatusLabel = (status: ChestStatus) => {
  if (status === "opened") return "Đã mở";
  if (status === "available") return "Sẵn sàng mở";

  return "Đang khóa";
};

export const getChestTierLabel = (tier: ChestTier) => {
  if (tier === "gold") return "Rương vàng";
  if (tier === "silver") return "Rương bạc";

  return "Rương nhỏ";
};

export const getLongTermQuestView = (quest: ResolvedQuest): LongTermQuestView => {
  if (quest.type === "monthly") {
    return {
      kind: "monthly",
      eyebrow: "Sự kiện tháng",
      deadline: "Kết thúc cuối tháng",
      badgeLabel: "Huy hiệu Ocean Runner",
      milestoneLabel: "Mốc 8 / 15 / 30",
      nextMilestone: quest.progress < 15 ? 15 : quest.target,
      tone: "monthly",
    };
  }

  return {
    kind: "weekly",
    eyebrow: "Nhiệm vụ tuần",
    deadline: "Còn 4 ngày",
    badgeLabel: "Huy hiệu Weekly Flight",
    milestoneLabel: "Mốc 3 / 6 / 10",
    nextMilestone: quest.progress < 6 ? 6 : quest.target,
    tone: "weekly",
  };
};

export const getLongTermMilestones = (quest: ResolvedQuest) => {
  if (quest.type === "monthly") {
    return [8, 15, quest.target];
  }

  return [3, 6, quest.target];
};

export const getGameLoopMessage = (data: QuestsPageData) => {
  const stage = getPerfectDayStage(data);

  if (stage === "unlocked") return "Daily loop đã hoàn tất. Rương bạc đang sẵn sàng.";
  if (stage === "close") return "Còn một bước để hoàn tất vòng lặp hôm nay.";
  if (stage === "started") return "Bạn đã vào nhịp. Ưu tiên hoàn thành daily quests.";

  return "Bắt đầu bằng một bài học ngắn để kích hoạt tiến độ.";
};

export const getChestProgressText = (data: QuestsPageData) => {
  const remaining = getRemainingDailyQuests(data);

  if (remaining <= 0) return "Rương bạc đã sẵn sàng.";

  return `Còn ${remaining} nhiệm vụ để mở rương bạc.`;
};
