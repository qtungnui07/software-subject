export type CompletionSyncSystem = "xp" | "streak" | "quests";

export type CompletionSyncSummary = {
  status: "complete" | "partial" | "skipped";
  pendingSystems: CompletionSyncSystem[];
};

export const getCompletionSyncSummary = (input: {
  passed: boolean;
  xpPending: boolean;
  streakPending: boolean;
  questsPending: boolean;
}): CompletionSyncSummary => {
  if (!input.passed) {
    return { status: "skipped", pendingSystems: [] };
  }

  const pendingSystems: CompletionSyncSystem[] = [
    input.xpPending ? "xp" : null,
    input.streakPending ? "streak" : null,
    input.questsPending ? "quests" : null,
  ].filter((item): item is CompletionSyncSystem => item !== null);

  return {
    status: pendingSystems.length > 0 ? "partial" : "complete",
    pendingSystems,
  };
};
