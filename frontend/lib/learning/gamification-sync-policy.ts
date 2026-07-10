export type GamificationSyncPlanInput = {
  newlyCompleted: boolean;
  xpSynced: boolean;
  earnedXp: number;
  xpAlreadyClaimed: boolean;
};

export const getGamificationSyncPlan = ({
  newlyCompleted,
  xpSynced,
  earnedXp,
  xpAlreadyClaimed,
}: GamificationSyncPlanInput) => {
  const hasNewXp = xpSynced && earnedXp > 0 && !xpAlreadyClaimed;
  const shouldSync = newlyCompleted || hasNewXp;

  return {
    shouldSync,
    completedLessonsDelta: newlyCompleted ? 1 : 0,
    xpDelta: hasNewXp ? Math.max(0, Math.trunc(earnedXp)) : 0,
  };
};
