export type QuestStatus = "active" | "completed" | "claimed" | "locked";

export type QuestType = "daily" | "weekly" | "monthly" | "perfect-day";

export type QuestMetric =
  | "lesson_completed"
  | "accuracy_reached"
  | "minutes_learned"
  | "xp_earned"
  | "daily_quests_completed"
  | "streak_kept";

export type RewardType = "xp" | "chest" | "badge";

export type ChestTier = "small" | "silver" | "gold";

export type RobotMood = "sleepy" | "awake" | "excited" | "celebrating";

export type QuestDemoState = "normal" | "loading" | "empty" | "error";

export type QuestDataSource = "api" | "mock" | "fallback";

export type QuestReward = {
  type: RewardType;
  label: string;
  xpAmount?: number;
  chestTier?: ChestTier;
  badgeId?: string;
};

export type QuestDefinition = {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  metric: QuestMetric;
  target: number;
  reward: QuestReward;
  icon: string;
  order: number;
  isPreview?: boolean;
};

export type UserQuestSnapshot = {
  lessonsCompletedToday: number;
  bestAccuracyToday: number;
  minutesLearnedToday: number;
  xpEarnedToday: number;
  currentStreak: number;
  claimedQuestIds: string[];
};

export type QuestSyncStatus = {
  source: QuestDataSource;
  label: string;
  message: string;
  lastSyncedAt: string;
  isDemoUser?: boolean;
};

export type ResolvedQuest = QuestDefinition & {
  progress: number;
  progressPercent: number;
  status: QuestStatus;
  canClaim: boolean;
};

export type WeekActivityDay = {
  day: string;
  completed: boolean;
};

export type QuestSummary = {
  todayXp: number;
  currentStreak: number;
  dailyCompleted: number;
  dailyTotal: number;
  perfectDayUnlocked: boolean;
  chestAvailable: boolean;
  robotMood: RobotMood;
  weekActivity: WeekActivityDay[];
};

export type QuestsPageData = {
  dailyQuests: ResolvedQuest[];
  bonusQuests: ResolvedQuest[];
  summary: QuestSummary;
  snapshot: UserQuestSnapshot;
  timezone: "Asia/Ho_Chi_Minh";
  nextResetAt: string;
  resetTimeLabel: "00:00";
  dataSource: QuestDataSource;
  lastSyncedAt: string;
  syncStatus: QuestSyncStatus;
};


export type QuestClaimTodayStats = {
  lessonsCompleted: number;
  xpEarned: number;
  minutesLearned: number;
  bestAccuracy: number;
};

export type QuestClaimChestState = {
  id: string;
  status: "locked" | "ready" | "claimed";
  rewardXp: number;
  canClaim: boolean;
};

export type QuestClaimTodaySnapshot = {
  date: string;
  dailyCompleted: number;
  dailyTotal: number;
  stats: QuestClaimTodayStats;
  quests: ResolvedQuest[];
  bonusQuests: ResolvedQuest[];
  chest: QuestClaimChestState;
  currentStreak: number;
  nextResetAt: string;
  snapshot: UserQuestSnapshot;
  claimedQuestIds: string[];
};

export type QuestClaimResponse = {
  success: true;
  alreadyClaimed: boolean;
  questId: string;
  rewardType: "quest" | "chest";
  rewardXp: number;
  reward: {
    xp: number;
  };
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  currentDay: string;
  currentWeekStart: string;
  today: QuestClaimTodaySnapshot;
};
