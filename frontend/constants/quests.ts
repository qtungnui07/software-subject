import type {
  QuestDefinition,
  UserQuestSnapshot,
  WeekActivityDay,
} from "@/types/quest";

export const DAILY_QUEST_TOTAL = 3;
export const QUEST_TIMEZONE = "Asia/Ho_Chi_Minh" as const;
export const QUEST_RESET_TIME_LABEL = "00:00" as const;

export const dailyQuestDefinitions = [
  {
    id: "daily-lesson-1",
    type: "daily",
    title: "Khởi động bộ nhớ",
    description: "Hoàn thành 1 bài học bất kỳ",
    metric: "lesson_completed",
    target: 1,
    reward: {
      type: "xp",
      label: "+10 XP",
      xpAmount: 10,
    },
    icon: "book-open",
    order: 1,
  },
  {
    id: "daily-accuracy-1",
    type: "daily",
    title: "Học chuẩn xác",
    description: "Đạt ít nhất 80% trong một bài học",
    metric: "accuracy_reached",
    target: 80,
    reward: {
      type: "xp",
      label: "+15 XP",
      xpAmount: 15,
    },
    icon: "target",
    order: 2,
  },
  {
    id: "daily-minutes-1",
    type: "daily",
    title: "Giữ nhịp hôm nay",
    description: "Học ít nhất 10 phút",
    metric: "minutes_learned",
    target: 10,
    reward: {
      type: "chest",
      label: "Rương nhỏ",
      chestTier: "small",
    },
    icon: "clock",
    order: 3,
  },
] satisfies QuestDefinition[];

export const bonusQuestDefinitions = [
  {
    id: "perfect-day",
    type: "perfect-day",
    title: "Ngày hoàn hảo",
    description: "Hoàn thành cả 3 nhiệm vụ hằng ngày",
    metric: "daily_quests_completed",
    target: DAILY_QUEST_TOTAL,
    reward: {
      type: "chest",
      label: "+25 XP hoặc Rương bạc",
      xpAmount: 25,
      chestTier: "silver",
    },
    icon: "sparkles",
    order: 1,
  },
  {
    id: "weekly-flight",
    type: "weekly",
    title: "Chuyến bay tuần này",
    description: "Hoàn thành 10 bài học trước Chủ nhật",
    metric: "lesson_completed",
    target: 10,
    reward: {
      type: "badge",
      label: "+80 XP + Huy hiệu tuần",
      xpAmount: 80,
      badgeId: "weekly-flight",
    },
    icon: "rocket",
    order: 2,
    isPreview: true,
  },
  {
    id: "monthly-ocean-run",
    type: "monthly",
    title: "Robo Ocean Run",
    description: "Hoàn thành 30 nhiệm vụ trong tháng",
    metric: "daily_quests_completed",
    target: 30,
    reward: {
      type: "badge",
      label: "+150 XP + Huy hiệu tháng",
      xpAmount: 150,
      badgeId: "monthly-ocean-run",
    },
    icon: "trophy",
    order: 3,
    isPreview: true,
  },
] satisfies QuestDefinition[];

export const questSnapshotPresets = {
  empty: {
    lessonsCompletedToday: 0,
    bestAccuracyToday: 0,
    minutesLearnedToday: 0,
    xpEarnedToday: 0,
    currentStreak: 0,
    claimedQuestIds: [],
  },
  oneQuestDone: {
    lessonsCompletedToday: 1,
    bestAccuracyToday: 60,
    minutesLearnedToday: 4,
    xpEarnedToday: 10,
    currentStreak: 3,
    claimedQuestIds: [],
  },
  almostPerfect: {
    lessonsCompletedToday: 1,
    bestAccuracyToday: 86,
    minutesLearnedToday: 8,
    xpEarnedToday: 25,
    currentStreak: 6,
    claimedQuestIds: [],
  },
  perfectDay: {
    lessonsCompletedToday: 1,
    bestAccuracyToday: 92,
    minutesLearnedToday: 14,
    xpEarnedToday: 43,
    currentStreak: 7,
    claimedQuestIds: [],
  },
} satisfies Record<string, UserQuestSnapshot>;

export type QuestSnapshotPresetName = keyof typeof questSnapshotPresets;

export const defaultQuestSnapshotPreset: QuestSnapshotPresetName = "empty";

export const defaultWeekActivity = [
  { day: "T2", completed: false },
  { day: "T3", completed: false },
  { day: "T4", completed: false },
  { day: "T5", completed: false },
  { day: "T6", completed: false },
  { day: "T7", completed: false },
  { day: "CN", completed: false },
] satisfies WeekActivityDay[];
