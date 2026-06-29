export const XP_RULES = {
  BASE_LESSON_XP: 15,
  PASSING_ACCURACY: 60,
  GOOD_ACCURACY: 80,
  PERFECT_ACCURACY: 100,
  GOOD_ACCURACY_BONUS: 3,
  PERFECT_ACCURACY_BONUS: 5,
  REPLAY_LESSON_XP: 0,
  DUPLICATE_REQUEST_XP: 0,
  FAILED_LESSON_XP: 0,
  XP_PER_LEVEL: 100,
  DAILY_RESET_HOUR: 0,
  WEEKLY_RESET_DAY: "monday",
  LEADERBOARD_SORT_KEY: "weeklyXp",
} as const;

export type XpRewardType =
  | "first_completion"
  | "replay_no_reward"
  | "duplicate_request"
  | "failed_lesson";

export type CalculateLessonXpInput = {
  accuracy: number;
  isFirstCompletion: boolean;
  isDuplicateRequest?: boolean;
};

export type CalculateLessonXpResult = {
  earnedXp: number;
  baseXp: number;
  accuracyBonus: number;
  accuracy: number;
  isPassed: boolean;
  rewardType: XpRewardType;
  message: string;
};

export type LevelProgress = {
  level: number;
  totalXp: number;
  currentLevelStartXp: number;
  nextLevelXp: number;
  xpIntoCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
};

export const normalizeAccuracy = (accuracy: number) => {
  if (!Number.isFinite(accuracy)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(accuracy)));
};

export const getAccuracyBonus = (accuracy: number) => {
  const normalizedAccuracy = normalizeAccuracy(accuracy);

  if (normalizedAccuracy >= XP_RULES.PERFECT_ACCURACY) {
    return XP_RULES.PERFECT_ACCURACY_BONUS;
  }

  if (normalizedAccuracy >= XP_RULES.GOOD_ACCURACY) {
    return XP_RULES.GOOD_ACCURACY_BONUS;
  }

  return 0;
};

export const calculateLessonXp = ({
  accuracy,
  isFirstCompletion,
  isDuplicateRequest = false,
}: CalculateLessonXpInput): CalculateLessonXpResult => {
  const normalizedAccuracy = normalizeAccuracy(accuracy);
  const isPassed = normalizedAccuracy >= XP_RULES.PASSING_ACCURACY;

  if (isDuplicateRequest) {
    return {
      earnedXp: XP_RULES.DUPLICATE_REQUEST_XP,
      baseXp: 0,
      accuracyBonus: 0,
      accuracy: normalizedAccuracy,
      isPassed,
      rewardType: "duplicate_request",
      message: "Yêu cầu đã được xử lý trước đó, không cộng XP lần hai.",
    };
  }

  if (!isPassed) {
    return {
      earnedXp: XP_RULES.FAILED_LESSON_XP,
      baseXp: 0,
      accuracyBonus: 0,
      accuracy: normalizedAccuracy,
      isPassed,
      rewardType: "failed_lesson",
      message: "Độ chính xác dưới 60%, bài học chưa được tính hoàn thành.",
    };
  }

  if (!isFirstCompletion) {
    return {
      earnedXp: XP_RULES.REPLAY_LESSON_XP,
      baseXp: 0,
      accuracyBonus: 0,
      accuracy: normalizedAccuracy,
      isPassed,
      rewardType: "replay_no_reward",
      message: "Bài học đã từng hoàn thành, học lại không cộng XP để tránh farm.",
    };
  }

  const accuracyBonus = getAccuracyBonus(normalizedAccuracy);
  const earnedXp = XP_RULES.BASE_LESSON_XP + accuracyBonus;

  return {
    earnedXp,
    baseXp: XP_RULES.BASE_LESSON_XP,
    accuracyBonus,
    accuracy: normalizedAccuracy,
    isPassed,
    rewardType: "first_completion",
    message: `Hoàn thành bài học lần đầu, nhận ${earnedXp} XP.`,
  };
};

export const calculateLevelFromXp = (totalXp: number) => {
  const safeTotalXp = Math.max(0, Math.floor(Number.isFinite(totalXp) ? totalXp : 0));

  return Math.floor(safeTotalXp / XP_RULES.XP_PER_LEVEL) + 1;
};

export const getLevelProgress = (totalXp: number): LevelProgress => {
  const safeTotalXp = Math.max(0, Math.floor(Number.isFinite(totalXp) ? totalXp : 0));
  const level = calculateLevelFromXp(safeTotalXp);
  const currentLevelStartXp = (level - 1) * XP_RULES.XP_PER_LEVEL;
  const nextLevelXp = level * XP_RULES.XP_PER_LEVEL;
  const xpIntoCurrentLevel = safeTotalXp - currentLevelStartXp;
  const xpNeededForNextLevel = Math.max(0, nextLevelXp - safeTotalXp);
  const progressPercent = Math.round((xpIntoCurrentLevel / XP_RULES.XP_PER_LEVEL) * 100);

  return {
    level,
    totalXp: safeTotalXp,
    currentLevelStartXp,
    nextLevelXp,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
};
