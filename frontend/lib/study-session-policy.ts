export const AFK_INACTIVITY_LIMITS_MS = [30_000, 60_000, 120_000] as const;
export const MAX_STREAK_AFK_COUNT = 3;
export const MIN_STREAK_STUDY_MINUTES = 15;

export const normalizeAfkCount = (value: unknown) => {
  const count = Number(value);
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.min(100, Math.trunc(count)));
};

export const getAfkInactivityLimitMs = (afkCount: number) =>
  AFK_INACTIVITY_LIMITS_MS[
    Math.min(normalizeAfkCount(afkCount), AFK_INACTIVITY_LIMITS_MS.length - 1)
  ];

export const isAfkEligibleForStreak = (afkCount: number) =>
  normalizeAfkCount(afkCount) <= MAX_STREAK_AFK_COUNT;

export const getCompletedStudyMinutes = (durationSeconds: number) =>
  Math.floor(Math.max(0, Number(durationSeconds) || 0) / 60);
