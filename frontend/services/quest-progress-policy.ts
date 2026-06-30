export type LessonXpCompletionLike = {
  isPassed?: unknown;
  alreadyClaimed?: unknown;
  earnedXp?: unknown;
};

export type QuestProgressSkipCode =
  | "LESSON_NOT_PASSED"
  | "LESSON_XP_ALREADY_CLAIMED"
  | "LESSON_XP_NOT_EARNED";

export const toSafeInteger = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.trunc(parsed));
    }
  }

  return fallback;
};

export const normalizeQuestAccuracy = (value: unknown) => {
  return Math.min(toSafeInteger(value, 0), 100);
};

export const normalizeQuestDurationSeconds = (value: unknown) => {
  return toSafeInteger(value, 0);
};

export const shouldRecordQuestProgress = (result: LessonXpCompletionLike) => {
  return (
    result.isPassed === true &&
    result.alreadyClaimed !== true &&
    toSafeInteger(result.earnedXp, 0) > 0
  );
};

export const getQuestProgressSkipCode = (
  result: LessonXpCompletionLike,
): QuestProgressSkipCode | null => {
  if (result.isPassed !== true) {
    return "LESSON_NOT_PASSED";
  }

  if (result.alreadyClaimed === true) {
    return "LESSON_XP_ALREADY_CLAIMED";
  }

  if (toSafeInteger(result.earnedXp, 0) <= 0) {
    return "LESSON_XP_NOT_EARNED";
  }

  return null;
};
