import type {
  QuestDefinition,
  QuestMetric,
  QuestStatus,
  QuestSummary,
  ResolvedQuest,
  RobotMood,
  UserQuestSnapshot,
  WeekActivityDay,
} from "@/types/quest";

export const getQuestProgressPercent = (progress: number, target: number) => {
  if (target <= 0) return 0;

  return Math.min(Math.round((progress / target) * 100), 100);
};

export const getMetricProgress = (
  metric: QuestMetric,
  snapshot: UserQuestSnapshot,
  dailyCompletedCount = 0,
) => {
  switch (metric) {
    case "lesson_completed":
      return snapshot.lessonsCompletedToday;
    case "accuracy_reached":
      return snapshot.bestAccuracyToday;
    case "minutes_learned":
      return snapshot.minutesLearnedToday;
    case "xp_earned":
      return snapshot.xpEarnedToday;
    case "daily_quests_completed":
      return dailyCompletedCount;
    case "streak_kept":
      return snapshot.currentStreak;
    default:
      return 0;
  }
};

export const resolveQuestStatus = (
  quest: QuestDefinition,
  progress: number,
  snapshot: UserQuestSnapshot,
): QuestStatus => {
  if (snapshot.claimedQuestIds.includes(quest.id)) {
    return "claimed";
  }

  if (progress >= quest.target) {
    return "completed";
  }

  if (quest.type === "perfect-day" && progress < quest.target) {
    return "locked";
  }

  return "active";
};

export const resolveQuest = (
  quest: QuestDefinition,
  snapshot: UserQuestSnapshot,
  dailyCompletedCount = 0,
): ResolvedQuest => {
  const rawProgress = getMetricProgress(quest.metric, snapshot, dailyCompletedCount);
  const progress = Math.min(rawProgress, quest.target);
  const status = resolveQuestStatus(quest, progress, snapshot);

  return {
    ...quest,
    progress,
    progressPercent: getQuestProgressPercent(progress, quest.target),
    status,
    canClaim: status === "completed",
  };
};

export const getCompletedQuestCount = (quests: ResolvedQuest[]) => {
  return quests.filter(
    (quest) => quest.status === "completed" || quest.status === "claimed",
  ).length;
};

export const isPerfectDayUnlocked = (dailyQuests: ResolvedQuest[]) => {
  return getCompletedQuestCount(dailyQuests) >= dailyQuests.length;
};

export const getRobotMood = (dailyCompleted: number): RobotMood => {
  if (dailyCompleted >= 3) return "celebrating";
  if (dailyCompleted === 2) return "excited";
  if (dailyCompleted === 1) return "awake";

  return "sleepy";
};

export const resolveDailyQuests = (
  definitions: QuestDefinition[],
  snapshot: UserQuestSnapshot,
) => {
  return definitions
    .map((quest) => resolveQuest(quest, snapshot))
    .sort((a, b) => a.order - b.order);
};

export const resolveBonusQuests = (
  definitions: QuestDefinition[],
  snapshot: UserQuestSnapshot,
  dailyQuests: ResolvedQuest[],
) => {
  const dailyCompletedCount = getCompletedQuestCount(dailyQuests);

  return definitions
    .map((quest) => resolveQuest(quest, snapshot, dailyCompletedCount))
    .sort((a, b) => a.order - b.order);
};

export const buildQuestSummary = ({
  dailyQuests,
  snapshot,
  weekActivity,
}: {
  dailyQuests: ResolvedQuest[];
  snapshot: UserQuestSnapshot;
  weekActivity: WeekActivityDay[];
}): QuestSummary => {
  const dailyCompleted = getCompletedQuestCount(dailyQuests);
  const perfectDayUnlocked = isPerfectDayUnlocked(dailyQuests);

  return {
    todayXp: snapshot.xpEarnedToday,
    currentStreak: snapshot.currentStreak,
    dailyCompleted,
    dailyTotal: dailyQuests.length,
    perfectDayUnlocked,
    chestAvailable: dailyQuests.some(
      (quest) => quest.reward.type === "chest" && quest.status === "completed",
    ),
    robotMood: getRobotMood(dailyCompleted),
    weekActivity,
  };
};
