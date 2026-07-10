import type { LearningCompletionResult } from "@/types/learning-completion";

const MAX_RESULTS = 500;
const completedResults = new Map<string, LearningCompletionResult>();
const inFlightResults = new Map<string, Promise<LearningCompletionResult>>();

const cloneResult = (result: LearningCompletionResult) =>
  JSON.parse(JSON.stringify(result)) as LearningCompletionResult;

const trimCompletedResults = () => {
  while (completedResults.size > MAX_RESULTS) {
    const firstKey = completedResults.keys().next().value as string | undefined;
    if (!firstKey) break;
    completedResults.delete(firstKey);
  }
};

export const runIdempotentLearningCompletion = async (
  key: string,
  task: () => Promise<LearningCompletionResult>,
) => {
  const completed = completedResults.get(key);
  if (completed) return cloneResult(completed);

  const inFlight = inFlightResults.get(key);
  if (inFlight) return cloneResult(await inFlight);

  const promise = task();
  inFlightResults.set(key, promise);

  try {
    const result = await promise;
    const hasPendingSync =
      result.xp.pending || result.streak.pending || result.quests.pending;

    if (!hasPendingSync) {
      completedResults.set(key, cloneResult(result));
      trimCompletedResults();
    }

    return cloneResult(result);
  } finally {
    inFlightResults.delete(key);
  }
};

export const resetLearningCompletionIdempotencyStore = () => {
  completedResults.clear();
  inFlightResults.clear();
};
