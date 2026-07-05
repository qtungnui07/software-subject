const VIETNAM_UTC_OFFSET_MINUTES = 7 * 60;
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_SECOND = 1000;

export const QUEST_COUNTDOWN_PLACEHOLDER = "--:--:--";
export const QUEST_COUNTDOWN_REFRESHING_LABEL = "Đang làm mới...";

export type QuestResetCountdown = {
  label: string;
  remainingMs: number | null;
  isExpired: boolean;
  isValid: boolean;
};

const padCountdownUnit = (value: number) => String(value).padStart(2, "0");

export const getNextQuestResetAt = (date = new Date()) => {
  const vietnamOffsetMs =
    VIETNAM_UTC_OFFSET_MINUTES * MILLISECONDS_PER_MINUTE;
  const vietnamDate = new Date(date.getTime() + vietnamOffsetMs);
  const nextVietnamMidnightUtc =
    Date.UTC(
      vietnamDate.getUTCFullYear(),
      vietnamDate.getUTCMonth(),
      vietnamDate.getUTCDate() + 1,
    ) - vietnamOffsetMs;

  return new Date(nextVietnamMidnightUtc).toISOString();
};

export const formatQuestCountdown = (remainingMs: number) => {
  const totalSeconds = Math.max(
    0,
    Math.ceil(remainingMs / MILLISECONDS_PER_SECOND),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map(padCountdownUnit).join(":");
};

export const getQuestResetCountdown = (
  nextResetAt: string,
  nowMs = Date.now(),
): QuestResetCountdown => {
  const targetMs = Date.parse(nextResetAt);

  if (!Number.isFinite(targetMs)) {
    return {
      label: QUEST_COUNTDOWN_PLACEHOLDER,
      remainingMs: null,
      isExpired: false,
      isValid: false,
    };
  }

  const remainingMs = Math.max(targetMs - nowMs, 0);

  return {
    label: formatQuestCountdown(remainingMs),
    remainingMs,
    isExpired: remainingMs <= 0,
    isValid: true,
  };
};
