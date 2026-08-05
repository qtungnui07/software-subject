import {
  getLearningNodeById,
  getSectionById,
  getSectionForNode,
} from "@/lib/courses/course-catalog";
import {
  normalizeCourseProgressState,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import type {
  CourseDefinition,
  CourseId,
  LearningNodeDefinition,
} from "@/types/course";

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

const getOrderedSections = (
  courseId: CourseId,
  course: CourseDefinition,
) => {
  if (course.id !== courseId) return [];
  return [...course.sections].sort((left, right) => left.order - right.order);
};

export const getSectionOrder = (
  sectionId: string,
  course: CourseDefinition,
) => {
  return getSectionById(course, sectionId)?.order ?? null;
};

export const getUnlockedSectionIdsThrough = (
  courseId: CourseId,
  targetSectionId: string,
  course: CourseDefinition,
) => {
  const targetOrder = getSectionOrder(targetSectionId, course);
  if (targetOrder === null) return [];

  return getOrderedSections(courseId, course)
    .filter((section) => section.order <= targetOrder)
    .map((section) => section.id);
};

export const getHighestUnlockedSectionId = (
  state: CourseProgressState,
  course: CourseDefinition,
) => {
  const unlocked = new Set(state.unlockedSectionIds);
  return getOrderedSections(state.courseId, course)
    .filter((section) => unlocked.has(section.id))
    .at(-1)?.id ??
    getOrderedSections(state.courseId, course)[0]?.id ??
    state.currentSectionId;
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
  node: LearningNodeDefinition,
  course: CourseDefinition,
) => {
  if (!node.unlockAfterId) return true;

  const prerequisite = getLearningNodeById(course, node.unlockAfterId);
  return prerequisite ? isNodeCompleted(state, prerequisite) : false;
};

const getNextSectionForCheckpoint = (
  checkpointId: string,
  course: CourseDefinition,
) => {
  const section = getSectionForNode(course, checkpointId);
  if (!section) return null;

  return (
    getOrderedSections(section.courseId, course).find(
      (candidate) => candidate.order === section.order + 1,
    ) ?? null
  );
};

export const getCheckpointPrerequisiteNodeIds = (
  checkpointId: string,
  course: CourseDefinition,
) => {
  const checkpoint = getLearningNodeById(course, checkpointId);
  const section = getSectionForNode(course, checkpointId);
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
  course: CourseDefinition,
) => {
  const checkpoint = getLearningNodeById(course, checkpointId);
  const section = getSectionForNode(course, checkpointId);
  if (!checkpoint || checkpoint.type !== "checkpoint" || !section) return false;
  if (!isSectionUnlocked(state, section.id)) return false;

  if (state.completedNodeIds.includes(checkpoint.id)) return true;

  const nextSection = getNextSectionForCheckpoint(checkpoint.id, course);
  if (nextSection && isSectionUnlocked(state, nextSection.id)) return true;

  const prerequisiteIds = getCheckpointPrerequisiteNodeIds(
    checkpoint.id,
    course,
  );
  return (
    prerequisiteIds.length > 0 &&
    prerequisiteIds.every((nodeId) => state.completedNodeIds.includes(nodeId))
  );
};

export const canAccessCourseNode = (
  state: CourseProgressState,
  nodeId: string,
  course: CourseDefinition,
) => {
  const node = getLearningNodeById(course, nodeId);
  if (!node || node.type === "chest") return false;

  if (node.type === "checkpoint") {
    return canAttemptCheckpoint(state, node.id, course);
  }

  const section = getSectionForNode(course, nodeId);

  if (!section || !isSectionUnlocked(state, section.id)) return false;

  return (
    isNodeCompleted(state, node) ||
    isNodePrerequisiteSatisfied(state, node, course)
  );
};

export const applyPlacementUnlock = (
  state: CourseProgressState,
  targetSectionId: string,
  course: CourseDefinition,
) => {
  const target = getSectionById(course, targetSectionId);
  if (!target || target.courseId !== state.courseId) {
    return normalizeCourseProgressState(state, course);
  }

  const unlockedSectionIds = Array.from(
    new Set([
      ...state.unlockedSectionIds,
      ...getUnlockedSectionIdsThrough(state.courseId, target.id, course),
    ])
  );
  const hasLearningActivity =
    state.completedNodeIds.length > 0 ||
    state.claimedRewardNodeIds.length > 0 ||
    Object.keys(state.checkpointScores).length > 0;

  const currentSectionOrder =
    getSectionOrder(state.currentSectionId, course) ?? 1;
  const nextCurrentSectionId = hasLearningActivity || currentSectionOrder >= target.order
    ? state.currentSectionId
    : target.id;

  return normalizeCourseProgressState(
    {
      ...state,
      currentSectionId: nextCurrentSectionId,
      unlockedSectionIds,
      updatedAt: new Date().toISOString(),
    },
    course,
  );
};

export const selectCourseSection = (
  state: CourseProgressState,
  sectionId: string,
  course: CourseDefinition,
): CourseProgressMutationResult => {
  const section = getSectionById(course, sectionId);
  if (!section || section.courseId !== state.courseId) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "invalid-section" };
  }

  if (!isSectionUnlocked(state, sectionId)) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "locked-section" };
  }

  if (state.currentSectionId === sectionId) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "already-selected" };
  }

  return {
    progress: normalizeCourseProgressState(
      {
        ...state,
        currentSectionId: sectionId,
        updatedAt: new Date().toISOString(),
      },
      course,
    ),
    changed: true,
    reason: "updated",
  };
};

export const completeCourseNode = (
  state: CourseProgressState,
  nodeId: string,
  course: CourseDefinition,
): CourseProgressMutationResult => {
  const node = getLearningNodeById(course, nodeId);
  if (!node || node.type === "chest") {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "invalid-node" };
  }
  if (node.type === "checkpoint") {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "not-checkpoint" };
  }
  if (state.completedNodeIds.includes(node.id)) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "already-completed" };
  }
  if (!canAccessCourseNode(state, node.id, course)) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "locked-node" };
  }

  return {
    progress: normalizeCourseProgressState(
      {
        ...state,
        completedNodeIds: [...state.completedNodeIds, node.id],
        updatedAt: new Date().toISOString(),
      },
      course,
    ),
    changed: true,
    reason: "updated",
  };
};

export const recordCheckpointScore = (
  state: CourseProgressState,
  checkpointId: string,
  score: number,
  course: CourseDefinition,
): CourseProgressMutationResult => {
  const checkpoint = getLearningNodeById(course, checkpointId);
  if (!checkpoint) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "invalid-node" };
  }
  if (checkpoint.type !== "checkpoint") {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "not-checkpoint" };
  }
  if (!canAttemptCheckpoint(state, checkpoint.id, course)) {
    return { progress: normalizeCourseProgressState(state, course), changed: false, reason: "locked-node" };
  }

  const safeScore =
    Math.round(Math.min(100, Math.max(0, score)) * 100) / 100;
  const bestScore = Math.max(state.checkpointScores[checkpoint.id] ?? 0, safeScore);
  const section = getOrderedSections(state.courseId, course).find((item) =>
    item.chapter.nodes.some((node) => node.id === checkpoint.id)
  );
  const nextSection = section
    ? getOrderedSections(state.courseId, course).find((item) => item.order === section.order + 1)
    : undefined;
  const passed = bestScore >= CHECKPOINT_UNLOCK_THRESHOLD;
  const unlockedSectionIds = passed && nextSection
    ? Array.from(new Set([...state.unlockedSectionIds, nextSection.id]))
    : state.unlockedSectionIds;
  const completedNodeIds = passed
    ? Array.from(new Set([...state.completedNodeIds, checkpoint.id]))
    : state.completedNodeIds;

  const progress = normalizeCourseProgressState(
    {
      ...state,
      unlockedSectionIds,
      completedNodeIds,
      checkpointScores: {
        ...state.checkpointScores,
        [checkpoint.id]: bestScore,
      },
      updatedAt: new Date().toISOString(),
    },
    course,
  );

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
