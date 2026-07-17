export const MAX_LEARNING_SYNC_ATTEMPTS = 5;

const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  6 * 60 * 60_000,
] as const;

export const getLearningSyncRetryDecision = (
  completedAttempts: number,
  now = new Date(),
) => {
  const attempts = Math.max(0, Math.trunc(completedAttempts));
  const exhausted = attempts >= MAX_LEARNING_SYNC_ATTEMPTS;
  const delayIndex = Math.min(
    Math.max(0, attempts - 1),
    RETRY_DELAYS_MS.length - 1,
  );

  return {
    exhausted,
    status: exhausted ? ("failed" as const) : ("pending" as const),
    nextRetryAt: exhausted
      ? null
      : new Date(now.getTime() + RETRY_DELAYS_MS[delayIndex]),
  };
};
