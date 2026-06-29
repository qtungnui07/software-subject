import {
  CHAPTER_ONE_MAIN_PROGRESS_TOTAL,
  chapterOneNodes,
  getChapterOneNodeById,
  type ChapterOneNode,
} from "@/constants/chapter-one";

export type ChapterOneProgressState = {
  completedLessons: string[];
  currentNodeId: string;
  claimedChests: string[];
  completedCheckpoint: boolean;
  updatedAt: string;
};

export type ChapterOneNodeStatus = "completed" | "current" | "available" | "locked";

export type ChapterOneProgressSummary = {
  completedMainNodes: number;
  totalMainNodes: number;
  percent: number;
  currentNodeId: string;
};

export const CHAPTER_ONE_PROGRESS_KEY = "robogo_chapter_1_progress";
export const CHAPTER_ONE_PROGRESS_UPDATED_EVENT = "robogo-chapter-one-progress-updated";

const FIRST_CHAPTER_ONE_NODE_ID = "lesson-1";
const CHAPTER_ONE_CHECKPOINT_ID = "chapter-1-test";

const chapterOneLessonIds = new Set(
  chapterOneNodes.filter((node) => node.type === "lesson").map((node) => node.id)
);
const chapterOneChestIds = new Set(
  chapterOneNodes.filter((node) => node.type === "chest").map((node) => node.id)
);

const isBrowser = () => typeof window !== "undefined";

const uniqueValidIds = (ids: unknown, allowedIds: Set<string>) => {
  if (!Array.isArray(ids)) return [];

  const uniqueIds = new Set<string>();

  ids.forEach((id) => {
    if (typeof id === "string" && allowedIds.has(id)) {
      uniqueIds.add(id);
    }
  });

  return Array.from(uniqueIds).sort((a, b) => {
    const nodeA = getChapterOneNodeById(a);
    const nodeB = getChapterOneNodeById(b);

    return (nodeA?.order ?? 0) - (nodeB?.order ?? 0);
  });
};

const getDefaultChapterOneProgress = (): ChapterOneProgressState => ({
  completedLessons: [],
  currentNodeId: FIRST_CHAPTER_ONE_NODE_ID,
  claimedChests: [],
  completedCheckpoint: false,
  updatedAt: new Date().toISOString(),
});

const getNextChapterOneNode = (nodeId: string) => {
  const currentNode = getChapterOneNodeById(nodeId);
  if (!currentNode) return null;

  return chapterOneNodes.find((node) => node.order === currentNode.order + 1) ?? null;
};

const isLessonCompleted = (node: ChapterOneNode, state: ChapterOneProgressState) => {
  return node.type === "lesson" && state.completedLessons.includes(node.id);
};

const isChestClaimed = (node: ChapterOneNode, state: ChapterOneProgressState) => {
  return node.type === "chest" && state.claimedChests.includes(node.id);
};

const isCheckpointCompleted = (node: ChapterOneNode, state: ChapterOneProgressState) => {
  return node.type === "checkpoint" && state.completedCheckpoint;
};

const inferCurrentChapterOneNodeId = (state: Pick<ChapterOneProgressState, "completedLessons" | "claimedChests" | "completedCheckpoint">) => {
  const safeState: ChapterOneProgressState = {
    completedLessons: uniqueValidIds(state.completedLessons, chapterOneLessonIds),
    claimedChests: uniqueValidIds(state.claimedChests, chapterOneChestIds),
    completedCheckpoint: Boolean(state.completedCheckpoint),
    currentNodeId: FIRST_CHAPTER_ONE_NODE_ID,
    updatedAt: new Date().toISOString(),
  };

  for (const node of chapterOneNodes) {
    if (node.type === "lesson" && !isLessonCompleted(node, safeState)) {
      return node.id;
    }

    if (node.type === "chest" && !isChestClaimed(node, safeState)) {
      return node.id;
    }

    if (node.type === "checkpoint" && !isCheckpointCompleted(node, safeState)) {
      return node.id;
    }
  }

  return CHAPTER_ONE_CHECKPOINT_ID;
};

const normalizeChapterOneProgress = (state: Partial<ChapterOneProgressState>): ChapterOneProgressState => {
  const completedLessons = uniqueValidIds(state.completedLessons, chapterOneLessonIds);
  const claimedChests = uniqueValidIds(state.claimedChests, chapterOneChestIds);
  const completedCheckpoint = Boolean(state.completedCheckpoint);
  const currentNodeId = inferCurrentChapterOneNodeId({
    completedLessons,
    claimedChests,
    completedCheckpoint,
  });

  return {
    completedLessons,
    currentNodeId,
    claimedChests,
    completedCheckpoint,
    updatedAt: typeof state.updatedAt === "string" ? state.updatedAt : new Date().toISOString(),
  };
};

const readStoredChapterOneProgress = () => {
  if (!isBrowser()) return null;

  try {
    const rawProgress = window.localStorage.getItem(CHAPTER_ONE_PROGRESS_KEY);
    if (!rawProgress) return null;

    const parsedProgress = JSON.parse(rawProgress) as Partial<ChapterOneProgressState>;

    if (!parsedProgress || typeof parsedProgress !== "object") {
      return null;
    }

    return normalizeChapterOneProgress(parsedProgress);
  } catch {
    return null;
  }
};

const emitChapterOneProgressUpdated = () => {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event(CHAPTER_ONE_PROGRESS_UPDATED_EVENT));
};

export const getInitialChapterOneProgress = () => getDefaultChapterOneProgress();

export const getChapterOneProgress = () => {
  return readStoredChapterOneProgress() ?? getDefaultChapterOneProgress();
};

export const saveChapterOneProgress = (state: ChapterOneProgressState) => {
  const nextState = normalizeChapterOneProgress({
    ...state,
    updatedAt: new Date().toISOString(),
  });

  if (isBrowser()) {
    window.localStorage.setItem(CHAPTER_ONE_PROGRESS_KEY, JSON.stringify(nextState));
    emitChapterOneProgressUpdated();
  }

  return nextState;
};

export const resetChapterOneProgress = () => {
  const defaultState = getDefaultChapterOneProgress();

  if (isBrowser()) {
    window.localStorage.removeItem(CHAPTER_ONE_PROGRESS_KEY);
    emitChapterOneProgressUpdated();
  }

  return defaultState;
};

export const canCompleteChapterOneNode = (
  nodeId: string,
  state: ChapterOneProgressState = getChapterOneProgress()
) => {
  const node = getChapterOneNodeById(nodeId);
  if (!node || node.type === "chest") return false;

  const status = getChapterOneNodeStatus(nodeId, state);

  return status === "current" || status === "completed";
};

export const completeChapterOneLesson = (lessonId: string) => {
  const node = getChapterOneNodeById(lessonId);
  const currentState = getChapterOneProgress();

  if (!node || node.type !== "lesson") {
    return currentState;
  }

  // Idempotent replay: a completed lesson stays completed, but it must not
  // advance currentNodeId again or inflate progress.
  if (currentState.completedLessons.includes(lessonId)) {
    return currentState;
  }

  // A lesson can be played by URL for demo/testing, but locked lessons must not
  // mutate the roadmap. This prevents skipping directly to later lessons.
  if (getChapterOneNodeStatus(lessonId, currentState) !== "current") {
    return currentState;
  }

  const completedLessons = uniqueValidIds(
    [...currentState.completedLessons, lessonId],
    chapterOneLessonIds
  );
  const nextNode = getNextChapterOneNode(lessonId);
  const nextState = normalizeChapterOneProgress({
    ...currentState,
    completedLessons,
    currentNodeId: nextNode?.id ?? inferCurrentChapterOneNodeId({
      completedLessons,
      claimedChests: currentState.claimedChests,
      completedCheckpoint: currentState.completedCheckpoint,
    }),
  });

  return saveChapterOneProgress(nextState);
};

export const claimChapterOneChest = (chestId: string) => {
  const node = getChapterOneNodeById(chestId);
  const currentState = getChapterOneProgress();

  if (!node || node.type !== "chest") {
    return currentState;
  }

  // Idempotent replay: claimed chests do not grant rewards again and do not
  // change currentNodeId or progress.
  if (currentState.claimedChests.includes(chestId)) {
    return currentState;
  }

  if (getChapterOneNodeStatus(chestId, currentState) !== "available") {
    return currentState;
  }

  const claimedChests = uniqueValidIds([...currentState.claimedChests, chestId], chapterOneChestIds);
  const nextNode = getNextChapterOneNode(chestId);
  const nextState = normalizeChapterOneProgress({
    ...currentState,
    claimedChests,
    currentNodeId: nextNode?.id ?? inferCurrentChapterOneNodeId({
      completedLessons: currentState.completedLessons,
      claimedChests,
      completedCheckpoint: currentState.completedCheckpoint,
    }),
  });

  return saveChapterOneProgress(nextState);
};

export const completeChapterOneCheckpoint = (checkpointId = CHAPTER_ONE_CHECKPOINT_ID) => {
  const node = getChapterOneNodeById(checkpointId);
  const currentState = getChapterOneProgress();

  if (!node || node.type !== "checkpoint") {
    return currentState;
  }

  // Idempotent replay: passing the checkpoint again keeps Chapter 1 at 100%
  // without changing lesson progress.
  if (currentState.completedCheckpoint) {
    return currentState;
  }

  if (getChapterOneNodeStatus(checkpointId, currentState) !== "current") {
    return currentState;
  }

  const nextState = normalizeChapterOneProgress({
    ...currentState,
    completedCheckpoint: true,
    currentNodeId: checkpointId,
  });

  return saveChapterOneProgress(nextState);
};

export const getChapterOneNodeStatus = (
  nodeId: string,
  state: ChapterOneProgressState = getChapterOneProgress()
): ChapterOneNodeStatus => {
  const node = getChapterOneNodeById(nodeId);
  if (!node) return "locked";

  if (node.type === "lesson" && state.completedLessons.includes(node.id)) {
    return "completed";
  }

  if (node.type === "chest" && state.claimedChests.includes(node.id)) {
    return "completed";
  }

  if (node.type === "checkpoint" && state.completedCheckpoint) {
    return "completed";
  }

  if (node.id === state.currentNodeId) {
    return node.type === "chest" ? "available" : "current";
  }

  return "locked";
};

export const getChapterOneCompletedMainCount = (
  state: ChapterOneProgressState = getChapterOneProgress()
) => {
  const completedLessonCount = uniqueValidIds(state.completedLessons, chapterOneLessonIds).length;
  const checkpointCount = state.completedCheckpoint ? 1 : 0;

  return Math.min(completedLessonCount + checkpointCount, CHAPTER_ONE_MAIN_PROGRESS_TOTAL);
};

export const getChapterOneProgressPercent = (
  state: ChapterOneProgressState = getChapterOneProgress()
) => {
  const completedMainNodes = getChapterOneCompletedMainCount(state);

  return Math.round((completedMainNodes / CHAPTER_ONE_MAIN_PROGRESS_TOTAL) * 100);
};

export const getChapterOneProgressSummary = (
  state: ChapterOneProgressState = getChapterOneProgress()
): ChapterOneProgressSummary => {
  return {
    completedMainNodes: getChapterOneCompletedMainCount(state),
    totalMainNodes: CHAPTER_ONE_MAIN_PROGRESS_TOTAL,
    percent: getChapterOneProgressPercent(state),
    currentNodeId: state.currentNodeId,
  };
};

export const subscribeChapterOneProgress = (callback: () => void) => {
  if (!isBrowser()) return () => undefined;

  window.addEventListener(CHAPTER_ONE_PROGRESS_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener(CHAPTER_ONE_PROGRESS_UPDATED_EVENT, callback);
  };
};
