export const AFK_INACTIVITY_LIMIT_MS = 60_000;
export const MAX_STREAK_AFK_COUNT = 3;
export const MIN_STREAK_STUDY_MINUTES = 15;

export const normalizeAfkCount = (value: unknown) => {
  const count = Number(value);
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.min(100, Math.trunc(count)));
};

export const getAfkInactivityLimitMs = (afkCount: number) => {
  void afkCount;
  return AFK_INACTIVITY_LIMIT_MS;
};

export const isAfkEligibleForStreak = (afkCount: number) =>
  normalizeAfkCount(afkCount) <= MAX_STREAK_AFK_COUNT;

export const getCompletedStudyMinutes = (durationSeconds: number) =>
  Math.floor(Math.max(0, Number(durationSeconds) || 0) / 60);
