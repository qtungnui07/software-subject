import {
  getCourseById,
  getLearningNodeById,
  getSectionById,
  getSectionForNode,
} from "@/lib/courses/course-catalog";
import {
  normalizeCourseProgressState,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import type { CourseId, LearningNodeDefinition } from "@/types/course";

export const CHECKPOINT_UNLOCK_THRESHOLD = 70;

export type CourseProgressMutationResult = {
  progress: CourseProgressState;
  changed: boolean;
  reason:
    | "updated"
    | "already-completed"
    | "already-selected"
    | "invalid-section"
    | "invalid-node"
    | "locked-section"
    | "locked-node"
    | "not-checkpoint";
  unlockedSectionId?: string;
};

const getOrderedSections = (courseId: CourseId) => {
  const course = getCourseById(courseId);
  return [...(course?.sections ?? [])].sort((left, right) => left.order - right.order);
};

export const getSectionOrder = (sectionId: string) => {
  return getSectionById(sectionId)?.order ?? null;
};

export const getUnlockedSectionIdsThrough = (
  courseId: CourseId,
  targetSectionId: string
) => {
  const targetOrder = getSectionOrder(targetSectionId);
  if (targetOrder === null) return [];

  return getOrderedSections(courseId)
    .filter((section) => section.order <= targetOrder)
    .map((section) => section.id);
};

export const getHighestUnlockedSectionId = (state: CourseProgressState) => {
  const unlocked = new Set(state.unlockedSectionIds);
  return getOrderedSections(state.courseId)
    .filter((section) => unlocked.has(section.id))
    .at(-1)?.id ?? getOrderedSections(state.courseId)[0]?.id ?? state.currentSectionId;
};

export const isSectionUnlocked = (
  state: CourseProgressState,
  sectionId: string
) => state.unlockedSectionIds.includes(sectionId);

const isNodeCompleted = (
  state: CourseProgressState,
  node: LearningNodeDefinition
) => {
  return node.type === "chest"
    ? state.claimedRewardNodeIds.includes(node.id)
    : state.completedNodeIds.includes(node.id);
};

export const isNodePrerequisiteSatisfied = (
  state: CourseProgressState,
  node: LearningNodeDefinition
) => {
  if (!node.unlockAfterId) return true;

  const prerequisite = getLearningNodeById(node.unlockAfterId);
  return prerequisite ? isNodeCompleted(state, prerequisite) : false;
};

const getNextSectionForCheckpoint = (checkpointId: string) => {
  const section = getSectionForNode(checkpointId);
  if (!section) return null;

  return (
    getOrderedSections(section.courseId).find(
      (candidate) => candidate.order === section.order + 1,
    ) ?? null
  );
};

export const getCheckpointPrerequisiteNodeIds = (checkpointId: string) => {
  const checkpoint = getLearningNodeById(checkpointId);
  const section = getSectionForNode(checkpointId);
  if (!checkpoint || checkpoint.type !== "checkpoint" || !section) return [];

  return section.chapter.nodes
    .filter(
      (node) =>
        node.order < checkpoint.order &&
        node.type === "lesson" &&
        node.countsTowardProgress,
    )
    .map((node) => node.id);
};

export const canAttemptCheckpoint = (
  state: CourseProgressState,
  checkpointId: string,
) => {
  const checkpoint = getLearningNodeById(checkpointId);
  const section = getSectionForNode(checkpointId);
  if (!checkpoint || checkpoint.type !== "checkpoint" || !section) return false;
  if (!isSectionUnlocked(state, section.id)) return false;

  if (state.completedNodeIds.includes(checkpoint.id)) return true;

  const nextSection = getNextSectionForCheckpoint(checkpoint.id);
  if (nextSection && isSectionUnlocked(state, nextSection.id)) return true;

  const prerequisiteIds = getCheckpointPrerequisiteNodeIds(checkpoint.id);
  return (
    prerequisiteIds.length > 0 &&
    prerequisiteIds.every((nodeId) => state.completedNodeIds.includes(nodeId))
  );
};

export const canAccessCourseNode = (
  state: CourseProgressState,
  nodeId: string
) => {
  const node = getLearningNodeById(nodeId);
  if (!node || node.type === "chest") return false;

  if (node.type === "checkpoint") {
    return canAttemptCheckpoint(state, node.id);
  }

  const section = getSectionForNode(nodeId);

  if (!section || !isSectionUnlocked(state, section.id)) return false;

  return isNodeCompleted(state, node) || isNodePrerequisiteSatisfied(state, node);
};

export const applyPlacementUnlock = (
  state: CourseProgressState,
  targetSectionId: string
) => {
  const target = getSectionById(targetSectionId);
  if (!target || target.courseId !== state.courseId) {
    return normalizeCourseProgressState(state);
  }

  const unlockedSectionIds = Array.from(
    new Set([
      ...state.unlockedSectionIds,
      ...getUnlockedSectionIdsThrough(state.courseId, target.id),
    ])
  );
  const hasLearningActivity =
    state.completedNodeIds.length > 0 ||
    state.claimedRewardNodeIds.length > 0 ||
    Object.keys(state.checkpointScores).length > 0;

  const currentSectionOrder = getSectionOrder(state.currentSectionId) ?? 1;
  const nextCurrentSectionId = hasLearningActivity || currentSectionOrder >= target.order
    ? state.currentSectionId
    : target.id;

  return normalizeCourseProgressState({
    ...state,
    currentSectionId: nextCurrentSectionId,
    unlockedSectionIds,
    updatedAt: new Date().toISOString(),
  });
};

export const selectCourseSection = (
  state: CourseProgressState,
  sectionId: string
): CourseProgressMutationResult => {
  const section = getSectionById(sectionId);
  if (!section || section.courseId !== state.courseId) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "invalid-section" };
  }

  if (!isSectionUnlocked(state, sectionId)) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "locked-section" };
  }

  if (state.currentSectionId === sectionId) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "already-selected" };
  }

  return {
    progress: normalizeCourseProgressState({
      ...state,
      currentSectionId: sectionId,
      updatedAt: new Date().toISOString(),
    }),
    changed: true,
    reason: "updated",
  };
};

export const completeCourseNode = (
  state: CourseProgressState,
  nodeId: string
): CourseProgressMutationResult => {
  const node = getLearningNodeById(nodeId);
  if (!node || node.type === "chest") {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "invalid-node" };
  }
  if (node.type === "checkpoint") {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "not-checkpoint" };
  }
  if (state.completedNodeIds.includes(node.id)) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "already-completed" };
  }
  if (!canAccessCourseNode(state, node.id)) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "locked-node" };
  }

  return {
    progress: normalizeCourseProgressState({
      ...state,
      completedNodeIds: [...state.completedNodeIds, node.id],
      updatedAt: new Date().toISOString(),
    }),
    changed: true,
    reason: "updated",
  };
};

export const recordCheckpointScore = (
  state: CourseProgressState,
  checkpointId: string,
  score: number
): CourseProgressMutationResult => {
  const checkpoint = getLearningNodeById(checkpointId);
  if (!checkpoint) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "invalid-node" };
  }
  if (checkpoint.type !== "checkpoint") {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "not-checkpoint" };
  }
  if (!canAttemptCheckpoint(state, checkpoint.id)) {
    return { progress: normalizeCourseProgressState(state), changed: false, reason: "locked-node" };
  }

  const safeScore =
    Math.round(Math.min(100, Math.max(0, score)) * 100) / 100;
  const bestScore = Math.max(state.checkpointScores[checkpoint.id] ?? 0, safeScore);
  const section = getOrderedSections(state.courseId).find((item) =>
    item.chapter.nodes.some((node) => node.id === checkpoint.id)
  );
  const nextSection = section
    ? getOrderedSections(state.courseId).find((item) => item.order === section.order + 1)
    : undefined;
  const passed = bestScore >= CHECKPOINT_UNLOCK_THRESHOLD;
  const unlockedSectionIds = passed && nextSection
    ? Array.from(new Set([...state.unlockedSectionIds, nextSection.id]))
    : state.unlockedSectionIds;
  const completedNodeIds = passed
    ? Array.from(new Set([...state.completedNodeIds, checkpoint.id]))
    : state.completedNodeIds;

  const progress = normalizeCourseProgressState({
    ...state,
    unlockedSectionIds,
    completedNodeIds,
    checkpointScores: {
      ...state.checkpointScores,
      [checkpoint.id]: bestScore,
    },
    updatedAt: new Date().toISOString(),
  });

  return {
    progress,
    changed:
      bestScore !== (state.checkpointScores[checkpoint.id] ?? 0) ||
      (passed && !state.completedNodeIds.includes(checkpoint.id)) ||
      Boolean(nextSection && !state.unlockedSectionIds.includes(nextSection.id)),
    reason: "updated",
    unlockedSectionId:
      passed && nextSection && !state.unlockedSectionIds.includes(nextSection.id)
        ? nextSection.id
        : undefined,
  };
};
