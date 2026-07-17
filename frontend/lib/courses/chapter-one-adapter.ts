import {
  chapterOneNodes,
  type ChapterOneNode,
} from "@/constants/chapter-one";
import {
  normalizeChapterOneProgressState,
  type ChapterOneProgressState,
} from "@/lib/chapter-one-progress";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { LearningNodeDefinition } from "@/types/course";

export const ENGLISH_SECTION_ONE_ID = "english-section-1";
export const ENGLISH_SECTION_ONE_CHECKPOINT_ID = "chapter-1-test";

export const adaptChapterOneNode = (
  node: ChapterOneNode
): LearningNodeDefinition => ({
  id: node.id,
  legacyId: node.legacyId,
  type: node.type,
  title: node.title,
  shortTitle: node.shortTitle,
  description: node.description,
  order: node.order,
  unlockAfterId: node.unlockAfterId,
  href: node.href,
  xp: node.xp,
  countsTowardProgress: node.countsTowardProgress,
  contentStatus: "ready",
  rewards: node.rewards,
  roadmapPosition: {
    x: node.x,
    y: node.y,
  },
});

export const getAdaptedChapterOneNodes = () => {
  return chapterOneNodes.map(adaptChapterOneNode);
};

const mergeUniqueIds = (...groups: string[][]) => {
  return Array.from(new Set(groups.flat()));
};

export const migrateChapterOneProgressToCourseProgress = (
  legacyState: Partial<ChapterOneProgressState>,
  existingState?: CourseProgressState
): CourseProgressState => {
  const normalizedLegacy = normalizeChapterOneProgressState(legacyState);
  const completedNodeIds = [
    ...normalizedLegacy.completedLessons,
    ...(normalizedLegacy.completedCheckpoint
      ? [ENGLISH_SECTION_ONE_CHECKPOINT_ID]
      : []),
  ];
  const legacyCheckpointScores: Record<string, number> =
    normalizedLegacy.completedCheckpoint
      ? { [ENGLISH_SECTION_ONE_CHECKPOINT_ID]: 100 }
      : {};

  return {
    courseId: "english",
    currentSectionId:
      existingState?.currentSectionId ?? ENGLISH_SECTION_ONE_ID,
    unlockedSectionIds: mergeUniqueIds(
      [ENGLISH_SECTION_ONE_ID],
      existingState?.unlockedSectionIds ?? []
    ),
    completedNodeIds: mergeUniqueIds(
      completedNodeIds,
      existingState?.completedNodeIds ?? []
    ),
    claimedRewardNodeIds: mergeUniqueIds(
      normalizedLegacy.claimedChests,
      existingState?.claimedRewardNodeIds ?? []
    ),
    checkpointScores: {
      ...legacyCheckpointScores,
      ...(existingState?.checkpointScores ?? {}),
    },
    onboardingStatus: existingState?.onboardingStatus ?? "completed",
    onboardingChoice: existingState?.onboardingChoice ?? null,
    onboardingCompletedAt:
      existingState?.onboardingCompletedAt ??
      normalizedLegacy.updatedAt ??
      new Date().toISOString(),
    updatedAt:
      existingState?.updatedAt ??
      normalizedLegacy.updatedAt ??
      new Date().toISOString(),
  };
};

export const projectCourseProgressToChapterOne = (
  state: CourseProgressState
): ChapterOneProgressState => {
  const lessonIds = new Set(
    chapterOneNodes
      .filter((node) => node.type === "lesson")
      .map((node) => node.id)
  );
  const chestIds = new Set(
    chapterOneNodes
      .filter((node) => node.type === "chest")
      .map((node) => node.id)
  );

  return normalizeChapterOneProgressState({
    completedLessons: state.completedNodeIds.filter((id) => lessonIds.has(id)),
    claimedChests: state.claimedRewardNodeIds.filter((id) => chestIds.has(id)),
    completedCheckpoint:
      state.completedNodeIds.includes(ENGLISH_SECTION_ONE_CHECKPOINT_ID) ||
      (state.checkpointScores[ENGLISH_SECTION_ONE_CHECKPOINT_ID] ?? 0) >= 70,
    updatedAt: state.updatedAt,
  });
};
